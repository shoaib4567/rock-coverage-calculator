/**
 * Main Application Controller - rockcoveragecalculator.com
 * Orchestrates DOM events, live state reactivity, visualization sync,
 * export hooks, theme switching, advanced pricing, multi-zone saved projects,
 * accurate unit conversions (ft, in, yd, m), and synchronized 3D scene morphing.
 */

import { RockEngine } from './engine.js';
import { ROCK_MATERIALS, getMaterialById } from './materials-data.js';
import { RockVisualizer } from './visualizer.js';
import { RockExporter } from './export.js';

document.addEventListener('DOMContentLoaded', async () => {

  /* ── State ── */
  const state = {
    shape: 'rectangle',
    unit: 'ft',
    rawDims: { length: 10, width: 10 },
    materialId: 'pea-gravel',
    depthInches: 3,
    wastePercent: 10,
    customDensity: null,
    isCompacted: false,
    costMaterialRate: 55,
    costDeliveryFee: 75,
    costLaborRate: 35,
    costFabricRate: 40,
    costTaxRate: 7.0
  };

  // Helper to get normalized dimensions in feet for calculation engine and 3D
  function getDimsInFeet() {
    const feetDims = {};
    Object.keys(state.rawDims).forEach(k => {
      feetDims[k] = RockEngine.toFeet(state.rawDims[k], state.unit);
    });
    return feetDims;
  }

  function calculateCurrentResult() {
    return RockEngine.calculate(
      state.shape,
      getDimsInFeet(),
      state.depthInches,
      getMaterialById(state.materialId),
      state.wastePercent,
      { customDensity: state.customDensity, isCompacted: state.isCompacted }
    );
  }

  function nonNegativeInput(input, fallback) {
    const value = input?.value;
    if (value === '' || value === undefined) return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : fallback;
  }

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const savedNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };
  const csvCell = value => {
    const raw = String(value ?? '');
    const safe = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const zoneShapeKeys = {
    rectangle: ['length', 'width'], circle: ['radius'], ring: ['outerRadius', 'innerRadius'],
    triangle: ['base', 'height'], trapezoid: ['top', 'bottom', 'height'],
    lshape: ['length1', 'width1', 'length2', 'width2']
  };
  function normalizeSavedZones(input) {
    if (!Array.isArray(input)) return [];
    return input.filter(zone => {
      if (!zone || typeof zone !== 'object' || !Object.hasOwn(zoneShapeKeys, zone.shape)) return false;
      const dimensions = zone.rawDims || zone.dims;
      if (!dimensions || typeof dimensions !== 'object') return false;
      if (!zoneShapeKeys[zone.shape].every(key => Number.isFinite(Number(dimensions[key])) && Number(dimensions[key]) > 0)) return false;
      if (zone.shape === 'ring' && Number(dimensions.outerRadius) <= Number(dimensions.innerRadius)) return false;
      if (!ROCK_MATERIALS.some(material => material.id === zone.materialId)) return false;
      if (!['ft', 'in', 'yd', 'm'].includes(zone.unit || 'ft')) return false;
      return ['depthInches', 'wastePercent', 'areaSqFt', 'volumeCuYd', 'weightTons', 'bags', 'totalCost'].every(key => Number.isFinite(Number(zone[key])))
        && Number(zone.depthInches) > 0 && [0, 5, 10, 15, 20].includes(Number(zone.wastePercent));
    }).map((zone, index) => ({
      ...zone,
      id: Number.isSafeInteger(Number(zone.id)) ? Number(zone.id) : Date.now() + index,
      name: String(zone.name ?? 'Project zone').slice(0, 120),
      unit: zone.unit || 'ft',
      rawDims: Object.fromEntries(zoneShapeKeys[zone.shape].map(key => [key, Number((zone.rawDims || zone.dims)[key])])),
      materialName: getMaterialById(zone.materialId).name,
      depthInches: Number(zone.depthInches),
      wastePercent: Number(zone.wastePercent),
      customDensity: Number.isFinite(Number(zone.customDensity)) && Number(zone.customDensity) >= 500 && Number(zone.customDensity) <= 5000 ? Number(zone.customDensity) : null,
      isCompacted: Boolean(zone.isCompacted && getMaterialById(zone.materialId).isCompactable),
      areaSqFt: Number(zone.areaSqFt),
      volumeCuYd: Number(zone.volumeCuYd),
      weightTons: Number(zone.weightTons),
      bags: Number(zone.bags),
      totalCost: Number(zone.totalCost),
      date: String(zone.date ?? '').slice(0, 60)
    }));
  }

  // Saved Projects storage
  let savedProjects = [];
  try {
    const rawSaved = localStorage.getItem('rock_saved_projects');
    if (rawSaved) savedProjects = normalizeSavedZones(JSON.parse(rawSaved));
  } catch (e) {
    savedProjects = [];
  }

  // Restore multi-zone projects from URL hash if present
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#project=')) {
    try {
      const encoded = window.location.hash.replace('#project=', '');
      const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
      if (Array.isArray(decoded) && decoded.length > 0) {
        savedProjects = normalizeSavedZones(decoded);
      }
    } catch (e) {
      console.warn('Could not restore shared project:', e);
    }
  }

  // Restore from URL if shared, or initialize from #calculator dataset
  const savedState = RockExporter.decodeState();
  const calcSection = document.getElementById('calculator');
  if (savedState) {
    if (savedState.rawDims) {
      Object.assign(state, savedState);
    } else if (savedState.dims) {
      state.rawDims = { ...savedState.dims };
      Object.assign(state, savedState);
    }
  } else if (calcSection) {
    if (calcSection.dataset.initialMaterial) state.materialId = calcSection.dataset.initialMaterial;
    if (calcSection.dataset.initialDepth) state.depthInches = parseFloat(calcSection.dataset.initialDepth);
    if (calcSection.dataset.initialUnit) state.unit = calcSection.dataset.initialUnit;
    if (calcSection.dataset.initialShape) state.shape = calcSection.dataset.initialShape;
  }

  /* ── DOM References ── */
  const shapeTabs = document.querySelectorAll('.shape-tab');
  const dimContainer = document.getElementById('dimension-inputs');
  const dimensionError = document.getElementById('dimension-error');
  const calculatorResults = document.getElementById('calculator-results');
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
  const costMaterialInput = document.getElementById('cost-material-rate');
  const costDeliveryInput = document.getElementById('cost-delivery-fee');
  const costLaborInput = document.getElementById('cost-labor-rate');
  const costFabricInput = document.getElementById('cost-fabric-rate');
  const costTaxInput = document.getElementById('cost-tax-rate');

  const costSummaryMaterial = document.getElementById('cost-summary-material');
  const costSummaryDelivery = document.getElementById('cost-summary-delivery');
  const costSummaryLabor = document.getElementById('cost-summary-labor');
  const costSummaryFabric = document.getElementById('cost-summary-fabric');
  const costSummaryTax = document.getElementById('cost-summary-tax');
  const costTotal = document.getElementById('cost-total');

  // Action buttons
  const btnSaveProject = document.getElementById('btn-save-project');
  const btnPrint = document.getElementById('btn-print');
  const btnCSV = document.getElementById('btn-csv');
  const btnShare = document.getElementById('btn-share');
  const btnSupplierQuote = document.getElementById('btn-supplier-quote');
  const resultActionButtons = [btnSupplierQuote, btnSaveProject, btnPrint, btnCSV, btnShare];

  // Supplier Quote Modal Elements
  const quoteModal = document.getElementById('supplier-quote-modal');
  const btnCloseQuoteModal = document.getElementById('btn-close-quote-modal');
  const rfqDestination = document.getElementById('rfq-destination');
  const rfqAccessNotes = document.getElementById('rfq-access-notes');
  const rfqTextPreview = document.getElementById('rfq-text-preview');
  const btnCopyRfqText = document.getElementById('btn-copy-rfq-text');
  const btnRfqEmail = document.getElementById('btn-rfq-email');
  const btnRfqSms = document.getElementById('btn-rfq-sms');

  // Project Outcome Elements
  const outcomeChips = document.querySelectorAll('.btn-outcome-chip');
  const outcomeForm = document.getElementById('outcome-form');
  const outcomeTicketTons = document.getElementById('outcome-ticket-tons');
  const outcomeNotes = document.getElementById('outcome-notes');
  const btnSubmitOutcome = document.getElementById('btn-submit-outcome');
  const outcomeConfirmation = document.getElementById('outcome-confirmation');

  // Saved projects elements
  const savedProjectsList = document.getElementById('saved-projects-list');
  const savedCountBadge = document.getElementById('saved-count-badge');
  const btnClearSaved = document.getElementById('btn-clear-saved');
  const btnExportSavedCSV = document.getElementById('btn-export-saved-csv');
  const btnExportSavedJSON = document.getElementById('btn-export-saved-json');
  const btnImportSavedJSON = document.getElementById('btn-import-saved-json');
  const inputImportSaved = document.getElementById('input-import-saved');
  const btnShareSaved = document.getElementById('btn-share-saved');

  // Geotechnical controls elements
  const customDensityInput = document.getElementById('custom-density-input');
  const densityInputError = document.getElementById('density-input-error');
  const btnResetDensity = document.getElementById('btn-reset-density');
  const toggleCompaction = document.getElementById('toggle-compaction');
  const compactionGroup = document.getElementById('compaction-control-group');
  const densityHint = document.getElementById('density-standard-hint');
  const compactionFactorText = document.getElementById('compaction-factor-text');

  // Theme toggle
  const themeToggleBtn = document.getElementById('theme-toggle');

  /* ── Theme Toggle Event ── */
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', target);
      try {
        localStorage.setItem('theme', target);
      } catch (e) {}
    });
  }

  /* ── 3D Scene Lazy-Loading via IntersectionObserver ── */
  let rockScene = null;
  let rockSceneLoading = false;

  async function loadRockScene() {
    if (rockScene || rockSceneLoading) return;
    const container = document.getElementById('rock-scene-canvas');
    if (!container) return;

    rockSceneLoading = true;
    try {
      const { initRockScene } = await import('./rock-scene.js');
      rockScene = await initRockScene('rock-scene-canvas');
      if (rockScene) {
        const dimsInFeet = getDimsInFeet();
        const material = getMaterialById(state.materialId);
        rockScene.updateScene({
          shape: state.shape,
          dims: dimsInFeet,
          depth: state.depthInches,
          material: material
        });
      }
    } catch (e) {
      console.warn('3D scene dynamic import/initialization error:', e);
    } finally {
      rockSceneLoading = false;
    }
  }

  // Lazy-load when user approaches visualizer section
  const visualizerSection = document.getElementById('visualizer') || document.getElementById('rock-scene-canvas');
  if (visualizerSection && 'IntersectionObserver' in window) {
    const vizObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadRockScene();
          vizObserver.disconnect();
        }
      });
    }, { rootMargin: '300px 0px' });
    vizObserver.observe(visualizerSection);
  }

  // Also load immediately if user clicks "3D Bed Live" badge or the fallback canvas
  document.querySelectorAll('.viz-live-badge, #rock-scene-canvas').forEach(el => {
    el.addEventListener('click', () => {
      loadRockScene();
    });
  });

  /* ── Shape Tab Configurations ── */
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

    // Set defaults in active unit
    const configs = shapeConfigs[shape];
    state.rawDims = {};
    configs.forEach(c => {
      const defaultFt = parseFloat(c.placeholder) || 0;
      const inUnit = RockEngine.fromFeet(defaultFt, state.unit);
      state.rawDims[c.key] = Math.round(inUnit * 100) / 100;
    });

    // Update tab visual active state and ARIA
    shapeTabs.forEach(tab => {
      const isActive = tab.dataset.shape === shape;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
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
                 value="${RockEngine.formatInputValue(state.rawDims[c.key])}" 
                  placeholder="${c.placeholder}" step="any" min="0.01" required
                  aria-label="${c.label} (${state.unit})"
                  aria-describedby="dimension-error"
                 autocomplete="off">
          <span class="unit-label">${state.unit}</span>
        </div>
      </div>
    `).join('');

    // Bind input events
    dimContainer.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const raw = parseFloat(e.target.value);
        state.rawDims[e.target.dataset.key] = Number.isFinite(raw) ? raw : null;
        recalculate();
      });
    });
  }

  function validateDimensions() {
    const configs = shapeConfigs[state.shape] || [];
    const errors = [];

    configs.forEach(({ key, label }) => {
      const value = Number(state.rawDims[key]);
      if (!Number.isFinite(value) || value <= 0) {
        errors.push({ key, message: `${label} must be greater than zero.` });
      }
    });

    if (state.shape === 'ring') {
      const outer = Number(state.rawDims.outerRadius);
      const inner = Number(state.rawDims.innerRadius);
      if (Number.isFinite(outer) && Number.isFinite(inner) && outer > 0 && inner > 0 && outer <= inner) {
        const message = 'Outer radius must be greater than inner radius.';
        errors.push({ key: 'outerRadius', message }, { key: 'innerRadius', message });
      }
    }

    return errors;
  }

  function renderDimensionValidation(errors) {
    const invalidKeys = new Set(errors.map(error => error.key));
    dimContainer?.querySelectorAll('input').forEach(input => {
      const invalid = invalidKeys.has(input.dataset.key);
      input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      input.closest('.input-field')?.classList.toggle('input-field-invalid', invalid);
    });

    if (dimensionError) {
      dimensionError.hidden = errors.length === 0;
      dimensionError.textContent = errors[0]?.message || '';
    }

    if (calculatorResults) calculatorResults.setAttribute('aria-busy', errors.length ? 'true' : 'false');

    resultActionButtons.forEach(button => {
      if (!button) return;
      button.disabled = errors.length > 0;
      button.setAttribute('aria-disabled', errors.length ? 'true' : 'false');
    });
  }

  function renderInvalidResults(message = 'Correct the project dimensions to calculate quantities.') {
    [kpiArea, kpiVolume, kpiWeight, kpiBags].forEach(card => {
      const value = card?.querySelector('.kpi-value');
      if (value) {
        value.dataset.animationToken = String(Number(value.dataset.animationToken || 0) + 1);
        value.textContent = '—';
      }
      const subtext = card?.querySelector('.kpi-subtext');
      if (subtext) subtext.textContent = 'Enter valid inputs';
    });
    if (breakdownBody) breakdownBody.innerHTML = `<tr><td colspan="2" class="invalid-results-message">${message}</td></tr>`;
    if (purchaseGrid) purchaseGrid.innerHTML = '<p class="invalid-results-message">Purchasing recommendations will appear when the dimensions are valid.</p>';
    [costSummaryMaterial, costSummaryDelivery, costSummaryLabor, costSummaryFabric, costSummaryTax, costTotal].forEach(element => {
      if (element) element.textContent = '—';
    });
  }

  shapeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setShape(tab.dataset.shape);
      const svg = tab.querySelector('svg');
      if (svg) {
        svg.classList.add('shape-morph');
        setTimeout(() => svg.classList.remove('shape-morph'), 300);
      }
    });
  });

  /* ── Unit Toggle (Feet, Inches, Meters, Yards) ── */
  unitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const oldUnit = state.unit;
      const newUnit = btn.dataset.unit;
      if (oldUnit === newUnit) return;

      unitButtons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });

      // Convert existing dimensions to new unit
      Object.keys(state.rawDims).forEach(k => {
        const valInFeet = RockEngine.toFeet(state.rawDims[k], oldUnit);
        const valInNewUnit = RockEngine.fromFeet(valInFeet, newUnit);
        state.rawDims[k] = Math.round(valInNewUnit * 100) / 100;
      });

      state.unit = newUnit;

      // Update unit labels and input values in DOM
      if (dimContainer) {
        dimContainer.querySelectorAll('.unit-label').forEach(el => {
          el.textContent = newUnit;
        });
        dimContainer.querySelectorAll('input').forEach(inp => {
          const key = inp.dataset.key;
          if (state.rawDims[key] !== undefined) {
            inp.value = RockEngine.formatInputValue(state.rawDims[key]);
            const config = shapeConfigs[state.shape]?.find(c => c.key === key);
            if (config) {
              inp.setAttribute('aria-label', `${config.label} (${newUnit})`);
            }
          }
        });
      }

      recalculate();
    });
  });

  /* ── Material Picker ── */
  materialCards.forEach(card => {
    card.addEventListener('click', () => {
      materialCards.forEach(c => {
        const isActive = c === card;
        c.classList.toggle('active', isActive);
        c.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
      if (state.materialId !== card.dataset.material) {
        state.customDensity = null;
        state.isCompacted = false;
        if (toggleCompaction) toggleCompaction.checked = false;
      }
      state.materialId = card.dataset.material;

      // Card selection pulse animation
      card.classList.add('selected-pulse');
      setTimeout(() => card.classList.remove('selected-pulse'), 400);

      updateGeotechUI();
      recalculate();
    });
  });

  /* ── Geotechnical Controls UI & Logic ── */
  function updateGeotechUI() {
    const mat = getMaterialById(state.materialId);
    if (!mat) return;

    if (customDensityInput) {
      customDensityInput.placeholder = mat.densityLbsPerCuYd;
      if (state.customDensity) {
        customDensityInput.value = state.customDensity;
        if (btnResetDensity) btnResetDensity.style.display = 'inline-block';
      } else {
        customDensityInput.value = '';
        if (btnResetDensity) btnResetDensity.style.display = 'none';
      }
    }

    if (densityHint) {
      densityHint.textContent = `Planning factor: ${mat.densityLbsPerCuYd.toLocaleString()} lbs/yd³. Use your supplier's loose bulk density when available.`;
    }

    if (compactionGroup) {
      if (mat.isCompactable) {
        compactionGroup.style.display = 'block';
        if (compactionFactorText) {
          const pct = Math.round(((mat.compactionFactor || 1.15) - 1) * 100);
          compactionFactorText.textContent = `+${pct}% loose material allowance`;
        }
      } else {
        compactionGroup.style.display = 'none';
        state.isCompacted = false;
        if (toggleCompaction) toggleCompaction.checked = false;
      }
    }
  }

  if (customDensityInput) {
    customDensityInput.addEventListener('input', () => {
      const val = Number(customDensityInput.value);
      if (customDensityInput.value.trim() !== '' && Number.isFinite(val) && val >= 500 && val <= 5000) {
        state.customDensity = val;
        if (btnResetDensity) btnResetDensity.style.display = 'inline-block';
      } else {
        state.customDensity = null;
        if (btnResetDensity) btnResetDensity.style.display = customDensityInput.value.trim() === '' ? 'none' : 'inline-block';
      }
      recalculate();
    });
  }

  if (btnResetDensity) {
    btnResetDensity.addEventListener('click', () => {
      state.customDensity = null;
      if (customDensityInput) customDensityInput.value = '';
      btnResetDensity.style.display = 'none';
      recalculate();
    });
  }

  if (toggleCompaction) {
    toggleCompaction.addEventListener('change', () => {
      state.isCompacted = toggleCompaction.checked;
      recalculate();
    });
  }

  /* ── Depth Slider & Presets ── */
  if (depthSlider) {
    depthSlider.addEventListener('input', (e) => {
      state.depthInches = parseFloat(e.target.value);
      updateDepthDisplay();
      recalculate();
    });
  }

  depthPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const depth = parseFloat(btn.dataset.depth);
      state.depthInches = depth;
      if (depthSlider) depthSlider.value = depth;
      updateDepthDisplay();
      recalculate();
    });
  });

  function updateDepthDisplay() {
    if (depthValue) {
      depthValue.textContent = state.depthInches;
    }
    if (depthSlider) {
      depthSlider.setAttribute('aria-valuenow', state.depthInches);
      depthSlider.setAttribute('aria-valuetext', `${state.depthInches} inches`);
    }
    depthPresets.forEach(btn => {
      const isActive = parseFloat(btn.dataset.depth) === state.depthInches;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  /* ── Waste Factor Chips ── */
  wasteChips.forEach(chip => {
    chip.addEventListener('click', () => {
      wasteChips.forEach(c => {
        const isActive = c === chip;
        c.classList.toggle('active', isActive);
        c.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
      state.wastePercent = parseInt(chip.dataset.waste, 10);
      recalculate();
    });
  });

  /* ── Cost Input Event Listeners ── */
  const costInputs = [costMaterialInput, costDeliveryInput, costLaborInput, costFabricInput, costTaxInput];
  costInputs.forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        recalculate();
      });
    }
  });

  /* ── Export & Sharing Actions ── */
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      RockExporter.printQuarryTicket(calculateCurrentResult());
    });
  }

  if (btnCSV) {
    btnCSV.addEventListener('click', () => {
      RockExporter.exportToCSV(calculateCurrentResult());
    });
  }

  if (btnShare) {
    btnShare.addEventListener('click', () => {
      RockExporter.copyShareLink(state);
      btnShare.textContent = 'Copied Link!';
      setTimeout(() => {
        btnShare.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Share Link`;
      }, 2000);
    });
  }

  /* ── Supplier RFQ Generator Modal ── */
  function generateRfqText() {
    const dimsInFeet = getDimsInFeet();
    const material = getMaterialById(state.materialId);
    const result = RockEngine.calculate(state.shape, dimsInFeet, state.depthInches, material, state.wastePercent, {
      customDensity: state.customDensity,
      isCompacted: state.isCompacted
    });

    const destination = rfqDestination?.value.trim() || '[Specify City / ZIP / Cross Streets]';
    const accessNotes = rfqAccessNotes?.value.trim() || '[Please confirm truck access and overhead clearance]';

    return `Subject: Material Quote & Delivery Availability: ${result.weightTons.toFixed(2)} Tons of ${material.name}

Hi Sales Desk / Dispatch,

I am requesting price and delivery availability for an upcoming landscaping project:

• Material Requested: ${material.name}
• Quantity Needed: ${result.weightTons.toFixed(2)} Short Tons (~${result.volumeCuYd.toFixed(2)} Cubic Yards)
• Coverage Footprint: ${result.areaSqFt.toFixed(0)} sq ft at ${state.depthInches}" depth (includes ${state.wastePercent}% extra material${result.isCompacted ? ' plus a compactable-base allowance' : ''})
• Weight Conversion: ${result.densityLbsPerCuYd.toLocaleString()} lbs per loose cubic yard${result.isCustomDensity ? ' (entered value)' : ' (planning factor)'}
• Delivery Destination: ${destination}
• Site Access Notes: ${accessNotes}

Please let me know:
1. Delivered price per ton (or all-inclusive total price with freight)
2. Minimum order requirements or split-load fees (if applicable)
3. Earliest delivery date and available delivery windows
4. Maximum truck size for your fleet (single-axle, tandem, or tri-axle)

Thank you!`;
  }

  function updateRfqMessage() {
    if (!rfqTextPreview) return;
    const text = generateRfqText();
    rfqTextPreview.value = text;

    const material = getMaterialById(state.materialId);
    const result = calculateCurrentResult();
    const subject = encodeURIComponent(`Material Quote: ${result.weightTons.toFixed(2)} Tons of ${material.name}`);
    const body = encodeURIComponent(text);

    if (btnRfqEmail) {
      btnRfqEmail.href = `mailto:?subject=${subject}&body=${body}`;
    }
    if (btnRfqSms) {
      btnRfqSms.href = `sms:?&body=${body}`;
    }
  }

  if (btnSupplierQuote && quoteModal) {
    btnSupplierQuote.addEventListener('click', () => {
      updateRfqMessage();
      quoteModal.style.display = 'flex';
      if (rfqDestination) rfqDestination.focus();
    });

    if (btnCloseQuoteModal) {
      btnCloseQuoteModal.addEventListener('click', () => {
        quoteModal.style.display = 'none';
      });
    }

    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) {
        quoteModal.style.display = 'none';
      }
    });

    if (rfqDestination) {
      rfqDestination.addEventListener('input', updateRfqMessage);
    }
    if (rfqAccessNotes) {
      rfqAccessNotes.addEventListener('input', updateRfqMessage);
    }

    if (btnCopyRfqText && rfqTextPreview) {
      btnCopyRfqText.addEventListener('click', () => {
        navigator.clipboard.writeText(rfqTextPreview.value).then(() => {
          btnCopyRfqText.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied Message!`;
          setTimeout(() => {
            btnCopyRfqText.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Message`;
          }, 2000);
        });
      });
    }
  }

  /* ── Project Outcome Field Loop ── */
  let activeOutcome = null;
  outcomeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      outcomeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeOutcome = chip.dataset.outcome;
      if (outcomeForm) outcomeForm.style.display = 'block';
    });
  });

  if (btnSubmitOutcome) {
    btnSubmitOutcome.addEventListener('click', () => {
      const material = getMaterialById(state.materialId);
      const result = calculateCurrentResult();

      const fieldReport = {
        id: Date.now(),
        date: new Date().toISOString(),
        outcome: activeOutcome,
        material: material.name,
        calculatedTons: result.weightTons,
        actualTicketTons: parseFloat(outcomeTicketTons?.value) || null,
        notes: outcomeNotes?.value.trim() || '',
        depthInches: state.depthInches,
        areaSqFt: result.areaSqFt
      };

      try {
        const existing = JSON.parse(localStorage.getItem('rock_coverage_field_reports') || '[]');
        existing.push(fieldReport);
        localStorage.setItem('rock_coverage_field_reports', JSON.stringify(existing));
      } catch (e) {}

      if (outcomeForm) outcomeForm.style.display = 'none';
      if (outcomeConfirmation) outcomeConfirmation.style.display = 'flex';
      setTimeout(() => {
        if (outcomeConfirmation) outcomeConfirmation.style.display = 'none';
      }, 5000);
    });
  }

  /* ── Dynamic Transparent Math Explainer ── */
  function renderExplainer(result, shape, dimsInFeet, depthInches, wastePercent, material, isCompacted) {
    const container = document.getElementById('explainer-steps-container');
    if (!container) return;

    const baseCuFt = result.areaSqFt * (depthInches / 12);
    const baseCuYd = baseCuFt / 27;

    let areaFormula = '';
    if (shape === 'rectangle') {
      areaFormula = `Length (${state.rawDims.length || 0} ${state.unit}) × Width (${state.rawDims.width || 0} ${state.unit}) = ${RockEngine.formatNumber(result.areaSqFt)} sq ft`;
    } else if (shape === 'circle') {
      areaFormula = `π × (Radius ${state.rawDims.radius || 0} ${state.unit})² = ${RockEngine.formatNumber(result.areaSqFt)} sq ft`;
    } else if (shape === 'ring') {
      areaFormula = `π × (Outer Radius ${state.rawDims.outerRadius || 0}² - Inner Radius ${state.rawDims.innerRadius || 0}²) = ${RockEngine.formatNumber(result.areaSqFt)} sq ft`;
    } else if (shape === 'triangle') {
      areaFormula = `½ × Base (${state.rawDims.base || 0} ${state.unit}) × Height (${state.rawDims.height || 0} ${state.unit}) = ${RockEngine.formatNumber(result.areaSqFt)} sq ft`;
    } else if (shape === 'trapezoid') {
      areaFormula = `[Base A (${state.rawDims.baseA || 0}) + Base B (${state.rawDims.baseB || 0})] ÷ 2 × Height (${state.rawDims.height || 0}) = ${RockEngine.formatNumber(result.areaSqFt)} sq ft`;
    } else {
      areaFormula = `Measured Surface Footprint = ${RockEngine.formatNumber(result.areaSqFt)} sq ft`;
    }

    const compactionMultiplier = isCompacted ? (material.compactionFactor || 1.25) : 1.0;
    const wasteMultiplier = 1 + (wastePercent / 100);
    const totalMultiplier = (wasteMultiplier * compactionMultiplier).toFixed(2);
    const compactionNote = isCompacted ? ` (includes ×${material.compactionFactor || 1.25} compactable-base allowance)` : '';

    container.innerHTML = `
      <div class="explainer-step">
        <span class="step-number">Step 1</span>
        <div class="step-content">
          <strong>Measured Surface Area:</strong>
          <div class="step-formula">${areaFormula}</div>
        </div>
      </div>
      <div class="explainer-step">
        <span class="step-number">Step 2</span>
        <div class="step-content">
          <strong>Finished Layer Volume (Before Allowances):</strong>
          <div class="step-formula">${RockEngine.formatNumber(result.areaSqFt)} sq ft × (${depthInches}" ÷ 12) = ${RockEngine.formatNumber(baseCuFt)} cu ft (${RockEngine.formatNumber(baseCuYd)} cu yds)</div>
        </div>
      </div>
      <div class="explainer-step">
        <span class="step-number">Step 3</span>
        <div class="step-content">
          <strong>Extra Material Allowance (+${wastePercent}%${compactionNote}):</strong>
          <div class="step-formula">${RockEngine.formatNumber(baseCuFt)} cu ft × ${totalMultiplier} = <strong>${RockEngine.formatNumber(result.volumeCuYd)} cu yds</strong> (${RockEngine.formatNumber(result.volumeCuFt)} cu ft)</div>
        </div>
      </div>
      <div class="explainer-step">
        <span class="step-number">Step 4</span>
        <div class="step-content">
          <strong>Estimated Weight (${RockEngine.formatNumber(result.densityLbsPerCuYd)} lbs/yd³ ${result.isCustomDensity ? 'entered density' : 'planning density'}):</strong>
          <div class="step-formula">${(result.volumeCuFt / 27).toFixed(4)} cu yds (before rounding) × ${RockEngine.formatNumber(result.densityLbsPerCuYd)} lbs/yd³ ≈ ${RockEngine.formatNumber(result.weightLbs)} lbs ÷ 2,000 ≈ <strong>${RockEngine.formatNumber(result.weightTons)} Short Tons</strong> (${RockEngine.formatNumber(result.weightTonnes)} Tonnes)</div>
        </div>
      </div>
      <div class="explainer-step">
        <span class="step-number">Step 5</span>
        <div class="step-content">
          <strong>Retail Bag Sizing (0.5 cu ft bags):</strong>
          <div class="step-formula">${RockEngine.formatNumber(result.volumeCuFt)} cu ft ÷ 0.5 cu ft/bag = <strong>${result.bags} Bags</strong></div>
        </div>
      </div>
    `;
  }

  /* ── Saved Projects System ── */
  if (btnSaveProject) {
    btnSaveProject.addEventListener('click', () => {
      const dimsInFeet = getDimsInFeet();
      const material = getMaterialById(state.materialId);
      const result = RockEngine.calculate(state.shape, dimsInFeet, state.depthInches, material, state.wastePercent, {
        customDensity: state.customDensity,
        isCompacted: state.isCompacted
      });
      
      const defaultName = `${material.name} - Zone ${savedProjects.length + 1}`;
      const name = window.prompt('Enter a name for this project zone:', defaultName) || defaultName;

      // Calculate itemized cost
      const matRate = nonNegativeInput(costMaterialInput, 55);
      const deliveryFee = nonNegativeInput(costDeliveryInput, 75);
      const laborRate = nonNegativeInput(costLaborInput, 35);
      const fabricCost = nonNegativeInput(costFabricInput, 40);
      const taxRate = nonNegativeInput(costTaxInput, 7.0);

      const subtotal = (result.weightTons * matRate) + deliveryFee + (result.weightTons * laborRate) + fabricCost;
      const totalCost = subtotal + subtotal * (taxRate / 100);

      const zone = {
        id: Date.now(),
        name,
        shape: state.shape,
        rawDims: { ...state.rawDims },
        dims: { ...dimsInFeet },
        unit: state.unit,
        materialId: state.materialId,
        materialName: material.name,
        depthInches: state.depthInches,
        wastePercent: state.wastePercent,
        customDensity: state.customDensity,
        isCompacted: state.isCompacted,
        densityLbsPerCuYd: result.densityLbsPerCuYd,
        compactionMultiplier: result.compactionMultiplier,
        costRates: { material: matRate, delivery: deliveryFee, labor: laborRate, fabric: fabricCost, tax: taxRate },
        areaSqFt: result.areaSqFt,
        volumeCuYd: result.volumeCuYd,
        weightTons: result.weightTons,
        bags: result.bags,
        totalCost,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      savedProjects.push(zone);
      persistAndRenderSaved();

      // Visual feedback
      btnSaveProject.textContent = 'Saved!';
      setTimeout(() => {
        btnSaveProject.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Project Zone`;
      }, 1800);
    });
  }

  if (btnClearSaved) {
    btnClearSaved.addEventListener('click', () => {
      if (savedProjects.length === 0) return;
      if (window.confirm('Clear all saved project zones?')) {
        savedProjects = [];
        persistAndRenderSaved();
      }
    });
  }

  if (btnExportSavedCSV) {
    btnExportSavedCSV.addEventListener('click', () => {
      if (savedProjects.length === 0) {
        alert('No project zones saved yet.');
        return;
      }
      const rows = [
        ['Zone Name', 'Shape', 'Material', 'Depth (in)', 'Extra Allowance (%)', 'Area (sq ft)', 'Volume (cu yd)', 'Weight (short tons)', 'Density (lbs/cu yd)', 'Compactable Base Factor', 'Bags (0.5 cu ft)', 'Saved Cost Estimate', 'Material Rate', 'Delivery Fee', 'Labor Rate', 'Fabric Cost', 'Tax Rate (%)', 'Date'],
        ...savedProjects.map(z => [
          z.name, z.shape, z.materialName, z.depthInches, z.wastePercent, z.areaSqFt,
          z.volumeCuYd, z.weightTons, z.densityLbsPerCuYd ?? z.customDensity ?? '',
          z.isCompacted ? (z.compactionMultiplier ?? '') : 1, z.bags,
          savedNumber(z.totalCost).toFixed(2), z.costRates?.material ?? '',
          z.costRates?.delivery ?? '', z.costRates?.labor ?? '', z.costRates?.fabric ?? '',
          z.costRates?.tax ?? '', z.date
        ])
      ];
      const csv = rows.map(row => row.map(csvCell).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rock_coverage_project_zones_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  /* ── JSON Backup & Restore for Project Portability ── */
  if (btnExportSavedJSON) {
    btnExportSavedJSON.addEventListener('click', () => {
      if (savedProjects.length === 0) {
        alert('No project zones saved yet. Add a zone first before downloading a backup.');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedProjects, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `rock_coverage_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  if (btnImportSavedJSON && inputImportSaved) {
    btnImportSavedJSON.addEventListener('click', () => {
      inputImportSaved.click();
    });

    inputImportSaved.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            const validZones = normalizeSavedZones(imported);
            if (validZones.length === 0) {
              alert('No valid project zones were found in that backup.');
              inputImportSaved.value = '';
              return;
            }
            if (savedProjects.length > 0) {
              if (window.confirm(`Found ${validZones.length} valid project zones in backup. Merge with existing zones? (Click Cancel to replace current list)`)) {
                savedProjects = [...savedProjects, ...validZones];
              } else {
                savedProjects = validZones;
              }
            } else {
              savedProjects = validZones;
            }
            persistAndRenderSaved();
            alert(`Successfully loaded ${validZones.length} project zone(s)!`);
          } else {
            alert('Invalid project backup file format.');
          }
        } catch (err) {
          alert('Could not parse project backup JSON.');
        }
        inputImportSaved.value = '';
      };
      reader.readAsText(file);
    });
  }

  if (btnShareSaved) {
    btnShareSaved.addEventListener('click', () => {
      if (savedProjects.length === 0) {
        alert('No project zones to share. Save a zone first.');
        return;
      }
      try {
        const payload = btoa(encodeURIComponent(JSON.stringify(savedProjects)));
        const url = new URL(window.location.href);
        url.hash = 'project=' + payload;
        navigator.clipboard.writeText(url.href).then(() => {
          btnShareSaved.textContent = 'Copied Link!';
          setTimeout(() => {
            btnShareSaved.textContent = 'Share Link';
          }, 2000);
        });
      } catch (err) {
        alert('Could not create shareable link.');
      }
    });
  }

  function persistAndRenderSaved() {
    try {
      localStorage.setItem('rock_saved_projects', JSON.stringify(savedProjects));
    } catch (e) {}

    if (savedCountBadge) {
      savedCountBadge.textContent = `${savedProjects.length} Zone${savedProjects.length === 1 ? '' : 's'}`;
    }

    if (!savedProjectsList) return;

    if (savedProjects.length === 0) {
      savedProjectsList.innerHTML = `
        <div class="saved-empty-state">
          <p>No project zones saved yet. Click "Save Project Zone" above to add your walkway, driveway, or garden bed to your multi-zone project list.</p>
        </div>
      `;
      return;
    }

    savedProjectsList.innerHTML = savedProjects.map(z => `
      <div class="saved-zone-card">
        <div class="saved-zone-info">
          <div class="saved-zone-name">${escapeHtml(z.name)}</div>
          <div class="saved-zone-meta">${escapeHtml(z.materialName)} &bull; ${savedNumber(z.depthInches)}" deep &bull; ${escapeHtml(z.date)}</div>
        </div>
        <div class="saved-zone-stats">
          <div class="saved-stat-badge">${savedNumber(z.areaSqFt).toFixed(0)} sq ft</div>
          <div class="saved-stat-badge">${savedNumber(z.weightTons).toFixed(2)} tons</div>
          <div class="saved-stat-badge">${savedNumber(z.volumeCuYd).toFixed(2)} yd³</div>
          <div class="saved-stat-badge" title="Cost estimate when this zone was saved">Saved $${savedNumber(z.totalCost).toFixed(2)}</div>
        </div>
        <div class="saved-zone-actions">
          <button class="btn btn-secondary btn-sm btn-load-zone" data-id="${savedNumber(z.id)}" title="Load zone into calculator">Load</button>
          <button class="btn btn-ghost btn-sm btn-del-zone" data-id="${savedNumber(z.id)}" title="Delete zone">Delete</button>
        </div>
      </div>
    `).join('');

    // Bind load and delete events
    savedProjectsList.querySelectorAll('.btn-load-zone').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const zone = savedProjects.find(z => z.id === id);
        if (zone) {
          state.shape = zone.shape;
          state.unit = zone.unit || 'ft';
          state.rawDims = { ...(zone.rawDims || zone.dims) };
          state.materialId = zone.materialId;
          state.depthInches = zone.depthInches;
          state.wastePercent = zone.wastePercent;
          state.customDensity = zone.customDensity ?? null;
          state.isCompacted = Boolean(zone.isCompacted);
          if (zone.costRates && typeof zone.costRates === 'object') {
            [
              [costMaterialInput, zone.costRates.material],
              [costDeliveryInput, zone.costRates.delivery],
              [costLaborInput, zone.costRates.labor],
              [costFabricInput, zone.costRates.fabric],
              [costTaxInput, zone.costRates.tax]
            ].forEach(([input, value]) => {
              if (input && value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0) input.value = String(value);
            });
          }

          // Update UI
          shapeTabs.forEach(t => {
            const active = t.dataset.shape === state.shape;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
          });
          materialCards.forEach(c => {
            const active = c.dataset.material === state.materialId;
            c.classList.toggle('active', active);
            c.setAttribute('aria-checked', active ? 'true' : 'false');
          });
          unitButtons.forEach(b => {
            const active = b.dataset.unit === state.unit;
            b.classList.toggle('active', active);
            b.setAttribute('aria-checked', active ? 'true' : 'false');
          });
          wasteChips.forEach(c => {
            const active = parseInt(c.dataset.waste, 10) === state.wastePercent;
            c.classList.toggle('active', active);
            c.setAttribute('aria-checked', active ? 'true' : 'false');
          });
          if (depthSlider) depthSlider.value = state.depthInches;
          updateDepthDisplay();
          renderDimensionInputs(state.shape);
          updateGeotechUI();
          if (toggleCompaction) toggleCompaction.checked = state.isCompacted;
          recalculate();

          // Scroll smoothly to calculator
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    savedProjectsList.querySelectorAll('.btn-del-zone').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        savedProjects = savedProjects.filter(z => z.id !== id);
        persistAndRenderSaved();
      });
    });
  }

  /* ── Main Recalculation ── */
  function recalculate() {
    const dimensionErrors = validateDimensions();
    renderDimensionValidation(dimensionErrors);
    if (dimensionErrors.length) {
      renderInvalidResults();
      return;
    }

    const densityText = customDensityInput?.value.trim() || '';
    const densityValue = Number(densityText);
    const densityInvalid = densityText !== '' && (!customDensityInput.validity.valid || !Number.isFinite(densityValue) || densityValue < 500 || densityValue > 5000);
    if (densityInputError) densityInputError.style.display = densityInvalid ? 'block' : 'none';
    if (customDensityInput) customDensityInput.setAttribute('aria-invalid', densityInvalid ? 'true' : 'false');
    if (densityInvalid) {
      resultActionButtons.forEach(button => {
        if (!button) return;
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
      });
      renderInvalidResults('Correct the loose bulk density or clear it to use the planning factor.');
      return;
    }

    const dimsInFeet = getDimsInFeet();
    const material = getMaterialById(state.materialId);
    const result = RockEngine.calculate(state.shape, dimsInFeet, state.depthInches, material, state.wastePercent, {
      customDensity: state.customDensity,
      isCompacted: state.isCompacted
    });

    // Animate KPI updates with metric/imperial awareness
    const isMetric = state.unit === 'm';
    const areaVal = isMetric ? result.areaSqM : result.areaSqFt;
    const areaUnit = isMetric ? 'sq m' : 'sq ft';
    const volumeVal = isMetric ? result.volumeCuM : result.volumeCuYd;
    const volumeUnit = isMetric ? 'cu m' : 'cu yd';
    const weightVal = isMetric ? result.weightTonnes : result.weightTons;
    const weightUnit = isMetric ? 'tonnes' : 'tons';

    animateValue(kpiArea, areaVal, areaUnit);
    animateValue(kpiVolume, volumeVal, volumeUnit);
    animateValue(kpiWeight, weightVal, weightUnit);
    animateValue(kpiBags, result.bags, 'bags');

    // Update KPI unit labels and secondary subtexts
    if (kpiArea) {
      const u = kpiArea.querySelector('.kpi-unit');
      if (u) u.textContent = areaUnit;
      const s = document.getElementById('kpi-area-sub');
      if (s) s.textContent = isMetric ? `${RockEngine.formatNumber(result.areaSqFt)} sq ft` : `${RockEngine.formatNumber(result.areaSqM)} m²`;
    }
    if (kpiVolume) {
      const u = kpiVolume.querySelector('.kpi-unit');
      if (u) u.textContent = volumeUnit;
      const s = document.getElementById('kpi-volume-sub');
      if (s) s.textContent = isMetric ? `${RockEngine.formatNumber(result.volumeCuYd)} cu yd` : `${RockEngine.formatNumber(result.volumeCuM)} m³`;
    }
    if (kpiWeight) {
      const u = kpiWeight.querySelector('.kpi-unit');
      if (u) u.textContent = weightUnit;
      const s = document.getElementById('kpi-weight-sub');
      if (s) s.textContent = isMetric ? `${RockEngine.formatNumber(result.weightTons)} short tons` : `${RockEngine.formatNumber(result.weightTonnes)} tonnes`;
    }
    const bagsSub = document.getElementById('kpi-bags-sub');
    const bagsLabel = document.getElementById('kpi-bags-label');
    if (bagsLabel) bagsLabel.textContent = isMetric ? '0.5 cu ft (~14L) Bags' : '0.5 cu ft Bags';
    if (bagsSub) bagsSub.textContent = isMetric ? `~${Math.round(result.volumeCuM / 0.01416)} retail bags` : '54 bags per cubic yard';

    // Breakdown table with dual units
    if (breakdownBody) {
      const densityBadges = `${result.isCustomDensity ? ' <span style="color:#d97706;font-weight:600;font-size:0.75rem;">(Entered density)</span>' : ''}${result.isCompacted ? ' <span style="color:#10b981;font-weight:600;font-size:0.75rem;">(Base compaction allowance)</span>' : ''}`;
      breakdownBody.innerHTML = `
        <tr><td>Volume (cubic yards / m³)</td><td><strong>${RockEngine.formatNumber(result.volumeCuYd)} yd³</strong> &bull; ${RockEngine.formatNumber(result.volumeCuM)} m³</td></tr>
        <tr><td>Volume (cubic feet)</td><td>${RockEngine.formatNumber(result.volumeCuFt)} cu ft</td></tr>
        <tr><td>Weight (short tons / metric tonnes)</td><td><strong>${RockEngine.formatNumber(result.weightTons)} short tons</strong> &bull; ${RockEngine.formatNumber(result.weightTonnes)} tonnes</td></tr>
        <tr><td>Weight (lbs / kg)</td><td>${RockEngine.formatNumber(result.weightLbs)} lbs &bull; ${RockEngine.formatNumber(result.weightKg)} kg</td></tr>
        <tr><td>Bulk Density</td><td>${RockEngine.formatNumber(result.densityLbsPerCuYd)} lbs/yd³ (${result.densityLbsPerCuFt} lb/ft³ &bull; ${result.densityKgPerCuM} kg/m³)${densityBadges}</td></tr>
      `;
    }

    // Purchase grid
    if (purchaseGrid) {
      purchaseGrid.innerHTML = `
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4H16L18 8H6L8 4Z"/><rect x="6" y="8" width="12" height="12" rx="1"/></svg>
          <div class="purchase-value">${result.bags}</div>
          <div class="purchase-label">0.5 cu ft (~14L) Bags</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 6L8 2h8l4 4"/><line x1="12" y1="10" x2="12" y2="16"/></svg>
          <div class="purchase-value">${result.superSacks}</div>
          <div class="purchase-label">35 cu ft Reference Sacks (verify product size)</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="19" r="2"/><path d="M5 19H2V14L4 8H10"/><path d="M7 8V3H22V14H17"/></svg>
          <div class="purchase-value">${result.wheelbarrowLoads}</div>
          <div class="purchase-label">Wheelbarrow Loads (6 cu ft)</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 17L12 22L22 17"/><rect x="5" y="5" width="14" height="8" rx="2"/></svg>
          <div class="purchase-value">${result.dumpTruckLoads}</div>
          <div class="purchase-label">10 yd³ Reference Loads (confirm payload)</div>
        </div>
      `;
    }

    // Dynamic math explainer with user's exact inputs
    renderExplainer(result, state.shape, dimsInFeet, state.depthInches, state.wastePercent, material, state.isCompacted);
    updateRfqMessage();

    // Depth status warning
    if (depthStatus) {
      if (result.belowMinDepth) {
        depthStatus.className = 'depth-status danger';
        depthStatus.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          Depth is below this tool's ${result.minDepthInches}" suggested starting layer for ${result.materialName}
        `;
      } else {
        depthStatus.className = 'depth-status good';
        depthStatus.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          Depth meets this tool's suggested starting layer for ${result.materialName}
        `;
      }
    }

    // Advanced Cost & Service Estimator
    const matRate = nonNegativeInput(costMaterialInput, 55);
    const deliveryFee = nonNegativeInput(costDeliveryInput, 75);
    const laborRate = nonNegativeInput(costLaborInput, 35);
    const fabricCost = nonNegativeInput(costFabricInput, 40);
    const taxRate = nonNegativeInput(costTaxInput, 7.0);

    const materialCost = result.weightTons * matRate;
    const laborCost = result.weightTons * laborRate;
    const subtotal = materialCost + deliveryFee + laborCost + fabricCost;
    const salesTax = subtotal * (taxRate / 100);
    const grandTotal = subtotal + salesTax;

    if (costSummaryMaterial) costSummaryMaterial.textContent = `$${materialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (costSummaryDelivery) costSummaryDelivery.textContent = `$${deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (costSummaryLabor) costSummaryLabor.textContent = `$${laborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (costSummaryFabric) costSummaryFabric.textContent = `$${fabricCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (costSummaryTax) costSummaryTax.textContent = `$${salesTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (costTotal) costTotal.textContent = `$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Update 2D Blueprint with actual user inputs and active unit
    try {
      RockVisualizer.renderBlueprint('blueprint-container', state.shape, state.rawDims, state.unit);
    } catch (e) {
      console.warn('Blueprint render error:', e);
    }

    // Update 2D Cross Section
    try {
      RockVisualizer.renderCrossSection('cross-section-container', state.depthInches, material.swatchColor, material.name);
    } catch (e) {
      console.warn('Cross section render error:', e);
    }

    // Update Coverage Chart
    try {
      const chartData = RockEngine.coverageChartData(material, result.areaSqFt, 'area');
      RockVisualizer.renderCoverageChart('coverage-chart', chartData, state.depthInches);
    } catch (e) {
      console.warn('Chart render error:', e);
    }

    // Update 3D Scene with ACTUAL shape, dimensions, depth, and material!
    if (rockScene) {
      try {
        rockScene.updateScene({
          shape: state.shape,
          dims: dimsInFeet,
          depth: state.depthInches,
          material: material
        });
      } catch (e) {
        console.warn('3D scene update error:', e);
      }
    }
  }

  /* ── Animated Counter ── */
  function animateValue(element, target, suffix) {
    if (!element) return;

    const valueEl = element.querySelector('.kpi-value') || element;
    const animationToken = String(Number(valueEl.dataset.animationToken || 0) + 1);
    valueEl.dataset.animationToken = animationToken;
    const current = parseFloat(valueEl.textContent.replace(/,/g, '')) || 0;

    if (Math.abs(current - target) < 0.01) return;

    valueEl.classList.add('updating');
    setTimeout(() => valueEl.classList.remove('updating'), 300);

    const duration = 350;
    const startTime = performance.now();

    function update(now) {
      if (valueEl.dataset.animationToken !== animationToken) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

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

  /* ── Initial Startup ── */
  // Sync material card active state
  materialCards.forEach(card => {
    const isTarget = card.dataset.material === state.materialId;
    card.classList.toggle('active', isTarget);
    card.setAttribute('aria-checked', isTarget ? 'true' : 'false');
  });

  // Sync unit toggle
  unitButtons.forEach(btn => {
    const isTarget = btn.dataset.unit === state.unit;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-checked', isTarget ? 'true' : 'false');
  });

  // Sync depth controls
  if (depthSlider) {
    depthSlider.value = state.depthInches;
    depthSlider.setAttribute('aria-valuenow', state.depthInches);
    depthSlider.setAttribute('aria-valuetext', `${state.depthInches} inches`);
  }
  if (depthValue) depthValue.textContent = state.depthInches;
  depthPresets.forEach(preset => {
    const isActive = parseFloat(preset.dataset.depth) === state.depthInches;
    preset.classList.toggle('active', isActive);
    preset.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  // Sync waste toggle
  wasteChips.forEach(chip => {
    const isActive = parseInt(chip.dataset.waste, 10) === state.wastePercent;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });

  setShape(state.shape);
  updateGeotechUI();
  persistAndRenderSaved();
  recalculate();
});
