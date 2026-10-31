# Website cleanup — October 31, 2026

**Historical checkpoint:** this records the initial cleanup before older unpublished drafts were removed. Its retained-draft descriptions and test counts are not the current release state. See [the later release-readiness report](release-readiness-2026-10-31.md) for the final fixes and validation.

Implemented and checked in the local repository. Nothing was committed, pushed or deployed. The production website has not changed.

The repository already contained unpublished edits. Those were retained and extended. Some unchanged local files predated the October 22 promoted version; 22 reviewed material-page/component/data files were carried forward from that version before the final checks. Copies of the starting files are kept outside the repository in the audit workspace's `before-cleanup` directory.

## Completed changes

| Area | What changed |
|---|---|
| Topic structure | Replaced the large repeated directory with up to eight relevant related tools/guides and a link to the full library. Added `/calculators` with grouped material, conversion, project and support links. |
| Discovery | Added the library to the footer and sitemap. The widget setup and material-selection helper now have incoming links from page content. Every public page has an incoming content link in the final known-route scan. |
| General tool overlap | Kept working URLs. Clarified the decorative-bed, settlement, simple volume and order-logistics tasks rather than retiring pages without query/backlink evidence. |
| Accuracy | Corrected the cobblestone FAQ's 4-inch-block/3⁄8-inch-joint example: approximately 752 pieces before allowance and 805 with 7% extra. The visible FAQ and its structured data share the corrected answer. |
| Coverage consistency | Generated the square-foot and coverage reference rows from their stated example weights; the 0.75-ton/yard lava example gives 144 sq ft/ton at 3 inches. Preserved the reviewed material-specific tools and their supplier-input guidance. |
| Delivery guidance | Removed contradictory generic truck-class capacity tables and treated the retained 15-ton division as an illustrative load. Replaced universal clearance, driveway-capacity and plywood advice with supplier/operator assessment. |
| Trust and content | Removed or qualified unsupported certification, calibration, universal compaction, maintenance-free, guaranteed weed-control and broad hydraulic-design claims. Updated the driveway, crusher-run, riprap, tons, yardage, installation, particle-shape and dry-creek explanations and FAQs. Retained the earlier About, gravel-size and regional-name corrections and aligned related wording. |
| Mulch comparison | Rebuilt the comparison around editable material, depth, density, delivery, labor, fabric and upkeep inputs. Zero annual mulch top-up is supported. The result can favor either material and does not invent a break-even year. Added a pure calculation module and five regression tests. |
| Layered planner | Exposed loose-volume increases, separate order extra, supplier weights and spoil swell. Corrected DG/lava examples and made top-layer factors explicit. Changing one material preserves a custom weight entered for the other layer. Added input-error handling. |
| Thin supporting explanations | Added a worked multi-layer example and documented supplies/allowances. Added widget setup, limitations, height and troubleshooting guidance. |
| Widget functionality | Kept `/embed` functional with `noindex, follow` and outside the sitemap. Added a main landmark/H1, removed its absent 3D-section jump link, and made the builder's light/dark choice work through the embed URL and preview. |
| Accessibility/structure | Put `main-content` IDs into server-rendered HTML, corrected heading-level gaps, associated missing form labels, and used row headers in the audited static and JavaScript-rendered tables. Footer heading appearance is retained with appropriate heading levels. |
| Tonnage inputs | Added an actual supplier bulk-weight field, set additional moisture to zero by default, and described moisture as an optional scenario rather than a measurement. Invalid supplier weights clear the result and show an error. |
| Regression checks | Added `npm test`, five cost-model tests, and server-rendered main/skip-target assertions to the existing SEO tests. Retained and verified the earlier missing-page and permanent-redirect fixes. |

## Verification

- `npm run build`: passed; 72 content/utility pages, including the new library and the embed.
- `npm test`: all 24 tests passed, including calculator, cost-model, canonical/indexability and local HTTP redirect/404 tests.
- Fresh parsed-output scan: 71 sitemap URLs plus the embed; one H1 and one server-rendered main landmark per page; no heading-level gaps, missing programmatic input labels, duplicate IDs, invalid JSON-LD syntax or headerless tables detected by these checks.
- Known-route link/fragment scan: no broken internal page or fragment targets, no public-page orphans, and no repeated full-directory blocks.
- Local HTTP sweep: all 72 content/utility URLs returned 200 with a main-content target.
- In-app browser: the editable mulch comparison produced $515.30 initial / $582.80 ten-year rock costs and $197.78 initial / $997.78 ten-year mulch costs for the example. With annual mulch top-up set to zero, the tool correctly reported no rock crossover within ten years and a $385.02 mulch advantage.
- In-app browser: the documented 12 × 16 ft two-layer example produced 4.41 yd³ and 6.27 tons. A custom base density survived changing the top material.
- In-app browser: changing supplier weight from 1.35 to 2.00 changed the tested tons result from 4.95 to 7.33; selecting the 0.75 lava example changed it to 2.75. No horizontal page overflow was measured at the inspected 1280px width.
- In-app browser: changing the widget theme to light updated the generated embed URL, preview URL and iframe's actual `data-theme` attribute to light.
- `git diff --check`: passed.

These checks cover the known routes and the inspected interactions. They do not establish full accessibility conformance, engineering certification, all calculator/input combinations, actual Google indexing or a visual review of every breakpoint.

## Remaining limits and release status

- Screenshot capture failed in the in-app browser, its developer screenshot API and the native-browser fallback. DOM rendering and interaction checks succeeded; a fresh visual screenshot review remains outstanding.
- The build still reports a large JavaScript-chunk warning associated with the site's visualization code. It is a warning, not a failed build; bundle optimization was not part of this content/structure cleanup.
- Four potential page-merger candidates remain live. Their task distinctions were clarified. A removal/redirect decision still needs actual query, traffic and backlink evidence.
- Existing legal policy text was not legally reviewed, and this cleanup is not a certification of site-specific construction guidance.
- No production deployment was performed. The local result can be reviewed before a release.
