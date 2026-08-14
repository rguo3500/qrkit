# QRKit

QRKit is a mobile-first, SEO-first QR Code and Barcode toolkit built with React, TypeScript, Vite, Tailwind CSS, and browser-local generation. Static inputs are processed locally whenever possible; the first version has no database and no payment flow.

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

The tool registry in `client/src/lib/tools.ts` is the extension point for adding new tools. Payload builders, retail checksum helpers, and filename sanitization are kept separate from page UI. QR generation uses `qrcode`; barcode generation uses `jsbarcode`; both run in the browser. The current UI contains category routes, individual SEO tool routes, related tools, pricing preview, guides, and legal pages. Future Dynamic QR, analytics, and Cloudflare D1 interfaces should be added without changing static generation behavior.

## SEO and privacy notes

Every route now writes its own title, description, canonical URL, Open Graph tags, Twitter Card tags, and JSON-LD where applicable. Tool pages emit BreadcrumbList, WebApplication, and FAQPage data only for questions visibly rendered on the page. Blog index and article routes have distinct metadata and article content. The static sitemap and robots files are included in `client/public/`. Static QR inputs such as URLs, WiFi passwords, phone numbers, and vCard details are not sent to a server by the generation UI.

## Performance and tests

The homepage, generator pages, and Blog pages are lazy-loaded through route-level `import()` boundaries. Core payload and validation behavior is covered by `client/src/lib/tools.test.ts`; run `pnpm exec vitest run client/src/lib/tools.test.ts` to execute the current suite. The test coverage includes URL, WiFi, vCard, email, EAN-13, UPC-A, checksum, and filename sanitization cases.

## Dynamic QR extension boundary

`client/src/lib/dynamicQr.ts` defines the `DynamicQrRepository`, `DynamicQrRecord`, `ScanEvent`, and `resolveDynamicQr()` contract. The production boundary now also exists in `worker/index.ts`: `/r/:id` looks up an active link from the optional D1 binding, validates the destination scheme, records a privacy-limited scan event, and returns a 302 redirect. When D1 is not configured, the route safely returns 404 and all static assets continue to work.

To enable the D1-backed route, create a D1 database and add a `d1_databases` binding named `DB` in `wrangler.jsonc`. The local `wrangler` dev dependency is included, so `pnpm exec wrangler deploy --dry-run` validates the Worker bundle and `pnpm run deploy` builds and deploys it. The current dry-run validates the Worker and Static Assets binding without making a live deployment.

The barcode engine now validates ISBN-10, ISBN-13, Code 39, EAN-13, UPC-A, and ITF-14 cases. The test suite includes 13 passing assertions across QR payloads, checksum errors, ISBN formats, Code 39 symbols, ITF-14 calculation, export Blobs, safe filenames, and sanitized download filenames.

## Dynamic QR management

`migrations/0001_dynamic_qr.sql` provides a seed-free D1 schema for users, QR codes, dynamic links, scans, and subscriptions. The `/dynamic-qr` page is a local draft management boundary: it validates labels and HTTP(S) destinations, previews the public redirect path, and clearly indicates that persistence requires the D1 binding. This avoids implying that a static demo record has been saved.

## Blog discovery and monitoring

The Blog index supports category filters, search, and progressive loading. Article pages include related reading cards. `client/public/feed.xml` is exposed through an RSS alternate link in the document head, while `client/public/sitemap.xml` includes the new long-tail articles and Dynamic QR workspace. Anonymous `seo_route_view` and `code_export` events are emitted only when the existing analytics endpoint provides `window.umami`; no QR payload values are sent.
