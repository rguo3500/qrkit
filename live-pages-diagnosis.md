# Live Cloudflare Pages diagnosis

Checked `https://qrkit-5az.pages.dev` on 2026-08-14. Before the settings change, the live title was `404 | VitePress` and the page showed the default VitePress 404 screen.

Authenticated Cloudflare dashboard inspection confirmed the Pages project `qrkit` is connected to `rguo3500/qrkit`, production branch `main`, with automatic deployment enabled. Before editing, the production settings were `npx vitepress build` and `.vitepress/dist`. After user confirmation, the settings were saved as `pnpm run build` and `dist/public`. The dashboard settings page now displays those corrected values.

The deployment list still shows the old production commit `cc8f173` (`Delete test-results`) and preview URL `https://9ad14706.qrkit-5az.pages.dev`, 17 minutes old at inspection time. No new deployment has been triggered yet, so live `/` may continue to show the old VitePress artifact until the connected repository receives a new commit or the existing deployment is manually retried from Cloudflare Pages.

The Cloudflare Pages production settings were reopened and explicitly verified after the save: repository `rguo3500/qrkit`, production branch `main`, automatic deployment enabled, build command `pnpm run build`, and build output `dist/public`. The UI no longer displays the old VitePress build command/output. The framework preset field is not shown in the read-only summary, but the edited build settings are persisted. The deployment list still points to the old `cc8f173` deployment, so a new commit or manual retry is still required before the live pages.dev URL can reflect QRKit.

Reopened the production build editor after saving. The framework preset selector explicitly displays `无` (none), while the persisted build command remains `pnpm run build` and output directory remains `dist/public`. This confirms the stale VitePress preset has been removed from the Pages project settings.
