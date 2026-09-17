# Rock Coverage Calculator

> High-precision landscape rock coverage calculator and 3D bed visualizer built with modern Astro and Three.js.

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-ff5d01.svg)](https://astro.build)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg)](https://threejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**Rock Coverage Calculator** is an enterprise-grade landscaping calculator designed for landscape architects, excavation contractors, and homeowners. It delivers quarry-accurate material estimation for crushed stone, gravel, river rock, and lava rock with instant 3D shape visual previews, architectural cross-section diagrams, and contractor cost estimation.

---

## ✨ Features

### 1. High-Precision Volumetric & Weight Engine
- **Volume**: Instant computation of Cubic Feet and Cubic Yards ($L \times W \times (D/12) / 27$).
- **Weight**: Precise tonnage calculation based on bulk density factors ($1.20$ to $1.60\text{ tons/yd}^3$).
- **Bag Breakdown**: Automatically calculates retail 0.5 cu ft bags and 50 lb bags required with packaging loss safety margins.
- **Reverse Mode**: Enter target tons or yards to find achievable square footage coverage.
- **Seamless Unit Toggle**: Instant conversions between **Feet**, **Inches**, **Yards**, and **Meters** with zero input loss.

### 2. Procedural 3D Bed Visualizer (Three.js)
- **Authentic Shape Morphing**: Dynamically generates physical excavated subgrades and perimeter landscape edging for 6 geometry profiles:
  - **Rectangle**: Proportional box excavation with 4 perimeter steel edging borders.
  - **Circle**: Circular radial bed with round landscape edging.
  - **Ring (Donut)**: Annular stone bed with outer & inner borders and a stylized center tree trunk.
  - **Triangle**: Triangular prism bed with 3 border rails.
  - **Trapezoid**: Custom trapezoidal bed with 4 border rails.
  - **L-Shape**: 6-vertex L-shaped polygon bed with perimeter landscape border.
- **Realistic Materials**: Procedurally generated stone particle meshes with authentic textures, sizes, and colors for:
  - Pea Gravel (3/8" rounded quartz)
  - River Rock (1"-3" smooth quartzite)
  - Crushed Limestone (#57 angular gray)
  - Lava Rock (porous charcoal & volcanic red)
  - White Marble Chips (sparkling angular calcite)
  - Rip Rap (#3-#5 heavy embankment stone)
  - Egg Rock (2"-4" rounded river stones)
  - Quarry Process (dense crushed stone base with fines)

### 3. Architectural Depth Cross-Section Blueprint
- High-fidelity 2D SVG cross-section displaying:
  - Compacted subgrade soil with geological hatching
  - Woven geotextile landscape fabric barrier
  - Realistic multi-layered stone particle distribution
  - Heavy-duty landscape edging with anchoring stakes
  - Dynamic depth caliper ruler in inches

### 4. Contractor Cost & Rate Estimator
- Itemized material pricing per ton or cubic yard.
- Freight / dump truck delivery fees.
- Labor spreading and wheelbarrow installation rates per cubic yard.
- Weed barrier fabric and edging border material supplies.
- Municipal sales tax computation.

### 5. Multi-Zone Project Manager
- Save multiple landscaping zones (e.g., *Front Walkway*, *Driveway Base*, *Fire Pit Ring*).
- Persistent browser storage (`localStorage`).
- Running total of aggregate tons, yards, bags, and project cost.
- Instant zone loading, deletion, and **Export All Zones CSV** functionality.

### 6. Design & Accessibility
- **Dual Themes**: Polished Dark Mode (deep obsidian slate) and Crisp Light Mode (limestone/alabaster).
- **100% SVG Icons**: Zero emojis; crisp, scalable vector icons throughout.
- **SEO & EEAT Engineered**: Synchronized SEO title, semantic `<h1>`, OpenGraph, and `schema.org` WebApplication metadata.
- **Fully Responsive**: Flawless experience across mobile phones, tablets, and 4K desktop screens.

---

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) (Static Site Generation)
- **3D Engine**: [Three.js](https://threejs.org/) (WebGL Canvas)
- **Styling**: Vanilla CSS Design Tokens (Zero Tailwind bloat)
- **Icons**: Hand-crafted Inline SVG

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/shoaib4567/rock-coverage-calculator.git

# Navigate into project directory
cd rock-coverage-calculator

# Install dependencies
npm install
```

### Development

```bash
# Start Astro local development server
npm run dev
```

Visit `http://localhost:4321` in your browser.

### Production Build

```bash
# Build optimized static website to ./dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

MIT © [shoaib4567](https://github.com/shoaib4567)
