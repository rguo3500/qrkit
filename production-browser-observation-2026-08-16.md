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
