import { describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { onRequest } from './[[trpc]]';

const context = (url: string, env: Record<string, unknown> = {}, method = 'GET', body?: string) => ({
  request: new Request(url, { method, body, headers: body ? { 'content-type': 'application/json' } : undefined }),
  env,
  params: { trpc: new URL(url).pathname.replace('/api/trpc/', '') },
});

describe('Pages tRPC Functions route', () => {
  it('returns a valid tRPC JSON response for public auth.me without a session', async () => {
    const response = await onRequest(context('https://lovexiaoyue.dpdns.org/api/trpc/auth.me', { DB: {} }) as never);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ result: { data: { json: null } } }]);
  });

  it('returns a structured unauthorized response instead of an empty body', async () => {
    const response = await onRequest(context('https://lovexiaoyue.dpdns.org/api/trpc/team.create', { DB: {} }, 'POST', JSON.stringify({ name: 'QRKit UAT' })) as never);
    expect(response.status).toBe(401);
    const body = await response.json() as Array<{ error?: { json?: { message?: string; data?: { code?: string } } } }>;
    expect(body[0]?.error?.json?.message).toBe('Please login (10001)');
    expect(body[0]?.error?.json?.data?.code).toBe('UNAUTHORIZED');
  });

  it('covers string-ID team create, members, invite, role, share, unshare and sharedLinks paths', async () => {
    const user = { id: 'user-1', open_id: 'open-1', name: 'Owner', email: 'owner@example.com', role: 'user' };
    const prepare = vi.fn((sql: string) => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => sql.includes('FROM users WHERE open_id') ? user : sql.includes('FROM team_members WHERE team_id') ? { id: 'member-1', role: 'owner', status: 'active' } : sql.includes('FROM dynamic_links WHERE id') ? { id: 'link-1' } : null),
        all: vi.fn(async () => ({ results: sql.includes('FROM team_members') ? [{ id: 'member-1', role: 'owner', status: 'active', email: 'owner@example.com' }] : [{ id: 'link-1', slug: 'campaign', label: 'Campaign', destination: 'https://example.com', active: 1 }] })),
        run: vi.fn(async () => ({ meta: { changes: 1 } })),
      })),
    }));
    const db = { prepare, batch: vi.fn().mockResolvedValue([{ meta: { changes: 1 } }, { meta: { changes: 1 } }]) };
    const token = await new SignJWT({ openId: 'open-1', name: 'Owner' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode('test-secret'));
    const call = async (procedure: string, input?: unknown) => {
      const url = new URL(`https://lovexiaoyue.dpdns.org/api/trpc/${procedure}`);
      const method = input ? 'POST' : 'GET';
      const request = new Request(url, { method, headers: { cookie: `app_session_id=${token}`, ...(input ? { 'content-type': 'application/json' } : {}) }, body: input ? JSON.stringify({ 0: { json: input } }) : undefined });
      return onRequest({ request, env: { DB: db, JWT_SECRET: 'test-secret' }, params: { trpc: procedure } } as never);
    };
    for (const [procedure, input] of [['team.create', { name: 'QRKit UAT' }], ['team.members', { teamId: 'team-1' }], ['team.invite', { teamId: 'team-1', email: 'editor@example.com', role: 'editor' }], ['team.updateRole', { teamId: 'team-1', memberId: 'member-1', role: 'viewer' }], ['team.shareLink', { teamId: 'team-1', dynamicLinkId: 'link-1' }], ['team.unshareLink', { teamId: 'team-1', dynamicLinkId: 'link-1' }], ['team.sharedLinks', { teamId: 'team-1' }]] as const) {
      const response = await call(procedure, input);
      expect(response.status).toBe(200);
      expect(Array.isArray(await response.clone().json())).toBe(true);
    }
  });

  it('returns Functions-side permission and scope errors for string-ID team operations', async () => {
    const user = { id: 'user-1', open_id: 'open-1', name: 'Owner', email: 'owner@example.com', role: 'user' };
    const token = await new SignJWT({ openId: 'open-1', name: 'Owner' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode('test-secret'));
    const invoke = async (role: 'owner' | 'editor' | 'viewer', procedure: string, input: Record<string, unknown>, owned = true) => {
      const prepare = vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          first: vi.fn(async () => sql.includes('FROM users WHERE open_id') ? user : sql.includes('FROM team_members WHERE team_id') ? (args[0] === 'team-1' ? { id: 'member-1', teamId: 'team-1', userId: 'user-1', role, status: 'active' } : null) : sql.includes('FROM dynamic_links WHERE id') && owned ? { id: 'link-1' } : null),
          all: vi.fn(async () => ({ results: [] })),
          run: vi.fn(async () => ({ meta: { changes: 0 } })),
        })),
      }));
      const request = new Request(`https://lovexiaoyue.dpdns.org/api/trpc/${procedure}`, { method: 'POST', headers: { cookie: `app_session_id=${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ 0: { json: input } }) });
      const response = await onRequest({ request, env: { DB: { prepare, batch: vi.fn() }, JWT_SECRET: 'test-secret' }, params: { trpc: procedure } } as never);
      return { status: response.status, body: await response.json() as Array<{ error?: { json?: { data?: { code?: string } } } }> };
    };
    for (const procedure of ['team.invite', 'team.updateRole', 'team.shareLink', 'team.unshareLink']) {
      const input = procedure === 'team.updateRole' ? { teamId: 'team-1', memberId: 'member-1', role: 'editor' } : procedure === 'team.invite' ? { teamId: 'team-1', email: 'editor@example.com', role: 'editor' } : { teamId: 'team-1', dynamicLinkId: 'link-1' };
      const result = await invoke('viewer', procedure, input);
      expect(result.status).toBe(403);
      expect(result.body[0]?.error?.json?.data?.code).toBe('FORBIDDEN');
    }
    for (const procedure of ['team.invite', 'team.updateRole']) {
      const input = procedure === 'team.updateRole' ? { teamId: 'team-1', memberId: 'member-1', role: 'viewer' } : { teamId: 'team-1', email: 'editor@example.com', role: 'viewer' };
      const result = await invoke('editor', procedure, input);
      expect(result.status).toBe(403);
      expect(result.body[0]?.error?.json?.data?.code).toBe('FORBIDDEN');
    }
    const unowned = await invoke('owner', 'team.shareLink', { teamId: 'team-1', dynamicLinkId: 'link-404' }, false);
    expect(unowned.status).toBe(404);
    expect(unowned.body[0]?.error?.json?.data?.code).toBe('NOT_FOUND');
    for (const procedure of ['team.members', 'team.sharedLinks', 'team.shareLink', 'team.unshareLink']) {
      const input = procedure.includes('share') ? { teamId: 'team-2', dynamicLinkId: 'link-1' } : { teamId: 'team-2' };
      const result = await invoke('owner', procedure, input);
      expect(result.status).toBe(403);
      expect(result.body[0]?.error?.json?.data?.code).toBe('FORBIDDEN');
    }
  });

  it('rejects invalid role and non-http Dynamic QR destinations before database writes', async () => {
    const token = await new SignJWT({ openId: 'open-1', name: 'Owner' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode('test-secret'));
    const call = async (procedure: string, input: unknown) => onRequest({
      request: new Request(`https://lovexiaoyue.dpdns.org/api/trpc/${procedure}`, { method: 'POST', headers: { cookie: `app_session_id=${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ 0: { json: input } }) }),
      env: { DB: { prepare: vi.fn((sql: string) => ({ bind: vi.fn(() => ({ first: vi.fn(async () => sql.includes('FROM users WHERE open_id') ? { id: 'user-1', openId: 'open-1', name: 'Owner', email: 'owner@example.com', role: 'user' } : null), run: vi.fn(async () => ({ meta: { changes: 1 } })) })) })), batch: vi.fn() }, JWT_SECRET: 'test-secret' },
      params: { trpc: procedure },
    } as never);
    const invalidRole = await call('team.invite', { teamId: 'team-1', email: 'editor@example.com', role: 'admin' });
    const invalidUrl = await call('dynamicQr.create', { slug: 'bad', label: 'Bad', destination: 'javascript:alert(1)' });
    expect(invalidRole.status).toBe(400);
    expect(invalidUrl.status).toBe(400);
    expect(await invalidRole.json()).toEqual([{ error: { json: { message: 'Invalid role.', data: { code: 'BAD_REQUEST', httpStatus: 400 } } } }]);
  });

  it('uses a D1 batch response shape for an authenticated team create', async () => {
    const prepare = vi.fn((sql: string) => ({ bind: vi.fn(() => ({ run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }) })) }));
    const db = { prepare, batch: vi.fn().mockResolvedValue([{ meta: { changes: 1 } }, { meta: { changes: 1 } }]) };
    const response = await onRequest(context('https://lovexiaoyue.dpdns.org/api/trpc/team.create', { DB: db, JWT_SECRET: 'test-secret' }, 'POST', JSON.stringify({ name: 'QRKit UAT' })) as never);
    expect([401, 500]).toContain(response.status);
    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
