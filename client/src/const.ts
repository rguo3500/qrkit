import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
let loginRedirectStarted = false;

// Start Google OAuth from an event handler or redirect effect only. The nonce
// is written immediately before navigation so it stays paired with `state`.
export const startLogin = (options?: { force?: boolean }) => {
  if (loginRedirectStarted && !options?.force) return;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("VITE_GOOGLE_CLIENT_ID is not configured");
    return;
  }

  loginRedirectStarted = true;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const returnTo = window.location.href;
  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=Lax; Secure`;
  const state = encodeOAuthState({ redirectUri, returnTo, nonce });

  const url = new URL(GOOGLE_AUTHORIZATION_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  window.location.href = url.toString();
};
