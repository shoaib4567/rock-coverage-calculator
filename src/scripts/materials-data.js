/**
 * Aggregate Materials Database - rockcoveragecalculator.com
 * Density specifications, void ratios, sizing caliper, and field application rules.
 * All densities reflect loose, damp-to-dry quarry stockpile conditions.
 */

export const ROCK_MATERIALS = [
  {
    id: 'pea-gravel',
    name: 'Pea Gravel',
    category: 'gravel',
    typicalSize: '3/8"',
    minDepthInches: 2,
    densityLbsPerCuYd: 2600,
    tonsPerCuYd: 1.30,
    densityLbsPerCuFt: 96,
    densityKgPerCuM: 1542,
    typicalRange: [2500, 2700],
    isCompactable: false,
    swatchColor: '#a09080',
    description: 'Small, rounded stones ideal for pathways, drainage, and decorative beds.',
    notes: 'Smooth rounded profile, low void ratio, self-leveling'
  },
  {
    id: 'river-rock-1',
    name: 'River Rock (1-3")',
    category: 'river',
    typicalSize: '1-3"',
    minDepthInches: 3,
    densityLbsPerCuYd: 2650,
    tonsPerCuYd: 1.325,
    densityLbsPerCuFt: 98,
    densityKgPerCuM: 1572,
    typicalRange: [2550, 2750],
    isCompactable: false,
    swatchColor: '#7a8a7a',
    description: 'Smooth, water-tumbled stones with natural color variation.',
    notes: 'Natural tumbled finish, mixed color, moderate void ratio'
  },
  {
    id: 'crushed-limestone',
    name: 'Crushed Limestone',
    category: 'crushed',
    typicalSize: '3/4"',
    minDepthInches: 2,
    densityLbsPerCuYd: 2700,
    tonsPerCuYd: 1.35,
    densityLbsPerCuFt: 100,
    densityKgPerCuM: 1602,
    typicalRange: [2600, 2800],
    isCompactable: false,
    swatchColor: '#c8bca0',
    description: 'Angular crushed limestone, compacts well for driveways and base layers.',
    notes: 'Angular fractured faces, high interlock, excellent compaction'
  },
  {
    id: 'crushed-granite',
    name: 'Crushed Granite',
    category: 'crushed',
    typicalSize: '3/4"',
    minDepthInches: 2,
    densityLbsPerCuYd: 2800,
    tonsPerCuYd: 1.40,
    densityLbsPerCuFt: 104,
    densityKgPerCuM: 1661,
    typicalRange: [2700, 2900],
    isCompactable: false,
    swatchColor: '#8b9da8',
    description: 'Durable angular granite aggregate for heavy-traffic surfaces.',
    notes: 'High hardness, angular faces, excellent drainage'
  },
  {
    id: 'decomposed-granite',
    name: 'Decomposed Granite',
    category: 'crushed',
    typicalSize: '1/4" minus',
    minDepthInches: 2,
    densityLbsPerCuYd: 2700,
    tonsPerCuYd: 1.35,
    densityLbsPerCuFt: 100,
    densityKgPerCuM: 1602,
    typicalRange: [2600, 2900],
    isCompactable: true,
    compactionFactor: 1.12,
    swatchColor: '#b8a080',
    description: 'Naturally weathered granite, fine texture, great for paths and patios.',
    notes: 'Fine granular, self-binding when wet, compacts to firm surface'
  },
  {
    id: 'lava-rock',
    name: 'Lava Rock',
    category: 'decorative',
    typicalSize: '3/4-2"',
    minDepthInches: 2,
    densityLbsPerCuYd: 1450,
    tonsPerCuYd: 0.725,
    densityLbsPerCuFt: 54,
    densityKgPerCuM: 860,
    typicalRange: [1350, 1550],
    isCompactable: false,
    swatchColor: '#8b3a3a',
    description: 'Lightweight volcanic rock for mulch replacement and fire pits.',
    notes: 'Very lightweight, high void ratio, excellent insulation properties'
  },
  {
    id: 'marble-chips',
    name: 'White Marble Chips',
    category: 'decorative',
    typicalSize: '1/2-1"',
    minDepthInches: 2,
    densityLbsPerCuYd: 2600,
    tonsPerCuYd: 1.30,
    densityLbsPerCuFt: 96,
    densityKgPerCuM: 1542,
    typicalRange: [2500, 2700],
    isCompactable: false,
    swatchColor: '#e8e0d8',
    description: 'Bright white ornamental chips for garden borders and accents.',
    notes: 'High reflectivity, smooth profile, may affect soil pH'
  },
  {
    id: 'river-rock-3-5',
    name: 'River Rock (3-5")',
    category: 'river',
    typicalSize: '3-5"',
    minDepthInches: 4,
    densityLbsPerCuYd: 2500,
    tonsPerCuYd: 1.25,
    densityLbsPerCuFt: 93,
    densityKgPerCuM: 1483,
    typicalRange: [2400, 2600],
    isCompactable: false,
    swatchColor: '#6a7a6a',
    description: 'Large river stones for borders, dry creek beds, and erosion control.',
    notes: 'Large profile, high void ratio, requires deeper bed'
  },
  {
    id: 'quarry-process',
    name: 'Quarry Process (QP)',
    category: 'base',
    typicalSize: '3/4" minus',
    minDepthInches: 4,
    densityLbsPerCuYd: 2700,
    tonsPerCuYd: 1.35,
    densityLbsPerCuFt: 100,
    densityKgPerCuM: 1602,
    typicalRange: [2600, 3150],
    isCompactable: true,
    compactionFactor: 1.18,
    swatchColor: '#8a8070',
    description: 'Mixed aggregate with fines for sub-base compaction under pavers.',
    notes: 'Contains fines, high compaction rate, DOT approved base material'
  },
  {
    id: 'rip-rap',
    name: 'Rip Rap / Armor Stone',
    category: 'erosion',
    typicalSize: '6-12"',
    minDepthInches: 6,
    densityLbsPerCuYd: 2850,
    tonsPerCuYd: 1.425,
    densityLbsPerCuFt: 106,
    densityKgPerCuM: 1690,
    typicalRange: [2700, 3000],
    isCompactable: false,
    swatchColor: '#707070',
    description: 'Large angular stone for slope stabilization and erosion control.',
    notes: 'Very large, angular, requires heavy equipment for placement'
  },
  {
    id: 'egg-rock',
    name: 'Egg Rock / Mexican Beach',
    category: 'decorative',
    typicalSize: '1-3"',
    minDepthInches: 2,
    densityLbsPerCuYd: 2650,
    tonsPerCuYd: 1.325,
    densityLbsPerCuFt: 98,
    densityKgPerCuM: 1572,
    typicalRange: [2550, 2750],
    isCompactable: false,
    swatchColor: '#4a4a4a',
    description: 'Smooth, dark polished stones for zen gardens and modern landscapes.',
    notes: 'Ultra-smooth polished finish, premium decorative stone'
  },
  {
    id: 'base-gravel-21a',
    name: 'Gravel Base (21-A / #57)',
    category: 'base',
    typicalSize: '3/4-1"',
    minDepthInches: 4,
    densityLbsPerCuYd: 2750,
    tonsPerCuYd: 1.375,
    densityLbsPerCuFt: 102,
    densityKgPerCuM: 1631,
    typicalRange: [2650, 3150],
    isCompactable: true,
    compactionFactor: 1.15,
    swatchColor: '#9a9080',
    description: 'Standard structural base for driveways, sheds, and retaining walls.',
    notes: 'AASHTO 57 stone, DOT standard road base aggregate'
  }
];

export const MATERIAL_CATEGORIES = [
  { id: 'all', label: 'All Materials' },
  { id: 'gravel', label: 'Gravel' },
  { id: 'crushed', label: 'Crushed Stone' },
  { id: 'river', label: 'River Rock' },
  { id: 'decorative', label: 'Decorative' },
  { id: 'base', label: 'Base / Sub-base' },
  { id: 'erosion', label: 'Erosion Control' }
];

export function getMaterialById(id) {
  return ROCK_MATERIALS.find(m => m.id === id) || ROCK_MATERIALS[0];
}

export function getMaterialsByCategory(category) {
  if (category === 'all') return ROCK_MATERIALS;
  return ROCK_MATERIALS.filter(m => m.category === category);
}
