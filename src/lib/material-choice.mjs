/**
 * A route to the next product/design question, not a construction specification.
 * @param {{project:string|null,traffic:string|null,slope:string|null,aesthetic:string|null}} answers
 */
export function getMaterialCandidate({project,traffic,slope,aesthetic}) {
  const candidate = {
    title:'Compare local landscape rock products',
    summary:'Choose a product sample for the appearance and use you want, then confirm grading and the installation plan.',
    tag:'Options to investigate',
    depth:'Check the finished layer specification',
    depthNote:'Use the thickness selected for the actual product and site. Particle size is not automatically the layer depth.',
    base:'Confirm preparation for this use',
    baseNote:'Soil support, drainage and loading determine whether a separate prepared base is needed.',
    fabric:'Check separation and filter requirements',
    fabricNote:'Fabric is a site and product choice; it does not guarantee weed control or load capacity.',
    density:'Use the supplier’s loose bulk weight',
    densityNote:'A material name does not establish one density. Enter a quoted or measured product value in the calculator.',
    pitfalls:'Check product size, fines, containment, maintenance and the actual quote before ordering.',
    calcUrl:'/decorative-rock-calculator'
  };
  if (project === 'firepit') return {...candidate,
    title:'Separate the seating surface from fire-appliance media',
    summary:'Plan the surrounding landscape surface separately. The appliance manufacturer must specify anything exposed to flame or installed inside the appliance.',
    pitfalls:'A landscape lava-rock or garden-stone label does not establish suitability for direct heat. Use the appliance’s approved media and installation instructions.',
    calcUrl:'/decorative-rock-calculator'};
  if (slope === 'water-channel') return {...candidate,
    title:'Establish the water route and lining detail first',
    summary:'An active channel needs a suitable outlet, stone grading, filter and layer thickness before quantity can be estimated.',
    pitfalls:'Four answers cannot select armor size or establish flow capacity. Use a project-specific drainage or erosion-control detail; the riprap tool estimates quantities only after those inputs are known.',
    calcUrl:'/riprap-calculator'};
  if (project === 'driveway' || traffic === 'vehicular') return {...candidate,
    title:'Compare specified driveway base and surface aggregates',
    summary:'A local dense-graded product may suit a compacted course, while clean stone behaves differently. Confirm separate base and wearing-layer specifications.',
    pitfalls:'Do not assume a #57 size number or one base thickness prevents rutting. Subgrade support, water, grading, placement and traffic all matter.',
    calcUrl:'/driveway-rock-calculator'};
  if (project === 'drainage') return {...candidate,
    title:'Check the drain detail’s aggregate and filter',
    summary:'Ask for the grading and fines content specified for the pipe, soil and outlet. Confirm whether washing is required for that product.',
    depth:'Measure the specified stone envelope',
    depthNote:'Use the stone-filled trench dimensions, top cover and pipe outside diameter. The drain calculator subtracts pipe displacement.',
    pitfalls:'A size number does not establish that stone is washed. Pipe bedding, envelope, filter and outlet requirements come from the drain plan.',
    calcUrl:'/drain-rock-calculator'};
  if (slope === 'moderate-slope') return {...candidate,
    title:'Resolve surface movement and runoff before choosing stone',
    summary:'A slope can move loose material. Choose angular interlocking stone for better stability, and plan containment and runoff control before sizing your load.',
    pitfalls:'There is no universal percentage slope at which every stone is suitable or unsuitable. Review the slope runoff guide alongside your local angular stone product.',
    calcUrl:'/crushed-stone-calculator'};
  if (project === 'dogrun' || traffic === 'barefoot') return {...candidate,
    title:'Compare a small rounded gravel sample',
    summary:'Small rounded gravel is one option to inspect for feel and maintenance. Evaluate the actual sample, drainage, containment and how the area will be used.',
    pitfalls:'Loose gravel can shift under feet, furniture and wheels. A smooth appearance does not certify comfort, accessibility or suitability for every animal.',
    calcUrl:'/pea-gravel-calculator'};
  if (project === 'walkway') return {...candidate,
    title:'Compare a DG product with other firm path surfaces',
    summary:'Natural and stabilized DG have product-specific preparation and placement requirements. Compare the finished surface with the walking and access needs of the route.',
    pitfalls:'A material name alone does not establish accessibility or a firm finish. Follow the actual product’s base, moisture, binder and placement instructions.',
    calcUrl:'/decomposed-granite-calculator'};
  if (aesthetic === 'budget-utility') return {...candidate,
    title:'Compare #57 limestone and local dense-graded utility blends',
    summary:'Crushed limestone (#57) and crusher-run quarry blends are commonly priced competitively by the short ton in bulk delivery.',
    pitfalls:'Quarry naming, moisture content, and delivery minimums drive local delivered pricing. Request delivered short-ton quotes for both clean stone and base blends.',
    calcUrl:'/crushed-stone-calculator'};
  if (aesthetic === 'volcanic') return {...candidate,
    title:'Compare landscape lava-rock mulch',
    summary:'Inspect the actual porous landscape product for size, texture, color and planting conditions. Its loose weight can differ substantially between products.',
    pitfalls:'Landscape stone is not automatically approved fire-appliance media. Check the selected product and keep the landscape estimate separate from heat-exposure specifications.',
    calcUrl:'/lava-rock-calculator'};
  if (aesthetic === 'modern-crisp') return {...candidate,
    title:'Compare beach pebbles and marble chips as separate products',
    summary:'Compare samples for color, shape, size, product yield and compatibility with the planting bed. The two material names do not share one weight or bag yield.',
    pitfalls:'Check soil and planting requirements before selecting marble, and test a small pebble spread before assuming full visual coverage.',
    calcUrl:'/beach-pebble-calculator'};
  if (aesthetic === 'natural-earth') return {...candidate,
    title:'Compare rounded river rock for decorative cover',
    summary:'A rounded product can be considered for a contained decorative bed. Check the actual size, selected depth, planting gaps and ongoing debris removal.',
    pitfalls:'Loose rounded stone may move under traffic. Keep a decorative-bed estimate separate from any structural or drainage layer.',
    calcUrl:'/river-rock-calculator'};
  return candidate;
}
