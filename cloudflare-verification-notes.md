
## 2026-08-15 Cloudflare production verification

Source: https://dash.cloudflare.com/ef7210b904759ecbf03ef7570bf2e4c9/pages/view/qrkit

Cloudflare Pages project `qrkit` shows Production deployment `f8d048e` (`fix: harden Google OAuth unauthorized handling`) with deployment URL `https://35a5f835.qrkit-5az.pages.dev`, status successful, and custom domains `lovexiaoyue.dpdns.org` and `qrkit-5az.pages.dev`.

Source: https://lovexiaoyue.dpdns.org/api/trpc/team.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D

The formal API endpoint now returns structured JSON `[{'error':{'json':{'message':'Please login (10001)','data':{'code':'UNAUTHORIZED','httpStatus':401}}}}]` rather than the prior SPA 404, confirming Pages Functions are deployed. Unauthenticated `/teams` still needs a final browser OAuth redirect check after the latest build; the current visible page displayed the sign-in error state before the robust serialized-error fix was deployed.

## Latest deployment

Cloudflare Pages now shows successful Production deployment `94267e4` (`fix: redirect TeamPage unauthorized users to Google OAuth`) at `https://633ffe11.qrkit-5az.pages.dev`, a few seconds after the GitHub push. Custom domain remains `lovexiaoyue.dpdns.org`.

## Google OAuth authorization endpoint verification

Opening the Google authorization endpoint with the configured client ID and redirect URI reached Google's account chooser showing `继续前往 lovexiaoyue.dpdns.org`. This confirms the Google Client ID and `https://lovexiaoyue.dpdns.org/api/oauth/callback` redirect URI are accepted by Google. No account was selected and no authorization was submitted during this diagnostic.
