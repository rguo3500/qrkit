# Formal-domain browser observation — 2026-08-16

## Scope

Visited `https://lovexiaoyue.dpdns.org/` and `https://lovexiaoyue.dpdns.org/dynamic-qr` in the connected browser.

## Observed results

The formal-domain homepage loaded successfully with the QRKit title, QR and Barcode entry points, local-first privacy copy, and no visible Teams navigation item. The homepage content matches the single-user public toolkit direction.

The formal-domain `/dynamic-qr` route loaded successfully and displayed the Dynamic QR workspace. It showed the draft-mode copy, a sign-in-to-persist instruction, form labels for slug/label/destination/active state, and a redirect preview. The page did not expose a Teams route. The visible preview used `https://qrkit.example/campaign`, which is a draft/preview value and must not be treated as proof of a production D1 record or a real scan event.

## Evidence limits

These passive page observations prove that the public site and Dynamic QR route render. They do not prove that Google OAuth completed, that Cloudflare Production secrets are configured, that a real Dynamic QR was created in D1, or that authenticated scan statistics were verified. Those items remain in `todo.md` and `PRODUCTION_VERIFICATION.md` until the user performs and records the corresponding authenticated actions.

## Post-fix observation

After checkpoint `1b057c15` was published, the formal `/dynamic-qr` route still rendered successfully, but the passive extraction showed `Draft mode / sign in to persist this link` rather than an authenticated state. The page therefore confirms route availability only; it does not confirm that the signed-in browser used for the screenshot received the new bundle or that the Update mutation succeeded. A fresh authenticated click is still required.
