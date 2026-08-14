# QRKit Search Console checklist

QRKit generates absolute RSS and sitemap URLs from `PUBLIC_SITE_URL` at build time. Set it to the production origin without a trailing slash before building, for example `PUBLIC_SITE_URL=https://qrkit.example pnpm run build`. The default placeholder is retained only for local previews.

In Google Search Console, add the production domain as a Domain property when DNS access is available, or add the exact URL-prefix property when verification is managed at the site level. Complete the provided DNS, HTML, or analytics verification step in the hosting control panel, then submit `https://YOUR_DOMAIN/sitemap.xml`. The RSS endpoint is available at `https://YOUR_DOMAIN/feed.xml` for feed readers and secondary discovery.

After publishing, inspect the URL Inspection report for the homepage, `/qr-codes`, `/barcodes`, `/blog`, and at least three long-tail articles. Confirm that canonical URLs resolve to the production origin, the sitemap contains the same origin, and the Worker redirect route is excluded from indexing when it is used only as a Dynamic QR destination. Review `seo_route_view` and `code_export` events in the configured analytics dashboard; these events intentionally exclude QR payload values.
