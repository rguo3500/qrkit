import { describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { onRequest } from './trpc/[[trpc]]';
import { onRequestGet } from '../r/[id]';

const tokenFor = () => new SignJWT({ openId: 'open-1', name: 'Owner' })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('1h')
  .sign(new TextEncoder().encode('test-secret'));

describe('Pages Dynamic QR production safeguards', () => {
  it('returns an exact total, 14-day trend and bounded recent visits', async () => {
    const user = { id: 'user-1', open_id: 'open-1', name: 'Owner', email: 'owner@example.com', role: 'user' };
    const prepare = vi.fn((sql: string) => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => {
          if (sql.includes('FROM users WHERE open_id')) return user;
          if (sql.includes('COUNT(*) AS totalScans')) return { totalScans: 301, lastScanAt: '2026-08-16T01:00:00.000Z' };
          if (sql.includes('FROM dynamic_links WHERE id')) return { id: 'link-1' };
          return null;
        }),
        all: vi.fn(async () => {
          if (sql.includes('substr(created_at')) return { results: [{ date: '2026-08-16', scans: 7 }] };
          return { results: [{ createdAt: '2026-08-16T01:00:00.000Z', country: 'US', referrer: null, userAgent: 'test' }] };
        }),
        run: vi.fn(async () => ({ meta: { changes: 1 } })),
      })),
    }));
    const token = await tokenFor();
    const request = new Request('https://lovexiaoyue.dpdns.org/api/trpc/dynamicQr.stats', {
      method: 'POST',
      headers: { cookie: `app_session_id=${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ 0: { json: { id: 'link-1' } } }),
    });
    const response = await onRequest({ request, env: { DB: { prepare }, JWT_SECRET: 'test-secret' }, params: { trpc: 'dynamicQr.stats' } } as never);
    const body = await response.json() as Array<{ result?: { data: { json: { totalScans: number; daily: unknown[]; recent: unknown[] } } }; error?: unknown }>;
    const stats = body[0].result!.data.json;
    expect(response.status).toBe(200);
    expect(stats.totalScans).toBe(301);
    expect(stats.daily).toHaveLength(14);
    expect(stats.recent).toHaveLength(1);
  });

  it('continues the redirect when scan-event persistence fails', async () => {
    const prepare = vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn().mockResolvedValue({ id: 'link-1', qr_code_id: 'qr-1', destination: 'https://example.com/target', active: 1 }),
        run: vi.fn().mockRejectedValue(new Error('D1 unavailable')),
      })),
    }));
    const response = await onRequestGet({
      request: new Request('https://lovexiaoyue.dpdns.org/r/link-1'),
      env: { DB: { prepare } },
      params: { id: 'link-1' },
    } as never);
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.com/target');
  });
});
