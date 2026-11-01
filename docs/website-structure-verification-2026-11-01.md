# Structure and intent verification — 1 November 2026

Local verification for the changes described in [the complete page map](website-structure-and-intent-2026-11-01.md). The production site was not changed during this task.

| Check | Final result |
| --- | --- |
| Source conflict guard and Astro/TypeScript check | Passed; zero errors |
| Production compilation | Passed; final build regenerated after the responsive fixes |
| Regression suite | 25 passed, zero failed |
| Explicit editorial map | All 73 content/utility sources represented; 2 redirect aliases tracked separately |
| Indexability | 71 public pages remain indexable, self-canonical and in the sitemap; embed and 404 remain noindex |
| Internal links and fragments | Zero missing targets |
| Reachability | Zero public orphans; every public page has incoming main-content links |
| Titles and descriptions | Zero exact duplicates across public pages |
| Rendered main content | Zero identical public-page bodies |
| Headings and landmarks | One H1 and main per content/utility page; no heading-level jumps; valid skip targets |
| Form and table markup | No unlabeled inputs, duplicate IDs or tables without header cells in the static scan |
| JSON-LD | Parses successfully; page purpose, entity and breadcrumb relationships match the map |
| Built assets | 111 local asset references resolve across 75 HTML documents |
| Inline JavaScript | 157 inline scripts parsed without syntax errors |
| Mobile, 375 × 812 | All 71 public pages checked; no document-level horizontal overflow after two repairs |
| Desktop, 1280 × 900 | All 71 public pages checked; no document-level horizontal overflow |
| Narrow mobile, 320 × 812 | Main calculator, library, layered planner, widget builder, cubic-yard tool, square-foot tool, #57 guide and selector checked; no document-level overflow |
| Tablet navigation, 1024 × 900 | Library fits; Browse navigation remains available |

The mobile overflow findings were in the layered planner and widget builder. Their grid children now shrink correctly. The layered planner also stacks its material and depth fields on narrow screens. Both pages were rechecked after the final build. The Browse menu was opened and its links inspected in the browser. The browser viewport override was reset afterward.

Functional browser checks confirmed:

- Cubic yards: the initial 600 sq ft, 3-inch, 10%-extra example gives 6.11 yd³ and 8.25 short tons at 1.35 tons/yd³. Zero extra gives 5.56 yd³ and 7.50 short tons. A 3-ton payload requires three deliveries in that example.
- Reverse volume: 5 yd³ at 3 inches covers 540 sq ft. Missing supplier weight preserves the geometric volume but suppresses weight and delivery estimates.
- Known area: 500 sq ft at 3 inches and zero extra gives 4.63 yd³ and 250 half-cubic-foot bags. At an entered 1.5 short tons/yd³ it gives 6.94 short tons. Blank area stops the estimate; the four-bed mode works independently.
- Crusher run: 40 × 12 ft at 4 inches with zero extra gives 5.93 yd³ and 9.48 short tons at an entered 1.6 tons/yd³.
- Visualizers: cubic-yard totals match the calculator on initial load; the yardage pile and illustrative tonnage ticket follow their result fields.
- Selection helper: the firepit scenario separates landscape surfaces from appliance media; an active-channel scenario leads to riprap guidance; Start Over returns to the first step. Pure-function tests also cover all 288 complete answer combinations.

The browser host recorded an occasional exception with blank script URLs and an Electron sandbox frame while loading iframe previews. No stack frame identified a repository asset; the exception was not attributed to the application. The preview and calculator checks above completed. This record does not claim a clean third-party-ad or browser-host console, full WCAG certification, engineering-design approval, or live Google indexing verification.

Future pages should add a specific task, entity, attributes and parent to the map, then link to the next useful task. The regression tests reject unmapped content sources, missing rendered topic relationships and changes that accidentally exclude public pages from indexing.
