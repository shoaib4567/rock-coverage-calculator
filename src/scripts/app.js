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

  // Saved Projects storage
  let savedProjects = [];
  try {
    const rawSaved = localStorage.getItem('rock_saved_projects');
    if (rawSaved) savedProjects = JSON.parse(rawSaved);
  } catch (e) {
    savedProjects = [];
  }

  // Restore multi-zone projects from URL hash if present
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#project=')) {
    try {
      const encoded = window.location.hash.replace('#project=', '');
      const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
      if (Array.isArray(decoded) && decoded.length > 0) {
        savedProjects = decoded;
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
                 placeholder="${c.placeholder}" step="any" min="0"
                 aria-label="${c.label} (${state.unit})"
                 autocomplete="off">
          <span class="unit-label">${state.unit}</span>
        </div>
      </div>
    `).join('');

    // Bind input events
    dimContainer.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const raw = parseFloat(e.target.value);
        if (!isNaN(raw) && raw >= 0) {
          state.rawDims[e.target.dataset.key] = raw;
          recalculate();
        }
      });
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
      const rangeText = mat.typicalRange ? ` (Regional range: ${mat.typicalRange[0].toLocaleString()}–${mat.typicalRange[1].toLocaleString()} lbs/yd³)` : '';
      densityHint.textContent = `Standard ASTM C29 loose density: ${mat.densityLbsPerCuYd.toLocaleString()} lbs/yd³${rangeText}`;
    }

    if (compactionGroup) {
      if (mat.isCompactable) {
        compactionGroup.style.display = 'block';
        if (compactionFactorText) {
          const pct = Math.round(((mat.compactionFactor || 1.15) - 1) * 100);
          compactionFactorText.textContent = `+${pct}% Proctor overage`;
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
      const val = parseFloat(customDensityInput.value);
      if (!isNaN(val) && val >= 500 && val <= 5000) {
        state.customDensity = val;
        if (btnResetDensity) btnResetDensity.style.display = 'inline-block';
      } else {
        state.customDensity = null;
        if (btnResetDensity) btnResetDensity.style.display = 'none';
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
      const dimsInFeet = getDimsInFeet();
      const material = getMaterialById(state.materialId);
      const result = RockEngine.calculate(state.shape, dimsInFeet, state.depthInches, material, state.wastePercent);
      RockExporter.printSpecSheet(result);
    });
  }

  if (btnCSV) {
    btnCSV.addEventListener('click', () => {
      const dimsInFeet = getDimsInFeet();
      const material = getMaterialById(state.materialId);
      const result = RockEngine.calculate(state.shape, dimsInFeet, state.depthInches, material, state.wastePercent);
      RockExporter.exportToCSV(result);
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
      const matRate = parseFloat(costMaterialInput?.value) || 55;
      const deliveryFee = parseFloat(costDeliveryInput?.value) || 75;
      const laborRate = parseFloat(costLaborInput?.value) || 35;
      const fabricCost = parseFloat(costFabricInput?.value) || 40;
      const taxRate = parseFloat(costTaxInput?.value) || 7.0;

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
      let csv = 'Zone Name,Shape,Material,Depth (in),Area (sq ft),Volume (cu yd),Weight (tons),Bags (0.5 cu ft),Estimated Cost,Date\n';
      savedProjects.forEach(z => {
        csv += `"${z.name}","${z.shape}","${z.materialName}",${z.depthInches},${z.areaSqFt},${z.volumeCuYd},${z.weightTons},${z.bags},"${z.totalCost.toFixed(2)}","${z.date}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rock_coverage_project_zones_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
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
            if (savedProjects.length > 0) {
              if (window.confirm(`Found ${imported.length} project zones in backup. Merge with existing zones? (Click Cancel to replace current list)`)) {
                savedProjects = [...savedProjects, ...imported];
              } else {
                savedProjects = imported;
              }
            } else {
              savedProjects = imported;
            }
            persistAndRenderSaved();
            alert(`Successfully loaded ${imported.length} project zone(s)!`);
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
          <div class="saved-zone-name">${z.name}</div>
          <div class="saved-zone-meta">${z.materialName} &bull; ${z.depthInches}" deep &bull; ${z.date}</div>
        </div>
        <div class="saved-zone-stats">
          <div class="saved-stat-badge">${z.areaSqFt.toFixed(0)} sq ft</div>
          <div class="saved-stat-badge">${z.weightTons.toFixed(2)} tons</div>
          <div class="saved-stat-badge">${z.volumeCuYd.toFixed(2)} yd³</div>
          <div class="saved-stat-badge">$${z.totalCost.toFixed(2)}</div>
        </div>
        <div class="saved-zone-actions">
          <button class="btn btn-secondary btn-sm btn-load-zone" data-id="${z.id}" title="Load zone into calculator">Load</button>
          <button class="btn btn-ghost btn-sm btn-del-zone" data-id="${z.id}" title="Delete zone">Delete</button>
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

          // Update UI
          shapeTabs.forEach(t => t.classList.toggle('active', t.dataset.shape === state.shape));
          materialCards.forEach(c => c.classList.toggle('active', c.dataset.material === state.materialId));
          unitButtons.forEach(b => b.classList.toggle('active', b.dataset.unit === state.unit));
          wasteChips.forEach(c => c.classList.toggle('active', parseInt(c.dataset.waste, 10) === state.wastePercent));
          if (depthSlider) depthSlider.value = state.depthInches;
          updateDepthDisplay();
          renderDimensionInputs(state.shape);
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
      const densityBadges = `${result.isCustomDensity ? ' <span style="color:#d97706;font-weight:600;font-size:0.75rem;">(Custom Quarry Override)</span>' : ''}${result.isCompacted ? ' <span style="color:#10b981;font-weight:600;font-size:0.75rem;">(Compacted In-Place)</span>' : ''}`;
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
          <div class="purchase-label">Super Sacks (~1 yd³ / 0.76 m³)</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="19" r="2"/><path d="M5 19H2V14L4 8H10"/><path d="M7 8V3H22V14H17"/></svg>
          <div class="purchase-value">${result.wheelbarrowLoads}</div>
          <div class="purchase-label">Wheelbarrow Loads (6 cu ft)</div>
        </div>
        <div class="purchase-card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 17L12 22L22 17"/><rect x="5" y="5" width="14" height="8" rx="2"/></svg>
          <div class="purchase-value">${result.dumpTruckLoads}</div>
          <div class="purchase-label">Dump Truck Loads (10 yd³)</div>
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

    // Advanced Cost & Service Estimator
    const matRate = parseFloat(costMaterialInput?.value) || 55;
    const deliveryFee = parseFloat(costDeliveryInput?.value) || 75;
    const laborRate = parseFloat(costLaborInput?.value) || 35;
    const fabricCost = parseFloat(costFabricInput?.value) || 40;
    const taxRate = parseFloat(costTaxInput?.value) || 7.0;

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
    const current = parseFloat(valueEl.textContent.replace(/,/g, '')) || 0;

    if (Math.abs(current - target) < 0.01) return;

    valueEl.classList.add('updating');
    setTimeout(() => valueEl.classList.remove('updating'), 300);

    const duration = 350;
    const startTime = performance.now();

    function update(now) {
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
