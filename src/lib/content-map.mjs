/**
 * Editorial map for every canonical route. Describes user tasks, entity scope, and hub hierarchy.
 * Summaries, attributes, and links stay synchronized with each tool and guide.
 * @typedef {{route:string,title:string,parent:string|null,cluster:string,summary:string,entity:string,attributes:string[],links:string[],kind:string,indexable:boolean}} ContentPage
 */

export const SITE_PURPOSE = 'Estimate rock and aggregate quantities from measured area, finished layer depth, and product-specific ordering information.';

export const TOPICS = {
  measure: { title: 'Measure, convert and order', description: 'Start with geometry, compare depths, and choose the unit your supplier sells.' },
  gravel: { title: 'Gravel and compactable base', description: 'Separate loose gravel quantities, compacted base requirements, and local product names.' },
  crushed: { title: 'Crushed stone and drainage aggregate', description: 'Check stone grading, fines, trench geometry, and the supplier’s actual bulk weight.' },
  pea: { title: 'Pea gravel', description: 'Plan a loose surface, compare coverage, or turn the quantity into a ton, yard, or bag order.' },
  river: { title: 'River rock', description: 'Measure rounded-stone beds and linings, then compare bulk and bagged quantities.' },
  dg: { title: 'Decomposed granite', description: 'Keep finished path thickness, loose ordering volume, and weight conversions separate.' },
  lava: { title: 'Landscape lava rock', description: 'Use the selected bag yield or supplier bulk weight for this lightweight decorative material.' },
  marble: { title: 'Marble chips', description: 'Estimate a white-stone layer and check the actual product weight, bag size, and price.' },
  landscape: { title: 'Decorative beds and planting areas', description: 'Compare decorative materials, measure planting gaps, and plan installation and upkeep.' },
  projects: { title: 'Paving, driveway and layered projects', description: 'Estimate the specified courses or individual paving pieces without treating quantity as a design specification.' },
  maintenance: { title: 'Diagnose and maintain the surface', description: 'Identify runoff, soil mixing, and weed causes before adding another layer of stone.' },
  support: { title: 'Use the site and understand its limits', description: 'Read the calculation methods, contact the site, embed the tool, and review data handling and terms.' }
};

/** @param {Omit<ContentPage,'kind'|'indexable'> & {kind?:string,indexable?:boolean}} data @returns {ContentPage} */
function page(data) { return { kind: 'calculator', indexable: true, ...data }; }

export const CONTENT_PAGES = [
  page({
    route: '/',
    title: 'Rock Coverage Calculator',
    parent: null,
    cluster: 'measure',
    entity: 'Rock quantity estimation',
    summary: 'Measure one of six area shapes, choose a rock and finished depth, and estimate loose cubic yards, short tons and 0.5-cu-ft bags. Replace the density with your supplier’s value when available.',
    attributes: ['area shape', 'finished depth', 'loose bulk density', 'order allowance', 'bag volume'],
    links: ['/how-much-rock-do-i-need', '/which-rock-should-i-use', '/rock-coverage-chart', '/calculators']
  }),
  page({
    route: '/calculators',
    title: 'Rock Calculators and Project Guides',
    parent: '/',
    cluster: 'support',
    kind: 'directory',
    entity: 'Rock quantity tools and guides',
    summary: 'Choose a material, a selling unit, or a project task. Each tool below identifies the quantity it estimates and the assumptions to check before ordering.',
    attributes: ['material', 'selling unit', 'project task'],
    links: ['/how-much-rock-do-i-need', '/which-rock-should-i-use', '/about']
  }),
  page({
    route: '/how-much-rock-do-i-need',
    title: 'How Much Rock Do I Need?',
    parent: '/',
    cluster: 'measure',
    kind: 'measurement guide',
    entity: 'Rock area and layer measurement',
    summary: 'Work from the rock-covered footprint and finished layer depth to an order quantity. Measure rectangles, curves and planting gaps before choosing a density or buying bags.',
    attributes: ['measured footprint', 'finished layer depth', 'order allowance'],
    links: ['/rock-square-foot-calculator', '/rock-coverage-calculator-yard', '/rock-depth-guide', '/rock-coverage-chart']
  }),
  page({
    route: '/rock-square-foot-calculator',
    title: 'Rock Calculator from Square Feet',
    parent: '/',
    cluster: 'measure',
    entity: 'Square-foot rock coverage',
    summary: 'Enter known square footage or add up to four measured beds, then compare the rock volume at several depths. Use one depth and material for this combined-area estimate.',
    attributes: ['total square feet', 'bed areas', 'depth comparison', 'short tons'],
    links: ['/how-much-rock-do-i-need', '/rock-coverage-chart', '/layered-project-calculator', '/rock-depth-guide']
  }),
  page({
    route: '/rock-coverage-calculator-yard',
    title: 'Rock Cubic Yard and Order Calculator',
    parent: '/',
    cluster: 'measure',
    entity: 'Cubic-yard rock coverage and ordering',
    summary: 'Convert square feet and inches to cubic yards, round to supplier selling increments, estimate wheelbarrow trips, or reverse-calculate the area a known volume covers.',
    attributes: ['square feet', 'finished depth', 'known cubic yards', 'seller increment', 'reverse coverage', 'wheelbarrow loads'],
    links: ['/rock-tons-calculator', '/rock-coverage-chart', '/bulk-vs-bagged-rock', '/how-much-rock-do-i-need']
  }),
  page({
    route: '/rock-tons-calculator',
    title: 'Rock Tons Calculator from Cubic Yards',
    parent: '/',
    cluster: 'measure',
    entity: 'Rock volume-to-weight conversion',
    summary: 'Convert loose cubic yards or a measured layer into estimated short tons. Use the product’s loose bulk weight, and treat any moisture adjustment separately from its density.',
    attributes: ['loose cubic yards', 'loose bulk weight', 'moisture adjustment', 'short tons'],
    links: ['/rock-density-chart', '/rock-coverage-calculator-yard', '/gravel-calculator', '/river-rock-calculator']
  }),
  page({
    route: '/rock-bag-calculator',
    title: 'Rock Bag, Weight and Pallet Calculator',
    parent: '/',
    cluster: 'measure',
    entity: 'Bagged rock quantity and hauling weight',
    summary: 'Calculate whole bags from area, finished depth and labeled cubic feet, compare full-pallet splits, and check total packaged weight against your vehicle payload capacity.',
    attributes: ['labeled bag volume', 'whole bags', 'labeled bag weight', 'pallet count', 'vehicle payload'],
    links: ['/bulk-vs-bagged-rock', '/gravel-bag-calculator', '/pea-gravel-bag-calculator', '/landscape-rock-calculator']
  }),
  page({
    route: '/rock-coverage-chart',
    title: 'Rock Coverage Chart by Depth',
    parent: '/how-much-rock-do-i-need',
    cluster: 'measure',
    kind: 'reference calculator',
    entity: 'Rock coverage per unit',
    summary: 'Compare geometric square-foot coverage at different layer depths. Cubic-yard coverage follows volume math; coverage per short ton also depends on the selected loose bulk weight.',
    attributes: ['layer depth', 'square feet per cubic yard', 'square feet per short ton', 'bulk density'],
    links: ['/rock-depth-guide', '/rock-density-chart', '/rock-coverage-calculator-yard', '/rock-square-foot-calculator']
  }),
  page({
    route: '/rock-depth-guide',
    title: 'How Deep Should Landscape Rock Be?',
    parent: '/how-much-rock-do-i-need',
    cluster: 'measure',
    kind: 'guide',
    entity: 'Finished aggregate layer depth',
    summary: 'Choose the thickness of the particular rock layer you are estimating. Decorative cover, a walking surface, a compacted base and a drain envelope need different product and site checks.',
    attributes: ['finished thickness', 'particle size', 'separate courses', 'site use'],
    links: ['/rock-coverage-chart', '/landscape-rock-calculator', '/driveway-rock-calculator', '/drain-rock-calculator']
  }),
  page({
    route: '/rock-density-chart',
    title: 'Rock Weight and Density Reference Chart',
    parent: '/how-much-rock-do-i-need',
    cluster: 'measure',
    kind: 'reference guide',
    entity: 'Aggregate loose bulk density',
    summary: 'Compare the site’s material planning weights and convert pounds per cubic yard to short tons. Check how product grading, voids and moisture change the loose weight you should enter.',
    attributes: ['pounds per cubic yard', 'short tons per cubic yard', 'loose versus compacted density', 'supplier product'],
    links: ['/rock-tons-calculator', '/gravel-calculator', '/decomposed-granite-calculator', '/about']
  }),
  page({
    route: '/bulk-vs-bagged-rock',
    title: 'Bulk vs Bagged Rock: Cost and Delivery Guide',
    parent: '/rock-bag-calculator',
    cluster: 'measure',
    kind: 'buying guide',
    entity: 'Bulk and bagged rock purchasing',
    summary: 'Compare quotes for the same rock quantity, including whole bags, bulk minimums, delivery and the work of moving the material. Local product yield and access can change which order is practical.',
    attributes: ['equivalent volume', 'bag price', 'bulk quote', 'delivery minimum', 'access'],
    links: ['/rock-bag-calculator', '/rock-coverage-calculator-yard', '/gravel-bag-calculator', '/river-rock-bag-calculator']
  }),

  page({
    route: '/gravel-calculator',
    title: 'Gravel Calculator: Loose Yards and Short Tons',
    parent: '/calculators',
    cluster: 'gravel',
    entity: 'Gravel quantity',
    summary: 'Estimate loose cubic yards, short tons, seller yard increments, and reverse coverage from a known gravel quantity. Adjust loose bulk weight for the gravel grade on your quote.',
    attributes: ['gravel grade', 'area shape', 'layer depth', 'loose bulk density', 'reverse coverage'],
    links: ['/gravel-bag-calculator', '/gravel-sizes', '/driveway-rock-calculator', '/rock-density-chart']
  }),
  page({
    route: '/gravel-bag-calculator',
    title: 'Gravel Bag Calculator',
    parent: '/gravel-calculator',
    cluster: 'gravel',
    entity: 'Bagged gravel coverage',
    summary: 'Count whole gravel bags using the package’s cubic-foot yield, split orders by pallet size, and compare bag weight and store price against a delivered bulk quote.',
    attributes: ['bag volume', 'bag weight', 'whole bags', 'pallet count', 'price'],
    links: ['/gravel-calculator', '/rock-bag-calculator', '/pea-gravel-bag-calculator', '/gravel-sizes']
  }),
  page({
    route: '/gravel-sizes',
    title: 'Gravel Sizes & #57 Stone Sieve Guide',
    parent: '/gravel-calculator',
    cluster: 'gravel',
    kind: 'reference guide',
    entity: 'Aggregate size designations and sieves',
    summary: 'Distinguish nominal stone sizes, ASTM D448 and AASHTO M43 sieve designations (#1, #4, #57, #67, #78, #8, #89), fines content, and regional quarry trade names.',
    attributes: ['size designation', 'sieve opening', 'percent passing', 'fines content', 'local name'],
    links: ['/gravel-trade-names-by-state', '/crushed-stone-calculator', '/crusher-run-calculator', '/drain-rock-calculator']
  }),
  page({
    route: '/gravel-trade-names-by-state',
    title: 'Regional Gravel & Aggregate Trade Names by State',
    parent: '/gravel-sizes',
    cluster: 'gravel',
    kind: 'reference guide',
    entity: 'Regional aggregate trade names',
    summary: 'Translate state and quarry aggregate designations—such as 21-A, CA-6, #304, #53, Item 4, DGA, QP, ABC, Class 2 AB, and Flexbase—into clear gradation checks before ordering.',
    attributes: ['regional name', 'agency specification', 'gradation', 'fines', 'intended course'],
    links: ['/gravel-sizes', '/crusher-run-calculator', '/driveway-rock-calculator', '/gravel-calculator']
  }),
  page({
    route: '/crusher-run-calculator',
    title: 'Crusher Run and Base Rock Calculator',
    parent: '/gravel-calculator',
    cluster: 'gravel',
    entity: 'Dense-graded aggregate base',
    summary: 'Estimate compactable crusher-run, Class 2, #411, or landscape stone base layers using finished depth, loose-to-compacted allowance or compaction shrinkage, and supplier weight.',
    attributes: ['finished base thickness', 'dense grading', 'compaction mode', 'loose bulk weight'],
    links: ['/driveway-rock-calculator', '/layered-project-calculator', '/gravel-trade-names-by-state', '/angular-vs-rounded-rock']
  }),

  page({
    route: '/crushed-stone-calculator',
    title: 'Crushed Stone Calculator',
    parent: '/calculators',
    cluster: 'crushed',
    entity: 'Crushed aggregate quantity',
    summary: 'Estimate crushed stone in cubic yards, short tons, seller increments, and reverse coverage mode, and compare clean stone with dense-graded base mixes.',
    attributes: ['gradation', 'finished layer', 'fines content', 'loose bulk weight', 'reverse coverage'],
    links: ['/crushed-stone-bag-calculator', '/gravel-sizes', '/drain-rock-calculator', '/crusher-run-calculator']
  }),
  page({
    route: '/crushed-stone-bag-calculator',
    title: 'Crushed Stone Bag Calculator',
    parent: '/crushed-stone-calculator',
    cluster: 'crushed',
    entity: 'Bagged crushed stone',
    summary: 'Turn a small crushed-stone layer into whole bags and full-pallet splits using labeled cubic feet, and compare total carrying weight and cost against local bulk delivery.',
    attributes: ['package volume', 'bag weight', 'pallet count', 'whole bags', 'cost'],
    links: ['/crushed-stone-calculator', '/rock-bag-calculator', '/gravel-sizes', '/bulk-vs-bagged-rock']
  }),
  page({
    route: '/crushed-granite-calculator',
    title: 'Crushed Granite Calculator',
    parent: '/crushed-stone-calculator',
    cluster: 'crushed',
    entity: 'Coarse crushed granite',
    summary: 'Estimate coarse crushed granite in cubic yards and short tons. Distinguish clean stone, a graded mix with fines and finer decomposed granite before using the seller’s weight conversion.',
    attributes: ['granite grading', 'fines', 'finished depth', 'supplier loose weight'],
    links: ['/decomposed-granite-calculator', '/trap-rock-calculator', '/driveway-rock-calculator', '/crushed-stone-calculator']
  }),
  page({
    route: '/trap-rock-calculator',
    title: 'Trap Rock Calculator',
    parent: '/crushed-stone-calculator',
    cluster: 'crushed',
    entity: 'Crushed trap rock',
    summary: 'Estimate the trap-rock product on your quote using finished depth, loose weight and bag volume. The geological name does not establish grading, yield or a structural specification.',
    attributes: ['screened size', 'loose bulk weight', 'bag yield', 'finished thickness'],
    links: ['/crushed-granite-calculator', '/crushed-stone-calculator', '/driveway-rock-calculator', '/gravel-sizes']
  }),
  page({
    route: '/drain-rock-calculator',
    title: 'Drain Rock Trench Calculator',
    parent: '/crushed-stone-calculator',
    cluster: 'crushed',
    entity: 'Drain trench aggregate envelope',
    summary: 'Calculate the stone-filled part of a trench after top cover and pipe displacement. Confirm the specified grading, fines content, filter and outlet separately from the material quantity.',
    attributes: ['trench width and depth', 'top cover', 'pipe outside diameter', 'stone envelope'],
    links: ['/gravel-sizes', '/crushed-stone-calculator', '/dry-creek-bed', '/how-to-fix-rock-sinking-into-soil']
  }),

  page({
    route: '/pea-gravel-calculator',
    title: 'Pea Gravel Calculator',
    parent: '/calculators',
    cluster: 'pea',
    entity: 'Pea gravel quantity',
    summary: 'Estimate a loose pea-gravel layer in yards, short tons, and 0.5-cu-ft bags, check reverse coverage from stock on hand, and measure border edging length.',
    attributes: ['rounded gravel', 'finished depth', 'reverse coverage', 'edging perimeter'],
    links: ['/pea-gravel-bag-calculator', '/pea-gravel-patio-calculator', '/rock-depth-guide', '/angular-vs-rounded-rock']
  }),
  page({
    route: '/pea-gravel-bag-calculator',
    title: 'Pea Gravel Bag Calculator',
    parent: '/pea-gravel-calculator',
    cluster: 'pea',
    entity: 'Bagged pea gravel',
    summary: 'Calculate whole pea-gravel bags and pallet splits from the product’s stated cubic-foot yield, estimate carrying weight, and compare local bulk delivery.',
    attributes: ['labeled volume', 'bag weight', 'pallet count', 'whole-bag price'],
    links: ['/pea-gravel-calculator', '/pea-gravel-patio-calculator', '/rock-bag-calculator', '/bulk-vs-bagged-rock']
  }),
  page({
    route: '/pea-gravel-patio-calculator',
    title: 'Pea Gravel Patio and Base Calculator',
    parent: '/pea-gravel-calculator',
    cluster: 'pea',
    entity: 'Layered pea-gravel patio',
    summary: 'Estimate a pea-gravel patio’s loose surface, separate compacted base, geotextile separation area, and retaining border length with editable supplier weights.',
    attributes: ['patio footprint', 'surface depth', 'base depth', 'loose base allowance', 'edging'],
    links: ['/pea-gravel-calculator', '/layered-project-calculator', '/angular-vs-rounded-rock', '/crusher-run-calculator']
  }),

  page({
    route: '/river-rock-calculator',
    title: 'River Rock Calculator',
    parent: '/calculators',
    cluster: 'river',
    entity: 'Rounded river rock quantity',
    summary: 'Estimate a rounded river-rock bed or creek lining in cubic yards, short tons, seller increments, and bags, or reverse-calculate how much area a stock quantity covers.',
    attributes: ['rounded stone size', 'bed area', 'finished depth', 'supplier density', 'reverse coverage'],
    links: ['/river-rock-bag-calculator', '/dry-creek-bed', '/rock-depth-guide', '/bulk-vs-bagged-rock']
  }),
  page({
    route: '/river-rock-bag-calculator',
    title: 'River Rock Bag Calculator',
    parent: '/river-rock-calculator',
    cluster: 'river',
    entity: 'Bagged river rock',
    summary: 'Estimate whole bags and pallet splits from the package’s cubic-foot volume, calculate carrying load from labeled weight, and compare a local bulk quote.',
    attributes: ['package volume', 'stone size', 'bag weight', 'pallet count', 'price'],
    links: ['/river-rock-calculator', '/rock-bag-calculator', '/bulk-vs-bagged-rock', '/beach-pebble-calculator']
  }),
  page({
    route: '/dry-creek-bed',
    title: 'Dry Creek Bed: Measure Stone and Plan the Water Route',
    parent: '/river-rock-calculator',
    cluster: 'river',
    kind: 'project guide',
    entity: 'Decorative stone-lined channel',
    summary: 'Measure the bed bottom and sloping banks, estimate swale stone and geotextile fabric, and separate surface quantity from stormwater channel design.',
    attributes: ['lining surface', 'slope width', 'stone layer', 'geotextile overlap', 'outlet'],
    links: ['/river-rock-calculator', '/riprap-calculator', '/drain-rock-calculator', '/how-to-stop-gravel-washing-out-on-slope']
  }),

  page({
    route: '/decomposed-granite-calculator',
    title: 'Decomposed Granite Calculator',
    parent: '/calculators',
    cluster: 'dg',
    entity: 'Decomposed granite path layer',
    summary: 'Estimate a finished decomposed granite path or patio layer in loose yards and short tons, or solve backward from stock on hand. Confirm natural vs. stabilized product yield.',
    attributes: ['DG product', 'finished depth', 'loose density', 'order allowance', 'reverse coverage'],
    links: ['/crushed-granite-calculator', '/layered-project-calculator', '/rock-depth-guide', '/rock-density-chart']
  }),

  page({
    route: '/decorative-rock-calculator',
    title: 'Decorative Rock Material Comparison Calculator',
    parent: '/calculators',
    cluster: 'landscape',
    entity: 'Decorative rock material comparison',
    summary: 'Compare the same decorative bed volume using different material weights and bag sizes. Particle size, planting conditions and appearance affect the product choice separately from quantity.',
    attributes: ['bed footprint', 'decorative depth', 'material weight', 'bag size'],
    links: ['/landscape-rock-calculator', '/beach-pebble-calculator', '/egg-rock-calculator', '/lava-rock-calculator']
  }),
  page({
    route: '/landscape-rock-calculator',
    title: 'Landscape Rock Bed Calculator',
    parent: '/decorative-rock-calculator',
    cluster: 'landscape',
    entity: 'Landscape rock mulch bed',
    summary: 'Estimate the rock-covered part of a planting or garden bed after subtracting uncovered islands and planter pockets, then plan cubic yards, short tons, and retail bags.',
    attributes: ['covered bed area', 'planting pockets', 'finished depth', 'bag yield', 'rock mulch maintenance'],
    links: ['/how-to-install-landscape-rock', '/rock-vs-mulch-calculator', '/how-to-stop-weeds-in-landscape-rock', '/decorative-rock-calculator']
  }),
  page({
    route: '/beach-pebble-calculator',
    title: 'Beach Pebble Calculator',
    parent: '/decorative-rock-calculator',
    cluster: 'landscape',
    entity: 'Decorative beach pebbles',
    summary: 'Estimate a beach-pebble bed or border from measured area, finished depth and the package yield. Read bag volume, loose bulk weight and pallet quantity as separate purchasing attributes.',
    attributes: ['pebble size', 'finished depth', 'package volume', 'loose bulk weight', 'pack quantity'],
    links: ['/river-rock-bag-calculator', '/landscape-rock-calculator', '/egg-rock-calculator', '/rock-bag-calculator']
  }),
  page({
    route: '/egg-rock-calculator',
    title: 'Egg Rock Calculator',
    parent: '/decorative-rock-calculator',
    cluster: 'landscape',
    entity: 'Rounded decorative egg rock',
    summary: 'Estimate a rounded egg-rock surface using dimensions or a known area. Product size, supplier loose weight and labeled bag volume can differ between yards and retailers.',
    attributes: ['rounded product size', 'bed area', 'finished thickness', 'supplier weight', 'bag volume'],
    links: ['/river-rock-calculator', '/beach-pebble-calculator', '/landscape-rock-calculator', '/rock-depth-guide']
  }),
  page({
    route: '/lava-rock-calculator',
    title: 'Lava Rock Calculator: Yards, Bags & Coverage Area',
    parent: '/decorative-rock-calculator',
    cluster: 'lava',
    entity: 'Landscape lava rock',
    summary: 'Estimate a landscape lava-rock layer in loose yards, short tons and whole bags, or reverse-calculate coverage from bags and yards on hand.',
    attributes: ['landscape product', 'loose bulk weight', 'bag volume', 'finished layer depth', 'reverse coverage'],
    links: ['/lava-rock-bag-calculator', '/rock-vs-mulch-calculator', '/landscape-rock-calculator', '/rock-density-chart']
  }),
  page({
    route: '/lava-rock-bag-calculator',
    title: 'Lava Rock Bag Calculator',
    parent: '/lava-rock-calculator',
    cluster: 'lava',
    entity: 'Bagged landscape lava rock',
    summary: 'Calculate whole landscape lava-rock bags and pallet splits using labeled cubic feet, then estimate cost and handling weight without confusing landscape stone with gas-fire-pit media.',
    attributes: ['bag volume', 'bag weight', 'pallet count', 'whole bags'],
    links: ['/lava-rock-calculator', '/rock-bag-calculator', '/bulk-vs-bagged-rock', '/landscape-rock-calculator']
  }),
  page({
    route: '/marble-chips-calculator',
    title: 'Marble Chips Calculator: Bags, Yards & Coverage',
    parent: '/decorative-rock-calculator',
    cluster: 'marble',
    entity: 'Decorative marble chips',
    summary: 'Estimate a marble-chip bed in cubic yards, short tons and bag equivalents. Check product weight, chip size, and soil suitability for nearby acid-loving plantings.',
    attributes: ['chip size', 'finished depth', 'loose bulk weight', 'planting conditions'],
    links: ['/marble-chips-bag-calculator', '/landscape-rock-calculator', '/rock-vs-mulch-calculator', '/how-to-install-landscape-rock']
  }),
  page({
    route: '/marble-chips-bag-calculator',
    title: 'Marble Chips Bag Calculator',
    parent: '/marble-chips-calculator',
    cluster: 'marble',
    entity: 'Bagged marble-chip order',
    summary: 'Count whole marble-chip bags and pallet splits using the cubic feet on the label and your bed dimensions, with optional package weight and local pricing.',
    attributes: ['labeled bag volume', 'whole bags', 'bag weight', 'pallet count', 'local price'],
    links: ['/marble-chips-calculator', '/rock-bag-calculator', '/bulk-vs-bagged-rock', '/beach-pebble-calculator']
  }),

  page({
    route: '/driveway-rock-calculator',
    title: 'Driveway Rock Base and Surface Calculator',
    parent: '/calculators',
    cluster: 'projects',
    entity: 'Driveway aggregate courses',
    summary: 'Estimate a driveway top-up or separate base and surface courses. Enter finished depths, loose-order allowances and supplier weights for each material instead of applying one universal driveway section.',
    attributes: ['driveway footprint', 'separate courses', 'finished depths', 'loose allowances', 'supplier weights'],
    links: ['/crusher-run-calculator', '/gravel-calculator', '/layered-project-calculator', '/how-to-stop-gravel-washing-out-on-slope']
  }),
  page({
    route: '/layered-project-calculator',
    title: 'Layered Rock Project and Shopping List Calculator',
    parent: '/calculators',
    cluster: 'projects',
    entity: 'Multiple aggregate layer takeoff',
    summary: 'Build separate base and surface quantities from a shared footprint, then estimate fabric area and edging length. Enter the loose-order increase and supplier density for each selected layer.',
    attributes: ['shared footprint', 'base course', 'surface course', 'loose-order increase', 'fabric overlap', 'edging length'],
    links: ['/driveway-rock-calculator', '/pea-gravel-patio-calculator', '/crusher-run-calculator', '/rock-depth-guide']
  }),
  page({
    route: '/cobblestone-calculator',
    title: 'Cobblestone Piece and Border Calculator',
    parent: '/calculators',
    cluster: 'projects',
    entity: 'Cobblestone paving and edging pieces',
    summary: 'Count individual cobbles for a paved field or a single-row border using the visible stone face and planned joints. Pack size and piece weight are separate from the area calculation.',
    attributes: ['visible stone face', 'joint width', 'paved area', 'border run', 'piece weight', 'pack count'],
    links: ['/layered-project-calculator', '/gravel-sizes', '/how-to-install-landscape-rock', '/bulk-vs-bagged-rock']
  }),
  page({
    route: '/riprap-calculator',
    title: 'Riprap Layer Quantity Calculator',
    parent: '/calculators',
    cluster: 'projects',
    entity: 'Specified riprap armor layer',
    summary: 'Estimate a specified riprap layer from its actual surface area and thickness, then use supplier loose weight and payload for order planning. Stone size, filters and hydraulic design must come from the project detail.',
    attributes: ['slope surface', 'specified thickness', 'gradation', 'loose bulk weight', 'payload'],
    links: ['/dry-creek-bed', '/how-to-stop-gravel-washing-out-on-slope', '/drain-rock-calculator', '/rock-density-chart']
  }),
  page({
    route: '/rock-vs-mulch-calculator',
    title: 'Rock vs Mulch: 10-Year Cost Comparison',
    parent: '/landscape-rock-calculator',
    cluster: 'landscape',
    kind: 'comparison calculator',
    entity: 'Rock and organic mulch ownership costs',
    summary: 'Compare ten-year landscape rock and organic mulch costs using editable local prices, delivery charges, upkeep, and replenishment rates. Either option can cost less.',
    attributes: ['same bed area', 'initial installation', 'annual replenishment', 'maintenance', 'ten-year period'],
    links: ['/landscape-rock-calculator', '/how-to-stop-weeds-in-landscape-rock', '/bulk-vs-bagged-rock', '/rock-bag-calculator']
  }),
  page({
    route: '/which-rock-should-i-use',
    title: 'Which Rock Should I Use? Material Selection Helper',
    parent: '/calculators',
    cluster: 'projects',
    kind: 'selection helper',
    entity: 'Landscape aggregate selection',
    summary: 'Compare candidate materials for the project, traffic, water conditions and appearance you describe. Confirm the actual grading and installation requirements before using a quantity calculator.',
    attributes: ['project use', 'traffic', 'water conditions', 'stone shape', 'gradation'],
    links: ['/angular-vs-rounded-rock', '/gravel-sizes', '/landscape-rock-calculator', '/driveway-rock-calculator']
  }),
  page({
    route: '/angular-vs-rounded-rock',
    title: 'Angular vs Rounded Rock: Choose for the Project',
    parent: '/which-rock-should-i-use',
    cluster: 'projects',
    kind: 'comparison guide',
    entity: 'Aggregate particle shape',
    summary: 'Compare angular and rounded particles together with grading, fines and confinement. Shape affects movement, but it does not by itself establish drainage, load capacity or the correct layer specification.',
    attributes: ['particle shape', 'grading', 'fines', 'confinement', 'surface use'],
    links: ['/crushed-stone-calculator', '/pea-gravel-calculator', '/river-rock-calculator', '/driveway-rock-calculator']
  }),
  page({
    route: '/how-to-install-landscape-rock',
    title: 'How to Install Landscape Rock: Plan, Place and Maintain',
    parent: '/landscape-rock-calculator',
    cluster: 'landscape',
    kind: 'installation guide',
    entity: 'Decorative rock bed installation',
    summary: 'Plan a decorative bed’s footprint, planting gaps, finished grade, edging and stone order, then place and maintain the surface. Loaded bases and functional drainage layers require their own details.',
    attributes: ['planting gaps', 'finished grade', 'edging', 'stone depth', 'upkeep'],
    links: ['/landscape-rock-calculator', '/rock-depth-guide', '/how-to-stop-weeds-in-landscape-rock', '/how-to-fix-rock-sinking-into-soil']
  }),
  page({
    route: '/how-to-stop-gravel-washing-out-on-slope',
    title: 'How to Stop Gravel Washing Out on a Slope',
    parent: '/driveway-rock-calculator',
    cluster: 'maintenance',
    kind: 'troubleshooting guide',
    entity: 'Gravel surface erosion',
    summary: 'Trace where water enters and leaves the gravel surface before adding more stone. Measure the slope and select the repair detail before estimating replacement aggregate or an outlet lining.',
    attributes: ['water entry', 'runoff path', 'slope', 'surface grading', 'outlet'],
    links: ['/driveway-rock-calculator', '/riprap-calculator', '/dry-creek-bed', '/how-to-fix-rock-sinking-into-soil']
  }),
  page({
    route: '/how-to-fix-rock-sinking-into-soil',
    title: 'How to Fix Rock Sinking into Soil or Mud',
    parent: '/how-to-install-landscape-rock',
    cluster: 'maintenance',
    kind: 'troubleshooting guide',
    entity: 'Soil and aggregate mixing',
    summary: 'Distinguish stone mixing into soft soil from debris burying a bed or runoff moving it away. Diagnose support and drainage before estimating the material needed to rebuild the affected layer.',
    attributes: ['soil support', 'stone separation', 'sediment', 'drainage', 'replacement layer'],
    links: ['/how-to-stop-gravel-washing-out-on-slope', '/how-to-install-landscape-rock', '/driveway-rock-calculator', '/layered-project-calculator']
  }),
  page({
    route: '/how-to-stop-weeds-in-landscape-rock',
    title: 'How to Stop Weeds in Landscape Rock',
    parent: '/how-to-install-landscape-rock',
    cluster: 'maintenance',
    kind: 'maintenance guide',
    entity: 'Weeds in rock mulch',
    summary: 'Identify where weeds root, remove existing growth and reduce the soil and debris collecting among the stones. Compare cleaning, edging and barrier choices without assuming a permanently weed-free bed.',
    attributes: ['weed rooting location', 'organic debris', 'bed edges', 'barrier condition', 'upkeep'],
    links: ['/how-to-install-landscape-rock', '/landscape-rock-calculator', '/rock-vs-mulch-calculator', '/how-to-fix-rock-sinking-into-soil']
  }),

  page({
    route: '/about',
    title: 'About Our Formulas and Assumptions | Rock Coverage Calculator',
    parent: '/calculators',
    cluster: 'support',
    kind: 'methodology',
    entity: 'Rock Coverage Calculator methods',
    summary: 'Understand the geometry, material assumptions and limits behind the estimates. Separate fixed unit conversions from product-specific weights and optional ordering allowances.',
    attributes: ['geometry', 'unit conversions', 'material assumptions', 'estimate limits'],
    links: ['/how-much-rock-do-i-need', '/rock-density-chart', '/contact', '/terms']
  }),
  page({
    route: '/contact',
    title: 'Contact | Rock Coverage Calculator',
    parent: '/about',
    cluster: 'support',
    kind: 'contact',
    entity: 'Rock Coverage Calculator contact',
    summary: 'Email a calculation question, report a website problem or suggest a correction. Include the page address, measurements, units and product assumptions so the issue can be reproduced.',
    attributes: ['page address', 'input values', 'product reference', 'email contact'],
    links: ['/about', '/privacy', '/terms']
  }),
  page({
    route: '/privacy',
    title: 'Privacy Policy - Rock Coverage Calculator',
    parent: '/about',
    cluster: 'support',
    kind: 'policy',
    entity: 'Rock Coverage Calculator data handling',
    summary: 'Read how calculator inputs, saved browser projects, shared URLs, fonts, email contact and third-party services relate to your data.',
    attributes: ['calculator inputs', 'browser storage', 'shared URLs', 'email', 'third parties'],
    links: ['/contact', '/terms', '/about']
  }),
  page({
    route: '/terms',
    title: 'Terms of Service & Material Estimation Disclaimer - Rock Coverage Calculator',
    parent: '/about',
    cluster: 'support',
    kind: 'policy',
    entity: 'Rock Coverage Calculator terms of use',
    summary: 'Review permitted use and the limits of quantity estimates. Product selection, installation requirements, supplier quotes and actual delivered weights need their own checks.',
    attributes: ['permitted use', 'planning estimates', 'supplier verification', 'site responsibilities'],
    links: ['/about', '/privacy', '/contact']
  }),
  page({
    route: '/calculator-widget',
    title: 'Embed the Rock Coverage Calculator',
    parent: '/about',
    cluster: 'support',
    kind: 'widget instructions',
    entity: 'Embeddable rock coverage calculator',
    summary: 'Choose a widget theme, copy the iframe code and test the embedded calculator on your own page. The embedded estimate uses the same area, depth and material assumptions as the main tool.',
    attributes: ['iframe URL', 'theme', 'container height', 'calculator assumptions'],
    links: ['/embed', '/', '/about', '/contact']
  }),
  page({
    route: '/embed',
    title: 'Rock Coverage Calculator Widget',
    parent: '/calculator-widget',
    cluster: 'support',
    kind: 'widget',
    indexable: false,
    entity: 'Embedded rock quantity tool',
    summary: 'Enter the project shape, material and finished depth to estimate cubic yards, short tons and half-cubic-foot bags. Check the selected product assumptions before ordering.',
    attributes: ['project shape', 'material', 'depth', 'density', 'bag volume'],
    links: ['/calculator-widget', '/about']
  }),
  page({
    route: '/404',
    title: 'Page Not Found | Rock Coverage Calculator',
    parent: '/calculators',
    cluster: 'support',
    kind: 'error',
    indexable: false,
    entity: 'Unavailable page',
    summary: 'The requested page is unavailable. Return to the main calculator or browse the calculator and guide library.',
    attributes: ['requested address', 'available navigation'],
    links: ['/', '/calculators']
  })
];

export const LEGACY_ROUTES = {
  '/rock-cubic-yard-calculator': '/rock-coverage-calculator-yard',
  '/rock-coverage-calculator-yards': '/rock-coverage-calculator-yard',
  '/rock-calculator': '/',
  '/rock-yardage-calculator': '/rock-coverage-calculator-yard',
  '/rock-bag-weight-and-price-guide': '/rock-bag-calculator',
  '/landscape-stone-calculator': '/crusher-run-calculator',
  '/garden-rock-calculator': '/landscape-rock-calculator',
  '/57-stone-size-guide': '/gravel-sizes',
  '/gravel-tons-calculator': '/gravel-calculator',
  '/gravel-cubic-yard-calculator': '/gravel-calculator',
  '/crushed-stone-tons-calculator': '/crushed-stone-calculator',
  '/crushed-stone-yardage-calculator': '/crushed-stone-calculator',
  '/pea-gravel-tons-calculator': '/pea-gravel-calculator',
  '/pea-gravel-cubic-yard-calculator': '/pea-gravel-calculator',
  '/pea-gravel-coverage-calculator': '/pea-gravel-calculator',
  '/river-rock-tons-calculator': '/river-rock-calculator',
  '/river-rock-cubic-yard-calculator': '/river-rock-calculator',
  '/river-rock-coverage-calculator': '/river-rock-calculator',
  '/decomposed-granite-tons-calculator': '/decomposed-granite-calculator',
  '/decomposed-granite-coverage-calculator': '/decomposed-granite-calculator',
  '/lava-rock-coverage-calculator': '/lava-rock-calculator'
};

const byRoute = new Map(CONTENT_PAGES.map(item => [item.route, item]));

/** @param {string} route */
export function normalizeRoute(route) { return route.replace(/\/+$/, '') || '/'; }

/** @param {string} route */
export function getContentPage(route) { return byRoute.get(normalizeRoute(route)); }

/** @param {string} route */
export function getBreadcrumbs(route) {
  const trail = []; const seen = new Set(); let current = getContentPage(route);
  while (current && !seen.has(current.route)) {
    seen.add(current.route); trail.unshift({ name: current.route === '/' ? 'Home' : current.title, url: current.route });
    current = current.parent ? getContentPage(current.parent) : undefined;
  }
  return trail;
}

/** @param {string} route */
export function getTopicChildren(route) { return CONTENT_PAGES.filter(p => p.parent === normalizeRoute(route) && p.indexable); }

/** @param {string} route */
export function getNextPages(route) {
  const current = getContentPage(route);
  if (!current) return [];
  const childRoutes = new Set(getTopicChildren(route).map(p => p.route));
  return current.links.map(getContentPage).filter(p => p !== undefined).filter(p => p.route !== current.route && p.route !== current.parent && !childRoutes.has(p.route));
}
