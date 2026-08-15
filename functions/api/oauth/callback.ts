import { SignJWT } from 'jose';

type D1Database = any;
type Env = { DB: D1Database; JWT_SECRET?: string; VITE_APP_ID?: string; OAUTH_SERVER_URL?: string };
const SESSION_COOKIE = 'app_session_id';
const STATE_COOKIE = '__Host-oauth_state';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function decodeState(value: string) {
  try {
    const decoded = atob(value);
    const parsed = JSON.parse(decoded) as { redirectUri?: string; nonce?: string };
    return parsed && typeof parsed.redirectUri === 'string' ? parsed : { redirectUri: '' };
  } catch {
    return { redirectUri: '' };
  }
}
function cookieValue(request: Request, name: string) {
  const entry = (request.headers.get('cookie') ?? '').split(';').map(item => item.trim()).find(item => item.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}
function redirectLocation(value: string, fallback: string) {
  try {
    const url = new URL(value || fallback);
    return url.origin === new URL(fallback).origin ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}
const response = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return response({ error: 'code and state are required' }, 400);
  const parsedState = decodeState(state);
  const expectedNonce = cookieValue(request, STATE_COOKIE);
  if (!parsedState.nonce || !expectedNonce || parsedState.nonce !== expectedNonce) return response({ error: 'invalid oauth state' }, 403);
  if (!env.JWT_SECRET || !env.VITE_APP_ID || !env.OAUTH_SERVER_URL || !env.DB) return response({ error: 'OAuth runtime is not configured' }, 500);

  try {
    const base = env.OAUTH_SERVER_URL.replace(/\/+$/, '');
    const tokenResponse = await fetch(`${base}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: env.VITE_APP_ID, grantType: 'authorization_code', code, redirectUri: parsedState.redirectUri }),
    });
    if (!tokenResponse.ok) return response({ error: 'OAuth token exchange failed' }, 502);
    const token = await tokenResponse.json() as { accessToken?: string };
    if (!token.accessToken) return response({ error: 'OAuth access token missing' }, 502);
    const userResponse = await fetch(`${base}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ accessToken: token.accessToken }),
    });
    if (!userResponse.ok) return response({ error: 'OAuth user lookup failed' }, 502);
    const info = await userResponse.json() as { openId?: string; name?: string; email?: string; platform?: string; loginMethod?: string };
    if (!info.openId) return response({ error: 'openId missing from user info' }, 400);

    const timestamp = new Date().toISOString();
    const userId = `oauth-${info.openId}`;
    await env.DB.prepare('INSERT INTO users (id, open_id, name, email, login_method, role, created_at, updated_at, last_signed_in) VALUES (?1, ?2, ?3, ?4, ?5, \'user\', ?6, ?6, ?6) ON CONFLICT(open_id) DO UPDATE SET name = excluded.name, email = excluded.email, login_method = excluded.login_method, updated_at = excluded.updated_at, last_signed_in = excluded.last_signed_in').bind(userId, info.openId, info.name ?? '', info.email ?? null, info.loginMethod ?? info.platform ?? null, timestamp).run();
    const session = await new SignJWT({ openId: info.openId, appId: env.VITE_APP_ID, name: info.name ?? '' }).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setExpirationTime(`${ONE_YEAR_SECONDS}s`).sign(new TextEncoder().encode(env.JWT_SECRET));
    const headers = new Headers({ location: redirectLocation(parsedState.redirectUri, url.origin) });
    headers.append('set-cookie', `${SESSION_COOKIE}=${encodeURIComponent(session)}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; HttpOnly; Secure; SameSite=None`);
    headers.append('set-cookie', `${STATE_COOKIE}=; Max-Age=0; Path=/; Secure; SameSite=None`);
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error('[Pages OAuth] callback failed', error);
    return response({ error: 'OAuth callback failed' }, 500);
  }
};
