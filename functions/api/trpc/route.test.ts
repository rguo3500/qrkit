import { describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { onRequest } from './[[trpc]]';

const context = (url: string, env: Record<string, unknown> = {}, method = 'GET', body?: string) => ({
  request: new Request(url, { method, body, headers: body ? { 'content-type': 'application/json' } : undefined }),
  env,
  params: { trpc: new URL(url).pathname.replace('/api/trpc/', '') },
});

const tokenFor = (openId = 'open-1') => new SignJWT({ openId, name: 'QRKit user' })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('1h')
  .sign(new TextEncoder().encode('test-secret'));

describe('Pages tRPC Functions route', () => {
  it('returns a valid tRPC JSON response for public auth.me without a session', async () => {
    const response = await onRequest(context('https://lovexiaoyue.dpdns.org/api/trpc/auth.me', { DB: {} }) as never);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ result: { data: { json: null } } }]);
  });

  it('returns a structured unauthorized response for protected procedures', async () => {
    const response = await onRequest(context('https://lovexiaoyue.dpdns.org/api/trpc/dynamicQr.list', { DB: {} }) as never);
    expect(response.status).toBe(401);
    const body = await response.json() as Array<{ error?: { message?: string; code?: number; data?: { code?: string } } }>;
    expect(body[0]?.error?.message).toBe('Please login (10001)');
    expect(body[0]?.error?.code).toBe(-32001);
    expect(body[0]?.error?.data?.code).toBe('UNAUTHORIZED');
  });

  it('does not expose removed Team Workspace procedures', async () => {
    const response = await onRequest(context('https://lovexiaoyue.dpdns.org/api/trpc/team.list', { DB: {} }) as never);
    expect(response.status).toBe(401);
    expect((await response.json())[0]?.error?.data?.code).toBe('UNAUTHORIZED');
  });

  it('rejects non-http Dynamic QR destinations before database writes', async () => {
    const token = await tokenFor();
    const prepare = vi.fn((sql: string) => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => sql.includes('FROM users WHERE open_id') ? { id: 'user-1', openId: 'open-1', name: 'QRKit user', email: null, role: 'user' } : null),
        run: vi.fn(async () => ({ meta: { changes: 1 } })),
      })),
    }));
    const response = await onRequest({
      request: new Request('https://lovexiaoyue.dpdns.org/api/trpc/dynamicQr.create', { method: 'POST', headers: { cookie: `app_session_id=${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ 0: { json: { slug: 'bad', label: 'Bad', destination: 'javascript:alert(1)' } } }) }),
      env: { DB: { prepare, batch: vi.fn() }, JWT_SECRET: 'test-secret' },
      params: { trpc: 'dynamicQr.create' },
    } as never);
    expect(response.status).toBe(400);
    expect((await response.json())[0]?.error?.message).toBe('Invalid destination.');
    expect(prepare).toHaveBeenCalledTimes(2);
  });
});
