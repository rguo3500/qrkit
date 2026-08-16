# Audit Reference Notes

## RFC 7636 — PKCE
Source: https://datatracker.ietf.org/doc/html/rfc7636

RFC 7636 states that OAuth 2.0 public clients using the Authorization Code Grant are susceptible to authorization-code interception and defines PKCE as the mitigation. It specifies that the client creates a verifier and challenge, sends the challenge in the authorization request, then sends the verifier to the token endpoint for verification.

## Google OpenID Connect
Source: https://developers.google.com/identity/openid-connect/openid-connect

Google's official OpenID Connect documentation describes the server flow as: create anti-forgery state, send the authorization request, confirm state, exchange the code for tokens, obtain user information or validate the ID token, and authenticate the user. It documents the `email` and `email_verified` claims when the email scope is requested and recommends established libraries because of the security implications of implementing the flow.

## Cloudflare Pages Redirects
Source: https://developers.cloudflare.com/pages/configuration/redirects/

Cloudflare documents `_redirects` as a static asset rule file and warns that redirects do not apply to requests served by Pages Functions when a Function route matches. The document specifies the `_redirects` syntax and limits. The current project deployment log reports that `/* /index.html 200` is treated as an infinite loop and ignored, so SPA fallback behavior must be validated through actual Pages routing rather than assuming this rule works.
