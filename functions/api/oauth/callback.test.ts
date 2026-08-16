import { describe, expect, it, vi, afterEach } from "vitest";
import { encodeOAuthState } from "../../../shared/const";
import { onRequest } from "./callback";

afterEach(() => vi.restoreAllMocks());

const env = (overrides: Record<string, unknown> = {}) => ({
  DB: { prepare: vi.fn(() => ({ bind: vi.fn(() => ({ run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }) })) })) },
  JWT_SECRET: "test-secret",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REDIRECT_URI: "https://lovexiaoyue.dpdns.org/api/oauth/callback",
  ...overrides,
});

const requestFor = (state: string, cookie = "nonce-1") =>
  new Request(`https://lovexiaoyue.dpdns.org/api/oauth/callback?code=code-1&state=${encodeURIComponent(state)}`, {
    headers: { cookie: `__Host-oauth_state=${cookie}` },
  });

describe("Google OAuth Pages callback", () => {
  it("returns a structured error when Google configuration is incomplete", async () => {
    const state = encodeOAuthState({ redirectUri: "https://lovexiaoyue.dpdns.org/", nonce: "nonce-1" });
    const response = await onRequest({ request: requestFor(state), env: env({ GOOGLE_CLIENT_SECRET: undefined }) } as never);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "OAuth runtime is not configured" });
  });

  it("rejects a mismatched OAuth nonce before contacting Google", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const state = encodeOAuthState({ redirectUri: "https://lovexiaoyue.dpdns.org/", nonce: "wrong" });
    const response = await onRequest({ request: requestFor(state), env: env() } as never);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "invalid oauth state" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a Google identity without a verified email", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ sub: "sub-1", name: "QRKit Owner", email: "owner@example.com", email_verified: false }), { status: 200 }));
    const state = encodeOAuthState({ redirectUri: "https://lovexiaoyue.dpdns.org/api/oauth/callback", returnTo: "https://lovexiaoyue.dpdns.org/dynamic-qr", nonce: "nonce-1" });
    const response = await onRequest({ request: requestFor(state), env: env() } as never);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Google email is not verified" });
  });

  it("exchanges Google code, upserts the user, and creates the QRKit session", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ sub: "sub-1", name: "QRKit Owner", email: "owner@example.com", email_verified: true }), { status: 200 }));
    const state = encodeOAuthState({ redirectUri: "https://lovexiaoyue.dpdns.org/api/oauth/callback", returnTo: "https://lovexiaoyue.dpdns.org/dynamic-qr", nonce: "nonce-1" });
    const response = await onRequest({ request: requestFor(state), env: env() } as never);
    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toMatch(/^https:\/\/lovexiaoyue\.dpdns\.org\/dynamic-qr#oauth_session=/);
    expect(response.headers.get("set-cookie")).toContain("app_session_id=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=None");
    expect((env().DB as never)).toBeDefined();
  });
});
