# Website structure and intent implementation — 1 November 2026

Implemented locally against the published repository baseline **9bd9d39**. No commit, push, deployment, URL removal, or GSC submission was performed.

## Scope and result

- 71 indexable pages, 2 utility pages (embed and 404), and 2 existing redirect aliases are accounted for.
- Every content page has an explicit purpose, page type, parent, topic group, main entity, relevant attributes and next-step links in **src/lib/content-map.mjs**.
- All 71 indexable pages retain their own canonical URL and remain in the sitemap. Embed and 404 remain excluded from indexing.
- Built HTML checks found zero orphan pages, zero pages without incoming main-content links, zero broken internal page or fragment links, zero duplicate titles/descriptions/identical main-content pages, zero heading-level jumps, zero unlabeled fields, zero duplicate IDs and zero JSON-LD parse errors.
- Short support pages were judged by their purpose. The contact page answers how to reach the site and what information to include; it was not padded to an arbitrary word target. Calculator value also includes its working inputs, formulas and outputs.

## What changed

1. **Topic hierarchy and links.** The library now groups pages by the measurement, material, project or maintenance task. Each page links to its real parent, its children when present, and a small set of useful next steps. Related material and project pages can cross-link when the next task requires them. The structure does not impose artificial barriers between useful topics.
2. **Page intent and entities.** Shared page titles, lead descriptions and WebPage entities follow the explicit map. Attributes describe actual measurements and product questions, such as finished depth, loose bulk weight, package volume, grading, fines, order increment, payload or pipe displacement. No invented authority score or keyword repetition was added.
3. **Breadcrumbs and semantic layout.** Visible breadcrumbs and BreadcrumbList JSON-LD come from the same hierarchy. Guide heading levels were corrected. The library uses topic sections and lists. All pages retain one H1, one main landmark and a skip target. A native Browse menu makes the library and key tasks available on smaller screens.
4. **Distinct general calculators.** The main tool covers six footprint shapes; the one-bed tool handles a rectangle, circle or known area; the square-foot tool adds known areas; the cubic-yard tool supports forward/reverse conversion; the yardage planner explains order rounding; and the tons tool explains weight conversion. The coverage chart explains unit-dependent lookup rather than repeating a shape calculator article.
5. **Product and standards accuracy.** The #57 and gravel-size guides now distinguish grading, sieve results, mineral type, washing, fines and loose density. The regional-name guide uses seven sourced regional examples rather than claiming interchangeable statewide products or universal density and compaction figures.
6. **Material-selection helper.** Results identify candidates and questions to confirm. Pipe drains, active channels and driveway courses lead to different next steps. Landscape rock is separated from manufacturer-approved fire-appliance media. Fixed construction depths, geotextile specifications and material certifications were removed from the recommendation logic.
7. **Quantity assumptions.** Crusher run accepts zero extra and a supplier weight. Cubic-yard delivery estimates use entered volume and payload limits. The square-foot tool accepts a supplier weight and stops on invalid inputs. Preset weights, pallet counts, pile shapes and delivery examples are identified as assumptions. Delivery-fee savings are no longer promised. Output-dependent visualizers now synchronize with calculated results.
8. **Support information.** Privacy copy now describes browser storage, share URLs and optional email accurately. Duplicate support-page WebPage markup was consolidated into the shared graph. Terms distinguish planning estimates from delivered quantities. Sitemap modification dates were updated only for 14 substantive page changes.

## Responsive layout fixes

The layered planner and widget builder no longer force the mobile page wider than the screen. Form-grid children can shrink, and the planner’s material and depth fields stack on narrow screens.

## Page decisions

No existing indexable page was removed or consolidated into another URL. Material pages, unit-specific ordering tools, project tools and reference guides have related subjects but different user tasks. Support policies and contact information support the tool’s operation and trust. Existing evidence did not justify mass deletion or noindex changes.

The audit found no identical rendered main-content pages. An editorial similarity check also found no article pair above a 0.45 five-word-shingle Jaccard threshold where an article body was available. This is an overlap screen, not a numerical measure of fluff, usefulness or search-intent competition. The revised purposes below provide the editorial distinction; actual query overlap needs Search Console data.

## Complete topical and intent map

“Main words” counts rendered main content excluding navigation, scripts, styles and SVGs. It includes tool labels and explanatory copy and is provided for review, not as a quality score. The entity and attributes are the editorial model; only appropriate visible information is reflected in structured data.

### Measure, convert and order

Start with geometry, compare depths, and choose the unit your supplier sells.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Rock Coverage Calculator](https://rockcoveragecalculator.com/) — calculator | Measure one of six area shapes, choose a rock and finished depth, and estimate loose cubic yards, US short tons and 0.5-cu-ft bags. Replace the density with your supplier’s value when available. | **Rock quantity estimation:** area shape; finished depth; loose bulk density; order allowance; bag volume | Site root | 2085 |
| [How Much Rock Do I Need?](https://rockcoveragecalculator.com/how-much-rock-do-i-need) — measurement guide | Work from the rock-covered footprint and finished layer depth to an order quantity. Measure rectangles, curves and planting gaps before choosing a density or buying bags. | **Rock area and layer measurement:** measured footprint; finished layer depth; order allowance | / | 1332 |
| [Rock Calculator for One Bed](https://rockcoveragecalculator.com/rock-calculator) — calculator | Estimate one rectangle, full circle or known area in cubic yards, estimated US short tons and half-cubic-foot bags. Use the main calculator for rings, triangles, trapezoids and L-shaped areas. | **Single-bed rock quantity:** rectangle or circle; known square footage; finished depth; material preset | / | 1031 |
| [Rock Calculator from Square Feet](https://rockcoveragecalculator.com/rock-square-foot-calculator) — calculator | Enter known square footage or add up to four measured beds, then compare the rock volume at several depths. Use one depth and material for this combined-area estimate. | **Square-foot rock coverage:** total square feet; bed areas; depth comparison; US short tons | /rock-calculator | 831 |
| [Rock Cubic Yard and Coverage Calculator](https://rockcoveragecalculator.com/rock-coverage-calculator-yard) — calculator | Convert square feet and inches to cubic yards, or reverse the calculation to find the area a known volume covers. Estimate weight and delivery count with supplier bulk weight, usable volume and payload limits. | **Cubic-yard rock coverage:** square feet; finished depth; known cubic yards; reverse coverage; loose bulk weight; vehicle volume and payload | /rock-calculator | 1082 |
| [Rock Yardage Order Planner](https://rockcoveragecalculator.com/rock-yardage-calculator) — calculator | Turn measured volume into a bulk order using extra material, seller yard increments and a handling estimate. Keep the exact layer volume separate from the rounded quantity you purchase. | **Bulk rock ordering:** finished volume; order allowance; seller increment; handling capacity | /rock-coverage-calculator-yard | 807 |
| [Rock Tons Calculator from Cubic Yards](https://rockcoveragecalculator.com/rock-tons-calculator) — calculator | Convert loose cubic yards or a measured layer into estimated US short tons. Use the product’s loose bulk weight, and treat any moisture adjustment separately from its density. | **Rock volume-to-weight conversion:** loose cubic yards; loose bulk weight; moisture adjustment; US short tons | /rock-calculator | 724 |
| [Rock Bag Calculator from Labeled Volume](https://rockcoveragecalculator.com/rock-bag-calculator) — calculator | Calculate whole bags from area, finished depth and the cubic feet printed on the bag. Optional labeled weight, pallet size and local prices help compare the order you can actually buy. | **Bagged rock quantity:** labeled bag volume; whole bags; labeled bag weight; local price | /rock-calculator | 1108 |
| [Rock Coverage Chart by Depth](https://rockcoveragecalculator.com/rock-coverage-chart) — reference calculator | Compare geometric square-foot coverage at different layer depths. Cubic-yard coverage follows volume math; coverage per US short ton also depends on the selected loose bulk weight. | **Rock coverage per unit:** layer depth; square feet per cubic yard; square feet per short ton; bulk density | /how-much-rock-do-i-need | 936 |
| [Rock Depth Guide for Beds, Paths and Base Layers](https://rockcoveragecalculator.com/rock-depth-guide) — guide | Choose the thickness of the particular rock layer you are estimating. Decorative cover, a walking surface, a compacted base and a drain envelope need different product and site checks. | **Finished aggregate layer depth:** finished thickness; particle size; separate courses; site use | /how-much-rock-do-i-need | 1471 |
| [Rock Bulk Density and Weight Reference](https://rockcoveragecalculator.com/rock-density-chart) — reference guide | Compare the site’s material planning weights and convert pounds per cubic yard to US short tons. Check how product grading, voids and moisture change the loose weight you should enter. | **Aggregate loose bulk density:** pounds per cubic yard; short tons per cubic yard; loose versus compacted density; supplier product | /how-much-rock-do-i-need | 1288 |
| [Bulk vs Bagged Rock: Compare Delivered Orders](https://rockcoveragecalculator.com/bulk-vs-bagged-rock) — buying guide | Compare quotes for the same rock quantity, including whole bags, bulk minimums, delivery and the work of moving the material. Local product yield and access can change which order is practical. | **Bulk and bagged rock purchasing:** equivalent volume; bag price; bulk quote; delivery minimum; access | /rock-yardage-calculator | 888 |
| [Rock Bag Weight, Price and Pickup Guide](https://rockcoveragecalculator.com/rock-bag-weight-and-price-guide) — buying calculator | Use the bag’s labeled volume, weight and price to estimate whole-bag cost and pickup trips. Enter the vehicle’s remaining rated payload after occupants, tools and other cargo. | **Rock bag labels and pickup payload:** cubic feet per bag; pounds per bag; price per bag; remaining payload | /rock-bag-calculator | 352 |

### Gravel and compactable base

Separate loose gravel quantities, compacted base requirements, and local product names.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Gravel Calculator: Loose Yards and Tons](https://rockcoveragecalculator.com/gravel-calculator) — calculator | Estimate one gravel layer from a rectangular or circular footprint, depth and order allowance. Adjust the loose bulk density for the gravel product your supplier will deliver. | **Gravel quantity:** gravel product; area shape; layer depth; loose bulk density | /calculators | 980 |
| [Gravel Tons Calculator](https://rockcoveragecalculator.com/gravel-tons-calculator) — calculator | Estimate US short tons from the gravel-covered area and finished thickness. Edit the loose tons-per-yard factor and compare the tonnage of separate base and surface orders. | **Gravel order weight:** square feet; finished depth; supplier tons per yard; order extra | /gravel-calculator | 1263 |
| [Gravel Cubic Yard Calculator](https://rockcoveragecalculator.com/gravel-cubic-yard-calculator) — calculator | Calculate finished gravel volume, add a chosen allowance and round to the seller’s yard increment. Keep a compacted layer’s specified thickness separate from the loose quantity being shipped. | **Gravel order volume:** finished cubic yards; loose order; seller yard increment; allowance | /gravel-calculator | 1201 |
| [Gravel Bag Calculator](https://rockcoveragecalculator.com/gravel-bag-calculator) — calculator | Count whole gravel bags using the package’s cubic-foot yield, then compare the labeled weight, pallet quantity and store price. Check whether the bag contains rounded gravel or crushed aggregate. | **Bagged gravel coverage:** bag volume; bag weight; whole bags; pallet count; price | /gravel-calculator | 1233 |
| [Gravel Sizes: Read the Product Gradation](https://rockcoveragecalculator.com/gravel-sizes) — reference guide | Distinguish a stone size number, a nominal size range and a local trade name. Read the supplier’s gradation and fines information before choosing drainage stone, a surface aggregate or base. | **Aggregate size designations:** size designation; sieve opening; percent passing; fines content; local name | /gravel-calculator | 675 |
| [Regional Gravel Names and Specification Checks](https://rockcoveragecalculator.com/gravel-trade-names-by-state) — reference guide | Use regional names such as QP, ABC, CA-6 and 21-A to ask better questions at the yard. A familiar name is a lead to a product specification, not proof that two loads are interchangeable. | **Regional aggregate trade names:** regional name; agency specification; gradation; fines; intended course | /gravel-sizes | 521 |
| [Crusher Run and Base Rock Calculator](https://rockcoveragecalculator.com/crusher-run-calculator) — calculator | Estimate the specified crusher-run or dense-graded base layer in cubic yards and approximate US short tons. Separate finished thickness, ordering extra and the supplier’s loose weight. | **Dense-graded aggregate base:** finished base thickness; dense grading; loose bulk weight; order allowance | /gravel-calculator | 613 |

### Crushed stone and drainage aggregate

Check stone grading, fines, trench geometry, and the supplier’s actual bulk weight.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Crushed Stone Calculator](https://rockcoveragecalculator.com/crushed-stone-calculator) — calculator | Estimate a specified crushed-stone layer and compare clean stone with a mix containing fines. Enter the supplier’s loose bulk weight instead of treating the size number as a density. | **Crushed aggregate quantity:** gradation; finished layer; fines content; loose bulk weight | /calculators | 1121 |
| [Crushed Stone Tons Calculator](https://rockcoveragecalculator.com/crushed-stone-tons-calculator) — calculator | Convert a measured crushed-stone layer into US short tons using the product’s loose bulk weight. Keep clean #57 and a compactable base mix separate when entering allowances. | **Crushed-stone order weight:** finished layer volume; product bulk weight; short tons; clean versus dense graded | /crushed-stone-calculator | 1182 |
| [Crushed Stone Yardage Calculator](https://rockcoveragecalculator.com/crushed-stone-yardage-calculator) — calculator | Find installed cubic yards, a chosen loose order and the seller’s rounded yard quantity. Use the product weight and actual truck limits when estimating tons and delivery loads. | **Crushed-stone order volume:** cubic yards; order increment; supplier bulk weight; payload and volume limits | /crushed-stone-calculator | 1081 |
| [Crushed Stone Bag Calculator](https://rockcoveragecalculator.com/crushed-stone-bag-calculator) — calculator | Turn a small crushed-stone layer into whole bags using labeled cubic feet. Use package weight and price separately, and check whether the bag’s grading suits the planned layer. | **Bagged crushed stone:** package volume; bag weight; product grading; whole bags; cost | /crushed-stone-calculator | 1032 |
| [Crushed Granite Calculator](https://rockcoveragecalculator.com/crushed-granite-calculator) — calculator | Estimate coarse crushed granite in cubic yards and US short tons. Distinguish clean stone, a graded mix with fines and finer decomposed granite before using the seller’s weight conversion. | **Coarse crushed granite:** granite grading; fines; finished depth; supplier loose weight | /crushed-stone-calculator | 995 |
| [Trap Rock Calculator](https://rockcoveragecalculator.com/trap-rock-calculator) — calculator | Estimate the trap-rock product on your quote using finished depth, loose weight and bag volume. The geological name does not establish grading, yield or a structural specification. | **Crushed trap rock:** screened size; loose bulk weight; bag yield; finished thickness | /crushed-stone-calculator | 1266 |
| [Drain Rock Trench Calculator](https://rockcoveragecalculator.com/drain-rock-calculator) — calculator | Calculate the stone-filled part of a trench after top cover and pipe displacement. Confirm the specified grading, fines content, filter and outlet separately from the material quantity. | **Drain trench aggregate envelope:** trench width and depth; top cover; pipe outside diameter; stone envelope | /crushed-stone-calculator | 1077 |
| [#57 Stone: Size, Fines and Ordering Checks](https://rockcoveragecalculator.com/57-stone-size-guide) — reference guide | Understand what a #57 grading describes, how sieve results are read and which product details still need confirmation. Size designation, mineral type, washing and loose density are separate properties. | **#57 aggregate grading:** size designation; sieve results; fines content; mineral type; bulk density | /crushed-stone-calculator | 718 |

### Pea gravel

Plan a loose surface, compare coverage, or turn the quantity into a ton, yard, or bag order.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Pea Gravel Calculator](https://rockcoveragecalculator.com/pea-gravel-calculator) — calculator | Estimate a loose pea-gravel layer from bed dimensions, depth and order extra. Compare volume, approximate weight, half-cubic-foot bags and the perimeter that may need edging. | **Pea gravel quantity:** rounded gravel; finished depth; order allowance; edging perimeter | /calculators | 1201 |
| [Pea Gravel Coverage Calculator](https://rockcoveragecalculator.com/pea-gravel-coverage-calculator) — calculator | Find the area covered by a known ton, yard or bag of pea gravel at your depth, or reverse the estimate for an area you need to cover. Weight and bag-volume inputs affect their own conversions. | **Pea gravel area yield:** stock quantity; stock unit; depth; bulk density; bag volume | /pea-gravel-calculator | 1176 |
| [Pea Gravel Tons Calculator](https://rockcoveragecalculator.com/pea-gravel-tons-calculator) — calculator | Estimate US short tons for a pea-gravel layer using area, finished depth and the seller’s loose weight. Compare the measured volume with your optional ordering allowance. | **Pea gravel order weight:** area; finished depth; tons per cubic yard; extra material | /pea-gravel-calculator | 1082 |
| [Pea Gravel Cubic Yard Calculator](https://rockcoveragecalculator.com/pea-gravel-cubic-yard-calculator) — calculator | Estimate loose pea-gravel yards from dimensions or square footage. Enter only the pea-gravel surface thickness; a patio’s crushed-stone base is a separate layer and order. | **Pea gravel order volume:** surface footprint; pea-gravel thickness; cubic yards; order allowance | /pea-gravel-calculator | 1050 |
| [Pea Gravel Bag Calculator](https://rockcoveragecalculator.com/pea-gravel-bag-calculator) — calculator | Calculate whole pea-gravel bags from the product’s stated cubic-foot yield. Use labeled bag weight, pack quantity and local prices to plan pickup or compare bulk delivery. | **Bagged pea gravel:** labeled volume; bag weight; pack quantity; whole-bag price | /pea-gravel-calculator | 1130 |
| [Pea Gravel Patio and Base Calculator](https://rockcoveragecalculator.com/pea-gravel-patio-calculator) — calculator | Estimate a pea-gravel patio’s loose surface, separate compacted base and border length. Confirm the base specification, site drainage and suitability of a loose surface for furniture and access. | **Layered pea-gravel patio:** patio footprint; surface depth; base depth; loose base allowance; edging | /pea-gravel-calculator | 1388 |

### River rock

Measure rounded-stone beds and linings, then compare bulk and bagged quantities.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [River Rock Calculator](https://rockcoveragecalculator.com/river-rock-calculator) — calculator | Estimate a rounded-stone bed in yards, approximate tons and bags using its measured area and finished depth. Match the density and selected stone size to the actual supplier product. | **Rounded river rock quantity:** rounded stone size; bed area; finished depth; supplier density | /calculators | 1299 |
| [River Rock Coverage Calculator](https://rockcoveragecalculator.com/river-rock-coverage-calculator) — calculator | Compare river-rock coverage per yard, short ton or bag at the chosen depth. The geometric yield does not promise full visual coverage for every pebble size or placement pattern. | **River rock area yield:** known stock; depth; loose density; bag volume; visual coverage | /river-rock-calculator | 1325 |
| [River Rock Tons Calculator](https://rockcoveragecalculator.com/river-rock-tons-calculator) — calculator | Convert river-rock bed measurements into estimated US short tons with editable loose bulk weight. Enter the actual layer thickness rather than assuming the product’s size is the layer depth. | **River rock order weight:** measured area; finished thickness; loose bulk weight; short tons | /river-rock-calculator | 1083 |
| [River Rock Cubic Yard Calculator](https://rockcoveragecalculator.com/river-rock-cubic-yard-calculator) — calculator | Calculate the yards for a rounded-rock bed or lining. Measure curves and stone-lined banks in sections, then add the required volume before choosing a bulk or bagged order. | **River rock order volume:** measured footprint; lining surface; finished depth; order allowance | /river-rock-calculator | 1114 |
| [River Rock Bag Calculator](https://rockcoveragecalculator.com/river-rock-bag-calculator) — calculator | Estimate whole bags from the package’s cubic-foot volume, then use labeled weight, pallet size and price for the purchase. Check pebble size and a sample spread before assuming visual opacity. | **Bagged river rock:** package volume; stone size; bag weight; pallet count; price | /river-rock-calculator | 1014 |
| [Dry Creek Bed: Measure the Stone Lining](https://rockcoveragecalculator.com/dry-creek-bed) — project guide | Measure the bed bottom and sloping banks to estimate a stone lining. Establish the water route and outlet before treating a decorative creek-bed quantity as part of a drainage project. | **Decorative stone-lined channel:** lining surface; slope width; stone layer; water route; outlet | /river-rock-calculator | 497 |

### Decomposed granite

Keep finished path thickness, loose ordering volume, and weight conversions separate.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Decomposed Granite Calculator](https://rockcoveragecalculator.com/decomposed-granite-calculator) — calculator | Estimate a finished DG path or patio layer, then adjust its loose density and extra order volume. Confirm whether the supplied product is natural, stabilized or a different granite-fines blend. | **Decomposed granite path layer:** DG product; finished depth; loose density; order allowance | /calculators | 885 |
| [Decomposed Granite Coverage Calculator](https://rockcoveragecalculator.com/decomposed-granite-coverage-calculator) — calculator | Estimate the area covered by a loose yard or ton of DG after a chosen placement allowance. Keep the compacted DG surface separate from any prepared base underneath. | **Finished DG coverage:** loose stock volume; finished surface depth; loose-to-finished allowance; supplier weight | /decomposed-granite-calculator | 1075 |
| [Decomposed Granite Tons Calculator](https://rockcoveragecalculator.com/decomposed-granite-tons-calculator) — calculator | Estimate DG short tons from finished dimensions, a chosen loose-order increase and product-specific density. A compaction percentage must be defined before it can be used in a weight estimate. | **DG loose order weight:** finished volume; loose-order increase; tons per cubic yard; supplier product | /decomposed-granite-calculator | 987 |

### Landscape lava rock

Use the selected bag yield or supplier bulk weight for this lightweight decorative material.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Lava Rock Calculator](https://rockcoveragecalculator.com/lava-rock-calculator) — calculator | Estimate a landscape lava-rock layer in loose yards, approximate tons and whole bags. Lightweight porous products vary, so match the bulk weight and bag yield to the chosen material. | **Landscape lava rock:** landscape product; loose bulk weight; bag volume; finished layer depth | /decorative-rock-calculator | 1068 |
| [Lava Rock Coverage Calculator](https://rockcoveragecalculator.com/lava-rock-coverage-calculator) — calculator | Compare the area a yard, short ton or bag of landscape lava rock covers at your depth. A weight-based yield needs the actual lightweight product’s loose bulk density. | **Landscape lava-rock area yield:** stock unit; depth; porous product bulk weight; bag yield | /lava-rock-calculator | 919 |
| [Lava Rock Bag Calculator](https://rockcoveragecalculator.com/lava-rock-bag-calculator) — calculator | Calculate whole landscape lava-rock bags using labeled cubic feet, then estimate cost and handling from the package weight. Landscape mulch stone is a different product specification from fire-appliance media. | **Bagged landscape lava rock:** bag volume; bag weight; whole bags; landscape product specification | /lava-rock-calculator | 1073 |

### Marble chips

Estimate a white-stone layer and check the actual product weight, bag size, and price.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Marble Chips Calculator](https://rockcoveragecalculator.com/marble-chips-calculator) — calculator | Estimate a marble-chip bed in yards, approximate tons and half-cubic-foot bag equivalents. Confirm the product’s loose weight, selected depth and suitability for the surrounding planting conditions. | **Decorative marble chips:** chip size; finished depth; loose bulk weight; planting conditions | /decorative-rock-calculator | 953 |
| [Marble Chips Bag Calculator](https://rockcoveragecalculator.com/marble-chips-bag-calculator) — calculator | Count whole marble-chip bags using the cubic feet on the label and your bed dimensions. Add the actual package weight, local price and pack count to compare buying options. | **Bagged marble-chip order:** labeled bag volume; whole bags; bag weight; price and pack count | /marble-chips-calculator | 884 |

### Decorative beds and planting areas

Compare decorative materials, measure planting gaps, and plan installation and upkeep.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Decorative Rock Material Comparison Calculator](https://rockcoveragecalculator.com/decorative-rock-calculator) — calculator | Compare the same decorative bed volume using different material weights and bag sizes. Particle size, planting conditions and appearance affect the product choice separately from quantity. | **Decorative rock material comparison:** bed footprint; decorative depth; material weight; bag size | /calculators | 1450 |
| [Landscape Rock Bed Calculator](https://rockcoveragecalculator.com/landscape-rock-calculator) — calculator | Estimate the rock-covered part of a landscape bed in yards, approximate tons and half-cubic-foot bags. Exclude planting openings and paving, and plan containment and upkeep around the plants. | **Landscape rock mulch bed:** covered bed area; planting gaps; finished depth; rock mulch maintenance | /decorative-rock-calculator | 1101 |
| [Garden Rock Calculator for Planting Beds](https://rockcoveragecalculator.com/garden-rock-calculator) — calculator | Estimate stone around planting pockets, borders and small garden spaces. Subtract uncovered openings and use the chosen product’s bulk weight and bag yield before buying. | **Garden bed stone coverage:** planting pockets; net rock area; stone depth; bag yield | /landscape-rock-calculator | 1289 |
| [Beach Pebble Calculator](https://rockcoveragecalculator.com/beach-pebble-calculator) — calculator | Estimate a beach-pebble bed or border from measured area, finished depth and the package yield. Read bag volume, loose bulk weight and pallet quantity as separate purchasing attributes. | **Decorative beach pebbles:** pebble size; finished depth; package volume; loose bulk weight; pack quantity | /decorative-rock-calculator | 1156 |
| [Egg Rock Calculator](https://rockcoveragecalculator.com/egg-rock-calculator) — calculator | Estimate a rounded egg-rock surface using dimensions or a known area. Product size, supplier loose weight and labeled bag volume can differ between yards and retailers. | **Rounded decorative egg rock:** rounded product size; bed area; finished thickness; supplier weight; bag volume | /decorative-rock-calculator | 1360 |
| [Rock vs Mulch: Ten-Year Cost Comparison](https://rockcoveragecalculator.com/rock-vs-mulch-calculator) — comparison calculator | Compare the same bed and ten-year period using local installation, delivery, replenishment and maintenance costs. Either material can cost less; the outcome follows the assumptions you enter. | **Rock and organic mulch ownership costs:** same bed area; initial installation; annual replenishment; maintenance; ten-year period | /landscape-rock-calculator | 313 |
| [How to Install a Decorative Landscape Rock Bed](https://rockcoveragecalculator.com/how-to-install-landscape-rock) — installation guide | Plan a decorative bed’s footprint, planting gaps, finished grade, edging and stone order, then place and maintain the surface. Loaded bases and functional drainage layers require their own details. | **Decorative rock bed installation:** planting gaps; finished grade; edging; stone depth; upkeep | /landscape-rock-calculator | 528 |

### Paving, driveway and layered projects

Estimate the specified courses or individual paving pieces without treating quantity as a design specification.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Driveway Rock Base and Surface Calculator](https://rockcoveragecalculator.com/driveway-rock-calculator) — calculator | Estimate a driveway top-up or separate base and surface courses. Enter finished depths, loose-order allowances and supplier weights for each material instead of applying one universal driveway section. | **Driveway aggregate courses:** driveway footprint; separate courses; finished depths; loose allowances; supplier weights | /calculators | 1240 |
| [Layered Rock Project and Shopping List Calculator](https://rockcoveragecalculator.com/layered-project-calculator) — calculator | Build separate base and surface quantities from a shared footprint, then estimate fabric area and edging length. Enter the loose-order increase and supplier density for each selected layer. | **Multiple aggregate layer takeoff:** shared footprint; base course; surface course; loose-order increase; fabric overlap; edging length | /calculators | 419 |
| [Landscape Stone Layer Calculator](https://rockcoveragecalculator.com/landscape-stone-calculator) — calculator | Estimate one landscape stone, bedding or base layer using its finished footprint and thickness. Compare installed volume with a chosen loose-volume increase and product weight before adding another course. | **Single construction aggregate layer:** single finished layer; loose-volume increase; supplier density; layer purpose | /layered-project-calculator | 1457 |
| [Cobblestone Piece and Border Calculator](https://rockcoveragecalculator.com/cobblestone-calculator) — calculator | Count individual cobbles for a paved field or a single-row border using the visible stone face and planned joints. Pack size and piece weight are separate from the area calculation. | **Cobblestone paving and edging pieces:** visible stone face; joint width; paved area; border run; piece weight; pack count | /calculators | 1670 |
| [Riprap Layer Quantity Calculator](https://rockcoveragecalculator.com/riprap-calculator) — calculator | Estimate a specified riprap layer from its actual surface area and thickness, then use supplier loose weight and payload for order planning. Stone size, filters and hydraulic design must come from the project detail. | **Specified riprap armor layer:** slope surface; specified thickness; gradation; loose bulk weight; payload | /calculators | 1264 |
| [Which Rock Should I Use? Material Selection Helper](https://rockcoveragecalculator.com/which-rock-should-i-use) — selection helper | Compare candidate materials for the project, traffic, water conditions and appearance you describe. Confirm the actual grading and installation requirements before using a quantity calculator. | **Landscape aggregate selection:** project use; traffic; water conditions; stone shape; gradation | /calculators | 715 |
| [Angular vs Rounded Rock: Match Shape to Use](https://rockcoveragecalculator.com/angular-vs-rounded-rock) — comparison guide | Compare angular and rounded particles together with grading, fines and confinement. Shape affects movement, but it does not by itself establish drainage, load capacity or the correct layer specification. | **Aggregate particle shape:** particle shape; grading; fines; confinement; surface use | /which-rock-should-i-use | 455 |

### Diagnose and maintain the surface

Identify runoff, soil mixing, and weed causes before adding another layer of stone.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Stop Gravel Washing Out: Diagnose the Runoff](https://rockcoveragecalculator.com/how-to-stop-gravel-washing-out-on-slope) — troubleshooting guide | Trace where water enters and leaves the gravel surface before adding more stone. Measure the slope and select the repair detail before estimating replacement aggregate or an outlet lining. | **Gravel surface erosion:** water entry; runoff path; slope; surface grading; outlet | /driveway-rock-calculator | 1626 |
| [Fix Rock Sinking into Soil: Identify the Cause](https://rockcoveragecalculator.com/how-to-fix-rock-sinking-into-soil) — troubleshooting guide | Distinguish stone mixing into soft soil from debris burying a bed or runoff moving it away. Diagnose support and drainage before estimating the material needed to rebuild the affected layer. | **Soil and aggregate mixing:** soil support; stone separation; sediment; drainage; replacement layer | /how-to-install-landscape-rock | 1062 |
| [Control Weeds in Landscape Rock](https://rockcoveragecalculator.com/how-to-stop-weeds-in-landscape-rock) — maintenance guide | Identify where weeds root, remove existing growth and reduce the soil and debris collecting among the stones. Compare cleaning, edging and barrier choices without assuming a permanently weed-free bed. | **Weeds in rock mulch:** weed rooting location; organic debris; bed edges; barrier condition; upkeep | /how-to-install-landscape-rock | 1393 |

### Use the site and understand its limits

Read the calculation methods, contact the site, embed the tool, and review data handling and terms.

| Page and role | User task | Entity and important attributes | Parent | Main words |
| --- | --- | --- | --- | ---: |
| [Rock Calculators and Project Guides](https://rockcoveragecalculator.com/calculators) — directory | Choose a material, a selling unit, or a project task. Each tool below identifies the quantity it estimates and the assumptions to check before ordering. | **Rock quantity tools and guides:** material; selling unit; project task | / | 1467 |
| [About Our Formulas and Assumptions](https://rockcoveragecalculator.com/about) — methodology | Understand the geometry, material assumptions and limits behind the estimates. Separate fixed unit conversions from product-specific weights and optional ordering allowances. | **Rock Coverage Calculator methods:** geometry; unit conversions; material assumptions; estimate limits | /calculators | 409 |
| [Contact Rock Coverage Calculator](https://rockcoveragecalculator.com/contact) — contact | Email a calculation question, report a website problem or suggest a correction. Include the page address, measurements, units and product assumptions so the issue can be reproduced. | **Rock Coverage Calculator contact:** page address; input values; product reference; email contact | /about | 157 |
| [Privacy Policy](https://rockcoveragecalculator.com/privacy) — policy | Read how calculator inputs, saved browser projects, shared URLs, email contact and third-party services relate to your data. | **Rock Coverage Calculator data handling:** calculator inputs; browser storage; shared URLs; email; third parties | /about | 947 |
| [Terms of Use and Estimation Limits](https://rockcoveragecalculator.com/terms) — policy | Review permitted use and the limits of quantity estimates. Product selection, installation requirements, supplier quotes and actual delivered weights need their own checks. | **Rock Coverage Calculator terms of use:** permitted use; planning estimates; supplier verification; site responsibilities | /about | 565 |
| [Embed the Rock Coverage Calculator](https://rockcoveragecalculator.com/calculator-widget) — widget instructions | Choose a widget theme, copy the iframe code and test the embedded calculator on your own page. The embedded estimate uses the same area, depth and material assumptions as the main tool. | **Embeddable rock coverage calculator:** iframe URL; theme; container height; calculator assumptions | /about | 406 |
| [Rock Coverage Calculator Widget](https://rockcoveragecalculator.com/embed) — widget (noindex utility) | Enter the project shape, material and finished depth to estimate cubic yards, US short tons and half-cubic-foot bags. Check the selected product assumptions before ordering. | **Embedded rock quantity tool:** project shape; material; depth; density; bag volume | /calculator-widget | 454 |
| [Page Not Found](https://rockcoveragecalculator.com/404) — error (noindex utility) | The requested page is unavailable. Return to the main calculator or browse the calculator and guide library. | **Unavailable page:** requested address; available navigation | /calculators | 19 |

## Redirect aliases

| Existing alias | Destination |
| --- | --- |
| /rock-cubic-yard-calculator | /rock-coverage-calculator-yard |
| /rock-coverage-calculator-yards | /rock-coverage-calculator-yard |

## Validation and limits

- Production build and TypeScript checks: passed, zero errors.
- Regression tests: 25 passed, including map/source coverage, rendered topic relationships, breadcrumb/entity consistency, indexability, crawl reachability, HTTP status/redirect behavior, source-conflict guards, delivery limits, zero-extra base orders and material-selector outcomes.
- The pure selector test exercises all 288 complete answer combinations. Browser tests cover fire-appliance and active-channel outcomes and restart behavior.
- Static checks cover all 73 content/utility documents; the asset and inline-script check also covers the two redirect documents. All 71 public pages were checked at 375px and 1280px browser widths. The two mobile overflow findings were fixed and retested. Eight representative layouts were also checked at 320px and library navigation at 1024px. Browser validation details are in the companion verification record.
- These are local implementation and validation results. They do not establish the live deployment’s state, a Google ranking change, a recognized topical-authority score, or an indexing guarantee.

## Source guidance

The implementation follows [Google’s people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [crawlable-link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), and [structured-data content policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies). Material explanations link to their specific primary references in the visible page, including [Penn State’s materials calculator](https://dirtandgravel.psu.edu/general-resources/dglvr-materials-calculator/) and [PennDOT aggregate records](https://www.pa.gov/agencies/penndot/programs-and-doing-business/construction/aggregate-plant-book).
