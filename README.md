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

`client/src/lib/dynamicQr.ts` defines the future `DynamicQrRepository`, `DynamicQrRecord`, `ScanEvent`, and `resolveDynamicQr()` contract. A Cloudflare Worker can later map `/r/:id` to this resolver, record a scan event, and return a 302 redirect without changing the browser-local static QR flow. The file also documents the planned D1 table vocabulary for users, QR codes, dynamic links, scans, and subscriptions.
