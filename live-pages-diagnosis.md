# Live Cloudflare Pages diagnosis

Checked `https://qrkit-5az.pages.dev` on 2026-08-14. Before the settings change, the live title was `404 | VitePress` and the page showed the default VitePress 404 screen.

Authenticated Cloudflare dashboard inspection confirmed the Pages project `qrkit` is connected to `rguo3500/qrkit`, production branch `main`, with automatic deployment enabled. Before editing, the production settings were `npx vitepress build` and `.vitepress/dist`. After user confirmation, the settings were saved as `pnpm run build` and `dist/public`. The dashboard settings page now displays those corrected values.

The deployment list still shows the old production commit `cc8f173` (`Delete test-results`) and preview URL `https://9ad14706.qrkit-5az.pages.dev`, 17 minutes old at inspection time. No new deployment has been triggered yet, so live `/` may continue to show the old VitePress artifact until the connected repository receives a new commit or the existing deployment is manually retried from Cloudflare Pages.

The Cloudflare Pages production settings were reopened and explicitly verified after the save: repository `rguo3500/qrkit`, production branch `main`, automatic deployment enabled, build command `pnpm run build`, and build output `dist/public`. The UI no longer displays the old VitePress build command/output. The framework preset field is not shown in the read-only summary, but the edited build settings are persisted. The deployment list still points to the old `cc8f173` deployment, so a new commit or manual retry is still required before the live pages.dev URL can reflect QRKit.

Reopened the production build editor after saving. The framework preset selector explicitly displays `无` (none), while the persisted build command remains `pnpm run build` and output directory remains `dist/public`. This confirms the stale VitePress preset has been removed from the Pages project settings.

A fresh check of `https://qrkit-5az.pages.dev` after the settings update still returns `404 | VitePress`. This is expected while the production deployment remains the old `cc8f173` artifact; settings changes alone did not create a new deployment. The remaining required action is an external Pages redeploy/retry, after which `/`, `/url-to-qr-code`, and `/blog` must be checked online.

Cloudflare Pages deployment `68f1350` completed successfully with deployment ID `a1ad6f1b-910f-489f-b76c-b613633f9e5b`, preview URL `https://a1ad6f1b.qrkit-5az.pages.dev`, and a 44-second build/deploy. The build log still contains a harmless Wrangler beta warning about `wrangler.json`, but the actual build and deploy steps are green. The new preview deployment is ready for route verification; production `qrkit-5az.pages.dev` must be checked separately after promotion/activation.

Preview verification completed on `https://a1ad6f1b.qrkit-5az.pages.dev`: `/` returned title `Free QR Code & Barcode Generator | QRKit` and the QRKit homepage; `/url-to-qr-code` returned title `URL to QR Code Generator – Free Online Tool` with a live QR preview; `/blog` returned title `QR Code & Barcode Guides | QRKit` with filters, search, article cards, and progressive loading. Direct nested routes successfully fell back to the QRKit app rather than 404.

Production verification completed on `https://qrkit-5az.pages.dev` after deployment `68f1350`: `/` now serves QRKit with title `Free QR Code & Barcode Generator | QRKit`; `/url-to-qr-code` serves the live QR generator with title `URL to QR Code Generator – Free Online Tool`; `/blog` serves the Blog index with title `QR Code & Barcode Guides | QRKit`, filters, search, and article cards. The former VitePress 404 is resolved on production.
