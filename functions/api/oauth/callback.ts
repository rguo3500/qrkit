import { SignJWT } from "jose";
import { decodeOAuthState } from "../../../shared/const";

type D1Database = any;
type Env = {
  DB: D1Database;
  JWT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
};

const SESSION_COOKIE = "app_session_id";
const STATE_COOKIE = "__Host-oauth_state";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function cookieValue(request: Request, name: string) {
  const entry = (request.headers.get("cookie") ?? "")
    .split(";")
    .map(item => item.trim())
    .find(item => item.startsWith(`${name}=`));
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

const response = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return response({ error: "code and state are required" }, 400);

  const parsedState = decodeOAuthState(state);
  const expectedNonce = cookieValue(request, STATE_COOKIE);
  if (!parsedState.nonce || !expectedNonce || parsedState.nonce !== expectedNonce) {
    return response({ error: "invalid oauth state" }, 403);
  }

  if (
    !env.JWT_SECRET ||
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REDIRECT_URI ||
    !env.DB
  ) {
    return response({ error: "OAuth runtime is not configured" }, 500);
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) return response({ error: "OAuth token exchange failed" }, 502);

    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) return response({ error: "OAuth access token missing" }, 502);

    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    if (!userResponse.ok) return response({ error: "OAuth user lookup failed" }, 502);

    const info = (await userResponse.json()) as {
      sub?: string;
      name?: string;
      email?: string;
      email_verified?: boolean;
    };
    if (!info.sub) return response({ error: "Google subject missing from user info" }, 400);

    const timestamp = new Date().toISOString();
    const openId = `google:${info.sub}`;
    const userId = `oauth-${openId}`;
    await env.DB
      .prepare(
        "INSERT INTO users (id, open_id, name, email, login_method, role, created_at, updated_at, last_signed_in) VALUES (?1, ?2, ?3, ?4, ?5, 'user', ?6, ?6, ?6) ON CONFLICT(open_id) DO UPDATE SET name = excluded.name, email = excluded.email, login_method = excluded.login_method, updated_at = excluded.updated_at, last_signed_in = excluded.last_signed_in",
      )
      .bind(
        userId,
        openId,
        info.name ?? info.email ?? "Google user",
        info.email ?? null,
        "google",
        timestamp,
      )
      .run();

    const session = await new SignJWT({
      openId,
      appId: env.GOOGLE_CLIENT_ID,
      name: info.name ?? info.email ?? "Google user",
      email: info.email ?? "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(`${ONE_YEAR_SECONDS}s`)
      .sign(new TextEncoder().encode(env.JWT_SECRET));

    const fallback = `${url.origin}/`;
    const headers = new Headers({
      location: redirectLocation(parsedState.redirectUri, fallback),
    });
    headers.append(
      "set-cookie",
      `${SESSION_COOKIE}=${encodeURIComponent(session)}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    );
    headers.append(
      "set-cookie",
      `${STATE_COOKIE}=; Max-Age=0; Path=/; Secure; SameSite=Lax`,
    );
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("[Pages Google OAuth] callback failed", error);
    return response({ error: "OAuth callback failed" }, 500);
  }
};
