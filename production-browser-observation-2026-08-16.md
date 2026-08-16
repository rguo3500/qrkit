# Formal-domain browser observation — 2026-08-16

## Scope

Visited `https://lovexiaoyue.dpdns.org/` and `https://lovexiaoyue.dpdns.org/dynamic-qr` in the connected browser.

## Observed results

The formal-domain homepage loaded successfully with the QRKit title, QR and Barcode entry points, local-first privacy copy, and no visible Teams navigation item in the passive homepage extraction.

In the user-controlled authenticated browser, the formal `/dynamic-qr` page displayed `Signed in as 郭睿`, the saved `Spring campaign` link, and a visible `TEAMS` navigation item. The page still showed the old English-only workspace labels and the save operation had previously returned `Unable to transform response from server`.

## Deployment conclusion

The visible `TEAMS` navigation in the authenticated production page is decisive evidence that the current formal-domain deployment is not the latest single-user checkpoint. The local source and latest checkpoint removed the Team Workspace route and navigation. Therefore the production error cannot yet be used to judge the latest Functions response fix: Cloudflare Pages is serving an older deployment or a different repository/branch/build output.

## Evidence limits

The browser page proves the old production bundle is active, but does not by itself identify the Cloudflare project, branch, or deployment ID. The next required action is to verify Cloudflare Pages GitHub repository/branch/build settings and deploy checkpoint `6a037894` (or the corresponding latest GitHub commit), then retest `/dynamic-qr` and check for `x-qrkit-trpc: numeric-error-v2` on the failing API request.

## After GitHub sync

GitHub `rguo3500/qrkit` main was force-updated to `392a34a5f7a6946619e163b322f027c10f2bc0b5`, containing the verified tRPC response contract fix. After waiting for automatic Pages deployment, `https://lovexiaoyue.dpdns.org/dynamic-qr?deploy=392a34a` rendered the current single-user page through passive extraction: no `TEAMS` navigation appeared, and the page showed the expected Dynamic QR route. This confirms the old Team bundle was replaced. The automation browser was not authenticated at this point, so the authenticated Save mutation and `x-qrkit-trpc` response header still require a fresh user-session click test.

## Static asset diagnosis

The current formal-domain HTML references `/assets/index-CVWtrDBK.js` and `/assets/index-CVxhYpjC.css`. The current index bundle references `Home-DUXPmQ9b.js`, and a direct request to `/assets/Home-DUXPmQ9b.js` returned HTTP 200 with `content-type: application/javascript`. The root HTML is `cache-control: public, max-age=0, must-revalidate`, while the hashed JavaScript is cached for 14,400 seconds. The reported dynamic-import failure therefore appears consistent with a browser holding an older index/chunk combination during deployment rather than the current asset being absent; a hard reload or site-data clear is required for final browser confirmation.

## Clean-browser verification

In a clean browser context with a cache-busting URL, the formal homepage loaded its full QRKit UI without a dynamic-import error. The formal `/dynamic-qr` route also loaded completely and showed the expected single-user Dynamic QR interface with `Draft mode / sign in to persist this link`; no Team Workspace navigation or missing-module error appeared. This confirms the reported `Home-DUXPmQ9b.js` failure was a stale browser asset-combination issue after deployment, not a currently missing production file.
