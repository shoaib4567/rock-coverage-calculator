# Rock Coverage Calculator Website Audit

Date: 2026-10-03  
Target: https://rockcoveragecalculator.com/  
Mode: Combined UX, functional, responsive, accessibility, and build review

## Overall verdict

The core calculator is polished, fast, understandable, and mathematically correct for a normal rectangle scenario. All six area modes render, the cost/purchasing output updates, the 3D preview loads, internal production links resolve to generated routes, and the current source produces a successful 71-page Astro build.

Two issues should be fixed before treating the calculator as order-safe: invalid ring geometry produces negative quantities without warning, and the homepage publishes materially different density values in the calculator and the reference table. Mobile reference tables also cause document-level horizontal overflow.

## Audit steps

1. **Homepage entry — Healthy.** The value proposition, primary calculator CTA, density-guide CTA, and credibility signals are immediately visible. The page has one H1, a canonical URL, and a specific meta description.
2. **Calculator setup — Healthy with density consistency risk.** Six shape choices, four units, 12 materials, depth presets, waste factors, and advanced controls are discoverable and have accessible names.
3. **Normal calculation — Healthy.** A 20 ft × 15 ft rectangle at 4 inches, 15% waste, and 1.4 tons/yd³ produced 300 sq ft, 4.26 yd³, 5.96 tons, and 230 half-cubic-foot bags. These values match the expected formulas.
4. **Shape switching — Healthy.** Rectangle, circle, ring, triangle, trapezoid, and L-shape modes all render the expected dimension fields and calculate live.
5. **Invalid geometry — Broken.** Setting a ring outer radius to 4 ft and inner radius to 8 ft produced −150.8 sq ft, −2.14 yd³, −3 tons, and −115 bags. No validation or recovery guidance appeared.
6. **Results and purchasing — Mostly healthy.** Quantity, weight, bag, truck, cost, export, print, share, and saved-zone controls are clearly grouped. Negative results from invalid geometry flow into these purchasing outputs.
7. **Visualization — Healthy.** The 3D rock bed initializes, the loading placeholder clears, and two visualization canvases are present.
8. **Mobile layout — Needs work.** The calculator itself reflows cleanly at 390 × 844, but the document reports a 549 px scroll width. The 780 px density table and 650 px economics table extend beyond the viewport and create page-level horizontal overflow.
9. **Accessibility structure — Fair.** Strengths include `lang="en-US"`, one main landmark, one navigation landmark, one H1, named controls, and real table headers/caption on the density table. Risks include no skip link, several heading-level jumps, FAQ buttons without `aria-controls`, and an unlabeled hidden restore file input.
10. **Content and trust — Needs work.** The calculator and reference table disagree for multiple materials. Examples: Pea Gravel is 1.30 t/yd³ in the calculator versus 1.35 in the table; Decomposed Granite is 1.35 versus 1.25; Lava Rock is 0.725 versus 0.75; White Marble Chips is 1.30 versus 1.25; and large River Rock is 1.25 versus 1.35.
11. **Technical build and navigation — Healthy with performance warning.** `npm run build` completed successfully with 71 generated pages. A static scan found 9,125 internal references, 105 unique internal targets, and no missing built routes. Vite warned that at least one minified chunk exceeds 500 kB.
12. **Sitemap — Minor gap.** The sitemap contains 71 URLs and no dead generated routes, but two generated public pages are absent: `/rock-coverage-calculator-yards` and `/rock-cubic-yard-calculator` (embed/widget routes excluded intentionally from this comparison).

## Prioritized findings

### P0 — Prevent impossible ring calculations

Require `outerRadius > innerRadius` before calculating. Show an inline error tied to both inputs, mark the invalid fields, suppress purchasing/export outputs, and keep the last valid result or show a neutral empty state. Also clamp every downstream quantity to a non-negative value as a defensive backstop.

### P0 — Establish one density source of truth

The calculator cards, detailed table, guides, schema copy, and specialized calculators should all read from the same material dataset. Conflicting quarry densities directly change tons, freight, cost, and purchase recommendations, undermining the site's strongest trust claim.

### P1 — Contain mobile tables

Keep each wide table inside a viewport-width scroll region (`max-width: 100%`, `min-width: 0`, `overscroll-behavior-inline: contain`) and verify that neither `html` nor `body` becomes wider than the viewport. Add a visible “Swipe to view all columns” hint for touch users.

### P1 — Improve error handling for all geometry inputs

The current `min="0"` attributes do not enforce cross-field rules. Add explicit validation for zero dimensions, ring radii, and any impossible/degenerate geometry. Announce validation changes with a concise live region and focus the first invalid field on export/print attempts.

### P1 — Reduce the initial JavaScript payload

Lazy-load Three.js and the visualizer only when the preview approaches the viewport. The page already delays visual initialization conceptually; code splitting would align the network cost with that behavior and address the >500 kB chunk warning.

### P2 — Tighten accessibility semantics

Add a skip-to-calculator or skip-to-main link, repair H2→H4 heading jumps, connect each FAQ button to its panel with `aria-controls`, ensure collapsed panels are removed from the accessibility tree, and give the restore file input an accessible name even if visually hidden.

### P2 — Complete sitemap coverage

Either add the two alias routes to the sitemap when they are intended search landing pages, or redirect/canonicalize them and exclude them intentionally. Avoid leaving indexable generated routes in an ambiguous state.

### P2 — Reduce homepage cognitive load

The core task is strong, but the homepage is roughly 27,600 px tall with more than 32,000 characters of visible text. Keep the calculator and concise decision guidance prominent; move deep engineering material into dedicated guides with contextual links. This preserves SEO depth while making the primary experience easier to scan.

## Evidence limits

- This was not a full WCAG conformance audit. Screen-reader announcements, contrast in every state, 200%/400% zoom, reduced-motion behavior, and full keyboard traversal still need dedicated testing.
- Print, CSV download, JSON restore, share-link persistence, and saved-zone deletion were not executed because they create/download files or mutate browser state; their controls and surrounding UX were inspected.
- External third-party links were not exhaustively probed. Generated internal routes and references were checked from the production build.
- The repository contained pre-existing uncommitted changes; no source files were edited as part of this audit.
