import { jwtVerify } from 'jose';

type D1Database = any;
type Env = { DB: D1Database; JWT_SECRET?: string; VITE_APP_ID?: string };
type User = { id: string; openId: string; name: string; email: string | null; role: string };
type TeamRole = 'owner' | 'editor' | 'viewer';

const COOKIE_NAME = 'app_session_id';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const ok = (data: unknown) => json([{ result: { data: { json: data } } }]);
const fail = (message: string, code = 'BAD_REQUEST', status = 400) => json([{ error: { json: { message, data: { code, httpStatus: status } } } }], status);
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Object.assign(new Error('Invalid JSON input.'), { code: 'BAD_REQUEST', status: 400 });
  return value as Record<string, unknown>;
}
function text(value: unknown, field: string, max: number, required = true) {
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) throw Object.assign(new Error(`Invalid ${field}.`), { code: 'BAD_REQUEST', status: 400 });
  return value.trim();
}
function idText(value: unknown, field: string) { return text(value, field, 160); }
function role(value: unknown): TeamRole {
  if (value !== 'owner' && value !== 'editor' && value !== 'viewer') throw Object.assign(new Error('Invalid role.'), { code: 'BAD_REQUEST', status: 400 });
  return value;
}
function email(value: unknown) {
  const normalized = text(value, 'email', 320)!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw Object.assign(new Error('Invalid email.'), { code: 'BAD_REQUEST', status: 400 });
  return normalized;
}
function httpsUrl(value: unknown, field: string) {
  const raw = text(value, field, 2048)!;
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw Object.assign(new Error(`Invalid ${field}.`), { code: 'BAD_REQUEST', status: 400 }); }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw Object.assign(new Error(`Invalid ${field}.`), { code: 'BAD_REQUEST', status: 400 });
  return parsed.toString();
}

function cookies(request: Request) {
  return Object.fromEntries((request.headers.get('cookie') ?? '').split(';').filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

async function currentUser(request: Request, env: Env): Promise<User | null> {
  const token = cookies(request)[COOKIE_NAME] ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET), { algorithms: ['HS256'] });
    const openId = typeof payload.openId === 'string' ? payload.openId : '';
    if (!openId) return null;
    const existing = await env.DB.prepare('SELECT id, open_id AS openId, name, email, role FROM users WHERE open_id = ?1 LIMIT 1').bind(openId).first<User>();
    if (existing) {
      await env.DB.prepare('UPDATE users SET last_signed_in = ?1, updated_at = ?1 WHERE id = ?2').bind(now(), existing.id).run();
      return existing;
    }
    const created: User = { id: id(), openId, name: typeof payload.name === 'string' ? payload.name : '', email: null, role: 'user' };
    const timestamp = now();
    await env.DB.prepare('INSERT INTO users (id, open_id, name, email, role, created_at, updated_at, last_signed_in) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6, ?6)').bind(created.id, created.openId, created.name, null, created.role, timestamp).run();
    return created;
  } catch {
    return null;
  }
}

async function requireUser(request: Request, env: Env) {
  const user = await currentUser(request, env);
  if (!user) throw Object.assign(new Error('Please login (10001)'), { code: 'UNAUTHORIZED', status: 401 });
  return user;
}

async function inputOf(request: Request, url: URL) {
  if (request.method === 'GET') {
    const raw = url.searchParams.get('input');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed?.['0']?.json ?? parsed?.json ?? parsed;
  }
  const body = await request.json() as Record<string, unknown>;
  return body?.['0'] && typeof body['0'] === 'object' ? (body['0'] as Record<string, unknown>).json : body;
}

async function membership(env: Env, userId: string, teamId: string) {
  return env.DB.prepare('SELECT id, team_id AS teamId, user_id AS userId, email, role, status FROM team_members WHERE team_id = ?1 AND user_id = ?2 AND status = \'active\' LIMIT 1').bind(teamId, userId).first<{ id: string; teamId: string; userId: string; email: string; role: TeamRole; status: string }>();
}
function canShare(role: TeamRole) { return role === 'owner' || role === 'editor'; }
function canManage(role: TeamRole) { return role === 'owner'; }

async function handle(procedure: string, input: any, request: Request, env: Env) {
  if (procedure === 'auth.me') return currentUser(request, env);
  const user = await requireUser(request, env);
  const payload = record(input);
  if (procedure.startsWith('dynamicQr.')) {
    if (procedure === 'dynamicQr.create') {
      text(payload.slug, 'slug', 120);
      text(payload.label, 'label', 160);
      httpsUrl(payload.destination, 'destination');
    } else if (['dynamicQr.stats', 'dynamicQr.update', 'dynamicQr.remove'].includes(procedure)) {
      idText(payload.id, 'id');
      if (procedure === 'dynamicQr.update') {
        text(payload.label, 'label', 160, false);
        if (payload.destination !== undefined) httpsUrl(payload.destination, 'destination');
        if (payload.active !== undefined && typeof payload.active !== 'boolean') throw Object.assign(new Error('Invalid active flag.'), { code: 'BAD_REQUEST', status: 400 });
      }
    }
  }
  if (procedure === 'team.create') text(payload.name, 'name', 160);
  if (procedure === 'team.invite') { idText(payload.teamId, 'teamId'); email(payload.email); role(payload.role); }
  if (procedure === 'team.updateRole') { idText(payload.teamId, 'teamId'); idText(payload.memberId, 'memberId'); role(payload.role); }
  if (procedure === 'team.members' || procedure === 'team.sharedLinks') idText(payload.teamId, 'teamId');
  if (procedure === 'team.shareLink' || procedure === 'team.unshareLink') { idText(payload.teamId, 'teamId'); idText(payload.dynamicLinkId, 'dynamicLinkId'); }
  if (procedure === 'dynamicQr.list') return env.DB.prepare('SELECT id, slug, label, destination, active, created_at AS createdAt, updated_at AS updatedAt FROM dynamic_links WHERE user_id = ?1 ORDER BY created_at DESC').bind(user.id).all().then(result => result.results);
  if (procedure === 'dynamicQr.stats') {
    const link = await env.DB.prepare('SELECT id FROM dynamic_links WHERE id = ?1 AND user_id = ?2 LIMIT 1').bind(String(payload.id), user.id).first();
    if (!link) throw Object.assign(new Error('Dynamic QR link not found.'), { code: 'NOT_FOUND', status: 404 });
    const dynamicLinkId = String(payload.id);
    const [summary, dailyRows, recentRows] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS totalScans, MAX(created_at) AS lastScanAt FROM scan_events WHERE dynamic_link_id = ?1').bind(dynamicLinkId).first<{ totalScans: number; lastScanAt: string | null }>(),
      env.DB.prepare("SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS scans FROM scan_events WHERE dynamic_link_id = ?1 AND created_at >= datetime('now', '-13 days') GROUP BY substr(created_at, 1, 10) ORDER BY date ASC").bind(dynamicLinkId).all<{ date: string; scans: number }>(),
      env.DB.prepare('SELECT created_at AS createdAt, user_agent AS userAgent, referrer, country FROM scan_events WHERE dynamic_link_id = ?1 ORDER BY created_at DESC LIMIT 8').bind(dynamicLinkId).all(),
    ]);
    const byDate = new Map((dailyRows.results ?? []).map(row => [row.date, Number(row.scans)]));
    const daily = Array.from({ length: 14 }, (_, offset) => {
      const date = new Date(Date.now() - (13 - offset) * 86_400_000).toISOString().slice(0, 10);
      return { date, scans: byDate.get(date) ?? 0 };
    });
    return { totalScans: Number(summary?.totalScans ?? 0), lastScanAt: summary?.lastScanAt ?? null, daily, recent: recentRows.results ?? [] };
  }
  if (procedure === 'dynamicQr.create') {
    const timestamp = now();
    const record = { id: id(), user_id: user.id, slug: payload.slug as string, label: payload.label as string, destination: payload.destination as string, active: payload.active === false ? 0 : 1, created_at: timestamp, updated_at: timestamp };
    await env.DB.prepare('INSERT INTO dynamic_links (id, user_id, qr_code_id, slug, label, destination, active, created_at, updated_at) VALUES (?1, ?2, ?1, ?3, ?4, ?5, ?6, ?7, ?7)').bind(record.id, record.user_id, record.slug, record.label, record.destination, record.active, timestamp).run();
    return { ...record, active: Boolean(record.active) };
  }
  if (procedure === 'dynamicQr.update') {
    const existing = await env.DB.prepare('SELECT id FROM dynamic_links WHERE id = ?1 AND user_id = ?2 LIMIT 1').bind(String(payload.id), user.id).first();
    if (!existing) throw Object.assign(new Error('Dynamic QR link not found.'), { code: 'NOT_FOUND', status: 404 });
    const fields: string[] = []; const values: unknown[] = [];
    for (const key of ['label', 'destination', 'active'] as const) if (payload[key] !== undefined) { fields.push(`${key} = ?`); values.push(key === 'active' ? (payload[key] ? 1 : 0) : payload[key]); }
    fields.push('updated_at = ?'); values.push(now(), String(payload.id), user.id);
    await env.DB.prepare(`UPDATE dynamic_links SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).bind(...values).run();
    return env.DB.prepare('SELECT id, slug, label, destination, active, created_at AS createdAt, updated_at AS updatedAt FROM dynamic_links WHERE id = ?1').bind(String(payload.id)).first();
  }
  if (procedure === 'dynamicQr.remove') {
    await env.DB.prepare('DELETE FROM dynamic_links WHERE id = ?1 AND user_id = ?2').bind(String(payload.id), user.id).run();
    return { success: true };
  }
  if (procedure === 'team.list') return env.DB.prepare('SELECT t.id, t.name, tm.role, tm.status, t.created_at AS createdAt FROM team_members tm INNER JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = ?1 AND tm.status = \'active\' ORDER BY t.created_at DESC').bind(user.id).all().then(result => result.results);
  if (procedure === 'team.create') {
    const teamId = id(); const memberId = id(); const timestamp = now();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO teams (id, name, owner_user_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)').bind(teamId, payload.name, user.id, timestamp),
      env.DB.prepare('INSERT INTO team_members (id, team_id, user_id, email, role, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, \'owner\', \'active\', ?5, ?5)').bind(memberId, teamId, user.id, user.email ?? `user-${user.id}@local.invalid`, timestamp),
    ]);
    return { id: teamId, name: payload.name, role: 'owner' };
  }
  const teamId = String(input?.teamId ?? '');
  const current = await membership(env, user.id, teamId);
  if (!current) throw Object.assign(new Error('FORBIDDEN'), { code: 'FORBIDDEN', status: 403 });
  if (procedure === 'team.members') return env.DB.prepare('SELECT id, email, role, status, user_id AS userId, created_at AS createdAt FROM team_members WHERE team_id = ?1 ORDER BY created_at ASC').bind(teamId).all().then(result => result.results);
  if (procedure === 'team.invite') {
    if (!canManage(current.role)) throw Object.assign(new Error('FORBIDDEN'), { code: 'FORBIDDEN', status: 403 });
    const memberId = id(); const timestamp = now(); const email = String(payload.email).toLowerCase();
    await env.DB.prepare('INSERT INTO team_members (id, team_id, email, role, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, \'pending\', ?5, ?5) ON CONFLICT(team_id, email) DO UPDATE SET role = excluded.role, status = \'pending\', updated_at = excluded.updated_at').bind(memberId, teamId, email, payload.role, timestamp).run();
    return { email, role: payload.role, status: 'pending' };
  }
  if (procedure === 'team.updateRole') {
    if (!canManage(current.role)) throw Object.assign(new Error('FORBIDDEN'), { code: 'FORBIDDEN', status: 403 });
    const result = await env.DB.prepare('UPDATE team_members SET role = ?1, updated_at = ?2 WHERE id = ?3 AND team_id = ?4').bind(payload.role, now(), String(payload.memberId), teamId).run();
    return { updated: result.meta.changes > 0 };
  }
  if (procedure === 'team.shareLink') {
    if (!canShare(current.role)) throw Object.assign(new Error('FORBIDDEN'), { code: 'FORBIDDEN', status: 403 });
    const owned = await env.DB.prepare('SELECT id FROM dynamic_links WHERE id = ?1 AND user_id = ?2 LIMIT 1').bind(String(payload.dynamicLinkId), user.id).first();
    if (!owned) throw Object.assign(new Error('NOT_FOUND'), { code: 'NOT_FOUND', status: 404 });
    await env.DB.prepare('INSERT INTO dynamic_link_shares (id, team_id, dynamic_link_id, granted_by_user_id, created_at) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(team_id, dynamic_link_id) DO UPDATE SET granted_by_user_id = excluded.granted_by_user_id').bind(id(), teamId, String(payload.dynamicLinkId), user.id, now()).run();
    return { teamId, dynamicLinkId: String(payload.dynamicLinkId), shared: true };
  }
  if (procedure === 'team.unshareLink') {
    if (!canShare(current.role)) throw Object.assign(new Error('FORBIDDEN'), { code: 'FORBIDDEN', status: 403 });
    const result = await env.DB.prepare('DELETE FROM dynamic_link_shares WHERE team_id = ?1 AND dynamic_link_id = ?2').bind(teamId, String(payload.dynamicLinkId)).run();
    return { teamId, dynamicLinkId: String(payload.dynamicLinkId), removed: result.meta.changes > 0 };
  }
  if (procedure === 'team.sharedLinks') return env.DB.prepare('SELECT dl.id, dl.slug, dl.label, dl.destination, dl.active FROM dynamic_link_shares ds INNER JOIN dynamic_links dl ON dl.id = ds.dynamic_link_id WHERE ds.team_id = ?1 ORDER BY ds.created_at DESC').bind(teamId).all().then(result => result.results);
  throw Object.assign(new Error(`Unknown procedure: ${procedure}`), { code: 'NOT_FOUND', status: 404 });
}

export const onRequest = async ({ request, env, params }: { request: Request; env: Env; params: Record<string, string | string[]> }) => {
  const procedure = Array.isArray(params.trpc) ? params.trpc.join('/') : String(params.trpc ?? '');
  try {
    const input = await inputOf(request, new URL(request.url));
    return ok(await handle(procedure, input, request, env));
  } catch (error) {
    const value = error as { message?: string; code?: string; status?: number };
    return fail(value.message ?? 'Request failed', value.code ?? 'INTERNAL_SERVER_ERROR', value.status ?? 500);
  }
};
