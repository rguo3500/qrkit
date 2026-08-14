# QRKit

QRKit is a mobile-first, SEO-first QR Code and Barcode toolkit built with React 19, TypeScript, Vite, Tailwind CSS, tRPC, Drizzle ORM, Manus OAuth, and Cloudflare Pages/D1. Static inputs are processed locally whenever possible, while authenticated Dynamic QR management, analytics, branded batch generation, and team collaboration are backed by protected server procedures.

## Run locally

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run build
```

The requested `npm install`, `npm run dev`, and `npm run build` commands are also supported by the generated package scripts when npm is used.

## Cloudflare Workers Static Assets

1. Create or sign in to a Cloudflare account.
2. Install Wrangler with `npm install -g wrangler`.
3. Run `wrangler login`.
4. Install dependencies and verify the project with `npm run check` and `npm run build`.
5. Deploy with `npx wrangler deploy`.
6. Bind a custom domain in Cloudflare and configure DNS as instructed by Cloudflare.
7. Verify the live homepage, representative tool routes, `/robots.txt`, and `/sitemap.xml`.
8. Submit the sitemap in Google Search Console and validate page titles, canonical URLs, Open Graph cards, and structured data before launch.

`wrangler.jsonc` uses Cloudflare Workers Static Assets with `assets.directory` set to `./dist`. Account IDs, domains, and secrets are intentionally not hardcoded.

## Architecture

The tool registry in `client/src/lib/tools.ts` is the extension point for adding new tools. Payload builders, retail checksum helpers, and filename sanitization are kept separate from page UI. QR generation uses `qrcode`; barcode generation uses `jsbarcode`; both run in the browser. The current UI contains category routes, individual SEO tool routes, related tools, guides, legal pages, Dynamic QR management, analytics, Brand + Batch, and Team Workspace. Static generation remains local and independent from the authenticated application data path.

## SEO and privacy notes

Every route now writes its own title, description, canonical URL, Open Graph tags, Twitter Card tags, and JSON-LD where applicable. Tool pages emit BreadcrumbList, WebApplication, and FAQPage data only for questions visibly rendered on the page. Blog index and article routes have distinct metadata and article content. The static sitemap and robots files are included in `client/public/`. Static QR inputs such as URLs, WiFi passwords, phone numbers, and vCard details are not sent to a server by the generation UI.

## Performance and tests

The homepage, generator pages, Blog pages, Dynamic QR, Brand + Batch, and Team Workspace are lazy-loaded through route-level `import()` boundaries. Run `pnpm test` for the full Vitest suite, `pnpm check` for TypeScript validation, `pnpm build` for the production build, and `pnpm test:e2e` for Playwright browser tests. The final regression suite includes 13 Vitest files and 40 passing assertions, while the local Playwright run completed 4 tests with 2 authentication/deployment-dependent scenarios skipped when no storage state or Worker URL was supplied.

## Dynamic QR extension boundary

`client/src/lib/dynamicQr.ts` defines the `DynamicQrRepository`, `DynamicQrRecord`, `ScanEvent`, and `resolveDynamicQr()` contract. The production boundary now also exists in `worker/index.ts`: `/r/:id` looks up an active link from the optional D1 binding, validates the destination scheme, records a privacy-limited scan event, and returns a 302 redirect. When D1 is not configured, the route safely returns 404 and all static assets continue to work.

To enable the D1-backed route, create a D1 database and add a `d1_databases` binding named `DB` in `wrangler.jsonc`. The local `wrangler` dev dependency is included, so `pnpm exec wrangler deploy --dry-run` validates the Worker bundle and `pnpm run deploy` builds and deploys it. The current dry-run validates the Worker and Static Assets binding without making a live deployment.

The barcode engine now validates ISBN-10, ISBN-13, Code 39, EAN-13, UPC-A, and ITF-14 cases. The test suite includes 13 passing assertions across QR payloads, checksum errors, ISBN formats, Code 39 symbols, ITF-14 calculation, export Blobs, safe filenames, and sanitized download filenames.

## Dynamic QR management and analytics

`migrations/0001_dynamic_qr.sql` provides a seed-free D1 schema for users, QR codes, dynamic links, scans, and subscriptions. The authenticated `/dynamic-qr` page uses Manus OAuth, tRPC, and Drizzle to list, create, edit, activate/deactivate, and delete user-owned links. The production redirect path at `/r/:id` validates active status, redirects only to safe HTTP(S) destinations, and records privacy-limited scan metadata.

The Dynamic QR analytics panel displays scan totals, a 14-day daily trend, recent visits, and readable device/referrer summaries. Empty, inactive, missing, and unauthorized states are represented explicitly rather than with demo records. The repository and router enforce ownership on every link and scan query.

## Blog discovery and monitoring

The Blog index supports category filters, search, and progressive loading. Article pages include related reading cards. `client/public/feed.xml` is exposed through an RSS alternate link in the document head, while `client/public/sitemap.xml` includes the new long-tail articles and Dynamic QR workspace. Anonymous `seo_route_view` and `code_export` events are emitted only when the existing analytics endpoint provides `window.umami`; no QR payload values are sent.

## Authenticated Dynamic QR management

QRKit now uses the full-stack template’s Manus OAuth and tRPC stack for protected Dynamic QR operations. `server/routers.ts` exposes user-scoped `list`, `create`, `update`, and `remove` procedures; `server/dynamicQr.ts` enforces ownership through every query. The MySQL/TiDB Drizzle migration in `drizzle/0000_chilly_blue_marvel.sql` has been applied to the connected project database, and the `/dynamic-qr` page calls these procedures after authentication while retaining a local preview before sign-in.

The Cloudflare Worker has a separate, concrete D1 path for edge-only redirect deployments. `d1-migrations/0001_dynamic_qr.sql` matches the Worker’s SQLite/D1 repository (`user_id`, `qr_code_id`, `slug`, `dynamic_link_id`), while `drizzle/` remains the source of truth for the Manus full-stack application database. Create a D1 database, uncomment the `d1_databases` binding in `wrangler.jsonc`, replace its ID, then run `pnpm exec wrangler d1 migrations apply qrkit --remote` before deploying. This separation prevents accidentally applying MySQL SQL to D1 or treating the Worker as a second source of truth for the authenticated dashboard.

## Brand + Batch generation

The `/brand-batch` workspace supports foreground/background color selection, rounded or shaped QR modules and eyes, quiet-zone sizing, error-correction selection, optional logo placement, CSV/text batch input, per-row validation, preview states, and PNG/SVG ZIP export. Before export, QRKit evaluates contrast, quiet-zone size, and logo coverage against the selected error-correction level. Low-contrast and excessive-logo-risk configurations block export; smaller quiet zones or elevated but acceptable logo risk remain visible warnings.

## Team collaboration

The `/teams` workspace supports team creation, pending member invitations, Owner/Editor/Viewer roles, and Dynamic QR sharing. Owners can invite members and change roles. Owners and Editors can share or remove a Dynamic QR link; Viewers can inspect permitted workspace data but cannot invite, change roles, share, or unshare links. All repository operations require active membership in the requested team, and resource queries are scoped by `teamId` and ownership to prevent cross-team access.

The Team Workspace renders a `Remove share` action for each shared link. The action calls the protected `team.unshareLink` procedure and invalidates the shared-links query after success. The repository-level integration suite directly exercises viewer/editor/owner denial paths, inactive membership rejection, cross-team share/unshare rejection, owned-link sharing, successful unsharing, and unowned-link `NOT_FOUND` behavior.

## Browser verification

Run `pnpm test:e2e` to execute the Playwright suite. The local suite verifies URL QR PNG/SVG downloads, authenticated Dynamic QR boundaries, the Brand + Batch high-risk recovery flow, and the Team Workspace boundary. Set `PLAYWRIGHT_WORKER_URL` to run the deployed Worker redirect smoke test; it is intentionally skipped when no deployment URL is provided. The deterministic Vitest suite covers QR/barcode payloads, exports, analytics rendering, Dynamic QR repositories, Worker fixtures, Brand + Batch validation, and team permission boundaries.

## Production domain and Search Console

Set `PUBLIC_SITE_URL` or `VITE_SITE_URL` before `pnpm run build` to generate absolute links in `client/public/feed.xml` and `client/public/sitemap.xml`. The build runs `scripts/generate-seo.mjs` automatically. Follow `SEARCH_CONSOLE.md` after publishing to verify the domain, submit the sitemap, inspect canonical URLs, and review anonymous `seo_route_view` and `code_export` events.

## Cloudflare deployment targets

The repository now separates the two Cloudflare targets. For **Cloudflare Pages**, use the build command `pnpm run build` and output directory `dist/public`; `wrangler.toml` contains `pages_build_output_dir = "dist/public"`. Do not use `npx vitepress build`—QRKit is a Vite application, not a VitePress site. For **Cloudflare Workers + D1**, use `pnpm run deploy`, which explicitly reads `wrangler.worker.jsonc` and the `worker/index.ts` entrypoint. This avoids the Pages builder attempting to interpret the Worker config and produces the warning seen in the supplied deployment log.

A successful Pages deploy publishes the static QRKit UI, RSS, sitemap, and browser tools. It does not automatically publish `/r/:id` as a D1-backed Worker route; deploy that Worker separately after adding the D1 binding and applying `d1-migrations/`.

The Pages configuration was locally validated with `pnpm run validate:pages` after a production build: it recognized `pages_build_output_dir=dist/public` and confirmed that the Pages file has no Worker `main` entry. The Worker configuration was separately validated with `pnpm exec wrangler deploy --config wrangler.worker.jsonc --dry-run`, which detected the `ASSETS` binding and exited without publishing. The supplied log’s final “Assets published!” therefore corresponds to the static Pages path; the earlier Wrangler warning came from the old mixed configuration and is addressed by this split.

## Live Pages 404 diagnosis

The live URL `https://qrkit-5az.pages.dev` was inspected and confirmed to serve `404 | VitePress`, including the VitePress header and default 404 copy. This is not a QRKit runtime route error; it means the Cloudflare Pages project is connected to an old VitePress build or is still using the old `npx vitepress build` command. In the Pages project settings, set the repository and branch to this QRKit repository, set the build command to `pnpm run build`, set the output directory to `dist/public`, and remove any VitePress framework preset or `npx vitepress build` override. The new `wrangler.toml` is the Pages config, and `client/public/_redirects` provides the SPA fallback for direct tool and Blog URLs. After saving those settings, trigger a new deployment and verify `/`, `/url-to-qr-code`, and `/blog` rather than relying on the old `pages.dev` deployment cache.

## Production Pages Functions Dynamic QR

The production Pages project binds the Cloudflare D1 database `qrkit` as `DB`, with `PUBLIC_SITE_URL` set to `https://lovexiaoyue.dpdns.org`. The route at `functions/r/[id].ts` handles `/r/:id` requests directly in Cloudflare Pages Functions: it looks up active links, records privacy-limited scan metadata, and returns a 302 redirect. The local `worker/` implementation remains available for a standalone Worker deployment, while the Pages Functions path avoids requiring a separate Wrangler OAuth deployment.

The production D1 schema was applied without seed rows. Changes to Pages bindings and build variables take effect on the next deployment.
