# QRKit Production OAuth Findings

- Formal site: https://lovexiaoyue.dpdns.org/teams
- GitHub deployment under test: 7392b0e
- Cloudflare D1 database: qrkit / 01546c03-e366-47d9-9523-469010237415
- Remote migrations 0001_dynamic_qr.sql and 0002_team_collaboration.sql both applied successfully.
- Read-only D1 query confirmed tables users, teams, team_members, dynamic_link_shares exist.
- Read-only D1 query confirmed user `oauth-google:116271465842895564488`, email `rguo3500@gmail.com`, login_method `google`.
- D1 last_signed_in was updated at `2026-08-15T13:25:10.154Z`, proving Google callback reached the user upsert path.
- Production browser page renders Team Workspace without a white screen and shows the recoverable sign-in state.
- Production browser call to `https://lovexiaoyue.dpdns.org/api/trpc/team.list?batch=1&input=%7B%220%22%3A%7B%22json%3Anull%22%3Anull%7D%7D` still returns HTTP 401 with `Please login (10001)` after the login attempt.
- The current unresolved issue is session persistence or browser-session isolation: OAuth callback updates D1, but team.list does not receive/accept `app_session_id`.
- Code changes already made: OAuth state now carries `returnTo`; callback emits a single `app_session_id` Set-Cookie header and lets the short-lived OAuth nonce expire naturally; tRPC fetch uses `credentials: include`.
