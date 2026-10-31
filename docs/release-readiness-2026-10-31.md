# Release readiness — October 31, 2026

The corrected local build passes the release checks and is a deployment candidate. Nothing has been committed, pushed, or deployed. Confirm the actual public responses after release before requesting Google recrawling. Vercel project/deployment inspection requires reconnecting the Vercel app; its current account-level settings and exact production commit were not accessible.

## What the live indexing check established

- All 71 URLs in the live sitemap returned HTTP 200.
- Live robots.txt allows crawling and names the correct sitemap.
- None of those URLs returned a noindex meta directive or restrictive X-Robots-Tag header.
- Inner pages declare their own canonical URLs. The homepage's canonical without a trailing slash is the same URL as the origin with a slash, not evidence of a canonical problem.
- Six additional requests using a Googlebot-style user agent also succeeded. This only tests those requests; it does not authenticate a real Googlebot crawl or rule out network-specific restrictions.

These results do not establish Google's actual index state or explain the reported loss of inner-page visibility. Search Console's indexed URL data, Google-selected canonical, Manual Actions, Security Issues, and Removals were not accessed. A normal HTTP response alone does not establish indexing or ranking.

## Fixes in this release

| Area | Result |
|---|---|
| Dependencies | Patched the seven previously flagged transitive packages using compatible dependency updates. Final npm audit reports zero advisories. Astro and Three remain on their existing versions. |
| Type safety | Corrected all 25 previously reported errors in HomeContent, the contact page, egg rock, and pea gravel coverage. Missing/invalid supplier values do not erase independent volume calculations. |
| Release checks | Added Astro checking dependencies. npm run build now performs type checking, generates the static site, and runs all 14 tests. |
| Crawl safeguards | Added tests covering every indexable content route, self-canonicals, sitemap inclusion, homepage link reachability, robots access, and absence of a global noindex header. |
| HTTP redirects | Added permanent redirects in vercel.json for the two existing legacy aliases, targeting /rock-coverage-calculator-yard. The local server also returns 308 and retains query parameters. The Vercel rules need live confirmation after deployment. |
| Missing URLs | Replaced the local server's homepage/200 fallback with real 404 responses and added a useful 404 page. Production already returned correct 404s in the public probes. |
| Local HTTP handling | Added correct TXT/XML MIME types, HEAD handling, unsupported-method responses, path containment checks, and caching for hashed build assets. Added nosniff headers locally and in the Vercel configuration. |
| Contact | Removed the non-delivering form and its false success message. The page now provides the existing public email address, explains how to send a message, and makes no response-time guarantee. No inquiry was sent during testing. |
| About | Replaced unsupported certification, engineering-panel, regional calibration, and guaranteed accuracy claims with the actual formulas, editable assumptions, and scope. Corrected heading hierarchy and retained the existing methodology anchor. |
| ads.txt | Added the standard Google seller record matching publisher pub-8089300808424687, which is already used by the site's AdSense script. This does not verify account approval or payment status. |
| Widget | Retained the local /embed noindex setting and sitemap exclusion; added a matching Vercel header for that endpoint only. The live site still has its previous indexable widget until deployment. |
| 3D preview | Replaced the removed PCFSoftShadowMap setting with PCFShadowMap, as specified by the installed Three version. The final browser run renders the scene without that warning. |

Existing content URLs were retained. No broad page deletion, canonical consolidation, or blanket noindex action was applied. Older archived unpublished drafts were not reinstated; the Vercel configuration here was authored for this release.

## Validation

- Complete npm run build: passed, including Astro diagnostics with **0 errors across 148 checked files** and **14 passing tests**.
- Final npm audit: **0 advisories**.
- Static site: **71 indexable sitemap URLs**, plus the excluded widget and the 404 page. Astro also produces two legacy redirect documents.
- Scan of the 72 content/utility pages: no broken known internal page/fragment targets, public orphans, missing form labels, duplicate IDs, heading-level skips, headerless tables, or malformed JSON-LD detected.
- Scan of **75 generated HTML documents**: all **100 directly referenced local assets** exist; **159 executable non-module inline scripts** parse successfully.
- HTTP integration checks: every sitemap route serves HTML/200; unknown pages and scripts return 404; aliases return 308 with query strings; embed returns noindex; crawl files have the expected MIME types; malformed/traversing paths and unsupported POSTs are rejected.
- Browser: main calculator changed from 100 to 200 sq ft and settled at 2.04 yd³, 2.75 short tons, and 110 half-cubic-foot bags with the selected defaults. Egg rock's area mode and missing-density behavior worked. Pea gravel retained yard/bag results when density was invalid, including 162 sq ft per yard and 3 sq ft per half-cubic-foot bag at 2 inches. Revised contact page inspected visually. Final 3D reload rendered a canvas and produced no new warning/error entries in the captured browser log.

This is targeted desktop browser and automated verification, not an exhaustive test of every calculator/input/device combination. No new Core Web Vitals or PageSpeed score was obtained. The dynamically imported 3D chunk still triggers the build's size warning; this is an optimization opportunity, not a measured indexing failure.

## After deployment

1. Verify the intended project, source, and production environment. Open the homepage, /calculators, /gravel-calculator, /river-rock-calculator, /egg-rock-calculator, /contact, and /about on the public domain. Check a calculation and the 3D preview.
2. Verify /robots.txt and /sitemap.xml; confirm the sitemap excludes /embed and /404. Check that the two old aliases return an HTTP permanent redirect, a made-up URL returns 404, and /embed has noindex while content pages remain indexable.
3. In Search Console, inspect two affected inner URLs. Read the indexed Page indexing reason, last crawl, and Google-selected canonical, then run Test live URL. Live eligibility does not establish Google's eventual canonical or indexing decision. See [Google's URL Inspection guide](https://support.google.com/webmasters/answer/9012289?hl=en).
4. Check Manual Actions, Security Issues, and Removals separately; the live URL test does not cover these. Use any reported issue to guide the next fix instead of assuming a universal technical cause.
5. Submit https://rockcoveragecalculator.com/sitemap.xml and request indexing for a few priority pages. Do not repeatedly request the same URLs. [Google's recrawl guide](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) explains that requests do not guarantee indexing and processing can take days to weeks.

If Google reports duplicate/alternate canonicals or crawled-but-not-indexed pages, review those specific URLs' purpose and content using that evidence. This release fixes confirmed defects; it cannot guarantee indexing or keyword rankings.
