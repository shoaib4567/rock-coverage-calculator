/**
 * Main Application Controller — rockcoveragecalculator.com
 * Orchestrates DOM events, live state reactivity, visualization sync,
 * export hooks, and 3D scene management.
 */

import { RockEngine } from './engine.js';
import { ROCK_MATERIALS, getMaterialById } from './materials-data.js';
import { RockVisualizer } from './visualizer.js';
import { RockExporter } from './export.js';
import { initRockScene } from './rock-scene.js';

document.addEventListener('DOMContentLoaded', async () => {

  /* ── State ── */
  const state = {
    shape: 'rectangle',
    unit: 'ft',
    dims: { length: 10, width: 10 },
    materialId: 'pea-gravel',
    depthInches: 3,
    wastePercent: 10,
    costPerUnit: 0,
    costUnit: 'cuyd' // cuyd or ton
  };

  // Restore from URL
  const savedState = RockExporter.decodeState();
  if (savedState) {
    Object.assign(state, savedState);
  }

  /* ── DOM References ── */
  const shapeTabs = document.querySelectorAll('.shape-tab');
  const dimContainer = document.getElementById('dimension-inputs');
  const materialCards = document.querySelectorAll('.material-card');
  const depthSlider = document.getElementById('depth-slider');
  const depthValue = document.getElementById('depth-value');
  const depthPresets = document.querySelectorAll('.depth-preset');
  const wasteChips = document.querySelectorAll('.waste-chip');
  const unitButtons = document.querySelectorAll('.unit-toggle button');

  // Result elements
  const kpiArea = document.getElementById('kpi-area');
  const kpiVolume = document.getElementById('kpi-volume');
  const kpiWeight = document.getElementById('kpi-weight');
  const kpiBags = document.getElementById('kpi-bags');

  // Breakdown elements
  const breakdownBody = document.getElementById('breakdown-body');
  const purchaseGrid = document.getElementById('purchase-grid');
  const depthStatus = document.getElementById('depth-status');

  // Cost elements
  const costInput = document.getElementById('cost-input');
  const costTotal = document.getElementById('cost-total');

  // Action buttons
  const btnPrint = document.getElementById('btn-print');
  const btnCSV = document.getElementById('btn-csv');
  const btnShare = document.getElementById('btn-share');

  // 3D Scene
  let rockScene = null;
  try {
    rockScene = await initRockScene('rock-scene-canvas');
  } catch (e) {
    console.warn('3D scene initialization failed:', e);
  }

  /* ── Shape Tab Switching ── */
  const shapeConfigs = {
    rectangle: [
      { key: 'length', label: 'Length', placeholder: '10' },
      { key: 'width', label: 'Width', placeholder: '10' }
    ],
    circle: [
      { key: 'radius', label: 'Radius', placeholder: '5' }
    ],
    ring: [
      { key: 'outerRadius', label: 'Outer Radius', placeholder: '8' },
      { key: 'innerRadius', label: 'Inner Radius', placeholder: '4' }
    ],
    triangle: [
      { key: 'base', label: 'Base', placeholder: '10' },
      { key: 'height', label: 'Height', placeholder: '8' }
    ],
    trapezoid: [
      { key: 'top', label: 'Top Width', placeholder: '6' },
      { key: 'bottom', label: 'Bottom Width', placeholder: '12' },
      { key: 'height', label: 'Height', placeholder: '8' }
    ],
    lshape: [
      { key: 'length1', label: 'Section 1 Length', placeholder: '12' },
      { key: 'width1', label: 'Section 1 Width', placeholder: '4' },
      { key: 'length2', label: 'Section 2 Length', placeholder: '6' },
      { key: 'width2', label: 'Section 2 Width', placeholder: '4' }
    ]
  };

  function setShape(shape) {
    state.shape = shape;

    // Set defaults
    const configs = shapeConfigs[shape];
    state.dims = {};
    configs.forEach(c => {
      state.dims[c.key] = parseFloat(c.placeholder) || 0;
    });

    // Update tab visuals
    shapeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.shape === shape);
    });

    // Rebuild dimension inputs
    renderDimensionInputs(shape);
    recalculate();
  }

  function renderDimensionInputs(shape) {
    if (!dimContainer) return;
    const configs = shapeConfigs[shape];
    const isSingle = configs.length === 1;

    dimContainer.className = `dim-grid${isSingle ? ' single-col' : ''}`;
    dimContainer.innerHTML = configs.map(c => `
      <div class="input-group">
        <label for="dim-${c.key}">${c.label}</label>
        <div class="input-field">
          <input type="number" id="dim-${c.key}" data-key="${c.key}" 
                 value="${state.dims[c.key] || c.placeholder}" 
                 placeholder="${c.placeholder}" step="0.5" min="0">
          <span class="unit-label">${state.unit}</span>
        </div>
      </div>
    `).join('');

    // Bind input events
    dimContainer.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const raw = parseFloat(e.target.value);
        if (!isNaN(raw) && raw >= 0) {
          let valueFt = RockEngine.toFeet(raw, state.unit);
          state.dims[e.target.dataset.key] = valueFt;
          recalculate();
        }
      });
    });
  }

  shapeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setShape(tab.dataset.shape);
      // Shape morph animation
      const svg = tab.querySelector('svg');
      if (svg) {
        svg.classList.add('shape-morph');
        setTimeout(() => svg.classList.remove('shape-morph'), 300);
      }
    });
  });

  /* ── Unit Toggle ── */
  unitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.unit = btn.dataset.unit;
      unitButtons.forEach(b => b.classList.toggle('active', b === btn));
      // Update unit labels
      dimContainer.querySelectorAll('.unit-label').forEach(l => l.textContent = state.unit);
      // Re-read inputs with new unit conversion
      dimContainer.querySelectorAll('input').forEach(inp => {
        const raw = parseFloat(inp.value);
        if (!isNaN(raw) && raw >= 0) {
          state.dims[inp.dataset.key] = RockEngine.toFeet(raw, state.unit);
        }
      });
      recalculate();
    });
  });

  /* ── Material Selection ── */
  materialCards.forEach(card => {
    card.addEventListener('click', () => {
      state.materialId = card.dataset.material;
      materialCards.forEach(c => c.classList.toggle('active', c === card));
      recalculate();
    });
  });

  /* ── Depth Slider ── */
  if (depthSlider) {
    depthSlider.value = state.depthInches;
    updateDepthDisplay();

    depthSlider.addEventListener('input', (e) => {
      state.depthInches = parseFloat(e.target.value);
      updateDepthDisplay();
      recalculate();
    });
  }

  depthPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      state.depthInches = parseFloat(preset.dataset.depth);
      if (depthSlider) depthSlider.value = state.depthInches;
      updateDepthDisplay();
      depthPresets.forEach(p => p.classList.toggle('active', p === preset));
      recalculate();
    });
  });

  function updateDepthDisplay() {
    if (depthValue) depthValue.textContent = state.depthInches;
    if (depthSlider) {
      const pct = ((state.depthInches - 1) / 11) * 100;
      depthSlider.style.setProperty('--slider-fill', `${pct}%`);
    }
    depthPresets.forEach(p => {
      p.classList.toggle('active', parseFloat(p.dataset.depth) === state.depthInches);
    });
  }

  /* ── Waste Factor ── */
  wasteChips.forEach(chip => {
    chip.addEventListener('click', () => {
      state.wastePercent = parseInt(chip.dataset.waste);
      wasteChips.forEach(c => c.classList.toggle('active', c === chip));
      recalculate();
    });
  });

  /* ── Cost Input ── */
  if (costInput) {
    costInput.addEventListener('input', (e) => {
      state.costPerUnit = parseFloat(e.target.value) || 0;
      recalculate();
    });
  }

  /* ── Export Buttons ── */
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      const material = getMaterialById(state.materialId);
      const result = RockEngine.calculate(state.shape, state.dims, state.depthInches, material, state.wastePercent);
      RockExporter.printQuarryTicket(result, state.dims);
    });
  }

  if (btnCSV) {
    btnCSV.addEventListener('click', () => {
      const material = getMaterialById(state.materialId);
      const result = RockEngine.calculate(state.shape, state.dims, state.depthInches, material, state.wastePercent);
      RockExporter.exportToCSV(result);
    });
  }

  if (btnShare) {
    btnShare.addEventListener('click', () => {
      RockExporter.copyShareLink(state);
      btnShare.textContent = 'Copied!';
      setTimeout(() => {
        btnShare.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Share Link`;
      }, 2000);
    });
  }

  /* ── Main Recalculation ── */
  function recalculate() {
    const material = getMaterialById(state.materialId);
    const result = RockEngine.calculate(state.shape, state.dims, state.depthInches, material, state.wastePercent);

    // Animate KPI updates
    animateValue(kpiArea, result.areaSqFt, 'sq ft');
    animateValue(kpiVolume, result.volumeCuYd, 'cu yd');
    animateValue(kpiWeight, result.weightTons, 'tons');
    animateValue(kpiBags, result.bags, 'bags');

    // Breakdown table
    if (breakdownBody) {
      breakdownBody.innerHTML = `
        <tr><td>Volume (cubic feet)</td><td>${RockEngine.formatNumber(result.volumeCuFt)}</td></tr>
        <tr><td>Volume (cubic yards)</td><td>${RockEngine.formatNumber(result.volumeCuYd)}</td></tr>
        <tr><td>Weight (lbs)</td><td>${RockEngine.formatNumber(result.weightLbs)}</td></tr>
        <tr><td>Weight (tons)</td><td>${RockEngine.formatNumber(result.weightTons)}</td></tr>
        <tr><td>Density</td><td>${RockEngine.formatNumber(result.densityLbsPerCuYd)} lbs/cu yd</td></tr>
      `;
    }

    // Purchase grid
    if (purchaseGrid) {
      purchaseGrid.innerHTML = `
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4H16L18 8H6L8 4Z"/><rect x="6" y="8" width="12" height="12" rx="1"/></svg>
          <div class="purchase-value">${result.bags}</div>
          <div class="purchase-label">0.5 cu ft Bags</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 6L8 2h8l4 4"/><line x1="12" y1="10" x2="12" y2="16"/></svg>
          <div class="purchase-value">${result.superSacks}</div>
          <div class="purchase-label">Super Sacks</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="19" r="2"/><path d="M5 19H2V14L4 8H10"/><path d="M7 8V3H22V14H17"/></svg>
          <div class="purchase-value">${result.wheelbarrowLoads}</div>
          <div class="purchase-label">Wheelbarrow Loads</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 17L12 22L22 17"/><rect x="5" y="5" width="14" height="8" rx="2"/></svg>
          <div class="purchase-value">${result.dumpTruckLoads}</div>
          <div class="purchase-label">Dump Truck Loads</div>
        </div>
      `;
    }

    // Depth status warning
    if (depthStatus) {
      if (result.belowMinDepth) {
        depthStatus.className = 'depth-status danger';
        depthStatus.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          Depth is below the recommended minimum of ${result.minDepthInches}" for ${result.materialName}
        `;
      } else {
        depthStatus.className = 'depth-status good';
        depthStatus.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          Depth meets recommended minimum for ${result.materialName}
        `;
      }
    }

    // Cost calculator
    if (costTotal && state.costPerUnit > 0) {
      const total = state.costUnit === 'ton'
        ? result.weightTons * state.costPerUnit
        : result.volumeCuYd * state.costPerUnit;
      costTotal.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (costTotal) {
      costTotal.textContent = '$0.00';
    }

    // Update visualizations
    try {
      RockVisualizer.renderBlueprint('blueprint-container', state.shape, state.dims, state.unit);
    } catch (e) { /* silent */ }

    try {
      RockVisualizer.renderCrossSection('cross-section-container', state.depthInches, material.swatchColor, material.name);
    } catch (e) { /* silent */ }

    try {
      const chartData = RockEngine.coverageChartData(material, result.areaSqFt, 'area');
      RockVisualizer.renderCoverageChart('coverage-chart', chartData, state.depthInches);
    } catch (e) { /* silent */ }

    // Update 3D scene
    if (rockScene) {
      try {
        const sizeMap = { 'gravel': 0.5, 'crushed': 0.7, 'river': 1.2, 'decorative': 0.9, 'base': 0.8, 'erosion': 1.5 };
        rockScene.updateRocks(
          state.depthInches,
          material.swatchColor,
          sizeMap[material.category] || 1
        );
      } catch (e) { /* silent */ }
    }
  }

  /* ── Animated Counter ── */
  function animateValue(element, target, suffix) {
    if (!element) return;

    const valueEl = element.querySelector('.kpi-value') || element;
    const current = parseFloat(valueEl.textContent.replace(/,/g, '')) || 0;

    if (Math.abs(current - target) < 0.01) return;

    valueEl.classList.add('updating');
    setTimeout(() => valueEl.classList.remove('updating'), 300);

    const duration = 400;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const val = current + (target - val) * eased;

      // Use target directly for final frame
      if (progress >= 1) {
        valueEl.textContent = RockEngine.formatNumber(target);
        return;
      }

      const interpolated = current + (target - current) * eased;
      valueEl.textContent = RockEngine.formatNumber(parseFloat(interpolated.toFixed(2)));
      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  /* ── FAQ Accordion ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Initialize ── */
  renderDimensionInputs(state.shape);
  updateDepthDisplay();

  // Set initial active states
  materialCards.forEach(c => {
    c.classList.toggle('active', c.dataset.material === state.materialId);
  });
  wasteChips.forEach(c => {
    c.classList.toggle('active', parseInt(c.dataset.waste) === state.wastePercent);
  });

  // Initial calculation
  recalculate();

  // Hero word animation
  document.querySelectorAll('.hero-word').forEach((word, i) => {
    word.style.animationDelay = `${i * 0.1}s`;
  });
});
