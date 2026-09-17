/**
 * 2D SVG Visualizer — rockcoveragecalculator.com
 * Generates live top-down scale blueprint and side-profile cross-section diagrams.
 */

export const RockVisualizer = {

  renderBlueprint(containerId, shape, dims, unit = 'ft') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const padding = 50;
    const maxW = container.clientWidth - padding * 2;
    const maxH = 280;

    container.innerHTML = '';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${maxW + padding * 2} ${maxH + padding * 2}`);
    svg.setAttribute('class', 'blueprint-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Top-down blueprint of ${shape} area`);

    // Grid
    this._drawGrid(svg, svgNS, maxW + padding * 2, maxH + padding * 2);

    // Shape
    switch (shape) {
      case 'rectangle':
        this._drawRect(svg, svgNS, dims, padding, maxW, maxH, unit);
        break;
      case 'circle':
        this._drawCircle(svg, svgNS, dims, padding, maxW, maxH, unit);
        break;
      case 'ring':
        this._drawRing(svg, svgNS, dims, padding, maxW, maxH, unit);
        break;
      case 'triangle':
        this._drawTriangle(svg, svgNS, dims, padding, maxW, maxH, unit);
        break;
      case 'trapezoid':
        this._drawTrapezoid(svg, svgNS, dims, padding, maxW, maxH, unit);
        break;
      case 'lshape':
        this._drawLShape(svg, svgNS, dims, padding, maxW, maxH, unit);
        break;
    }

    container.appendChild(svg);
  },

  _drawGrid(svg, ns, w, h) {
    const spacing = 20;
    for (let x = 0; x <= w; x += spacing) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', 0);
      line.setAttribute('x2', x);
      line.setAttribute('y2', h);
      line.setAttribute('class', 'grid-line');
      svg.appendChild(line);
    }
    for (let y = 0; y <= h; y += spacing) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', 0);
      line.setAttribute('y1', y);
      line.setAttribute('x2', w);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'grid-line');
      svg.appendChild(line);
    }
  },

  _scaleToFit(realW, realH, maxW, maxH) {
    const scale = Math.min(maxW / Math.max(realW, 1), maxH / Math.max(realH, 1), 20);
    return { w: realW * scale, h: realH * scale, scale };
  },

  _drawRect(svg, ns, dims, pad, maxW, maxH, unit) {
    const { w, h } = this._scaleToFit(dims.length || 10, dims.width || 10, maxW, maxH);
    const x = pad + (maxW - w) / 2;
    const y = pad + (maxH - h) / 2;

    // Rock-fill pattern
    const pattern = this._createRockPattern(svg, ns);

    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('fill', `url(#${pattern})`);
    rect.setAttribute('stroke', '#d4a853');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '8 4');
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    // Dimension annotations
    this._addDimLine(svg, ns, x, y + h + 20, x + w, y + h + 20, `${dims.length || 0} ${unit}`, 'horizontal');
    this._addDimLine(svg, ns, x + w + 20, y, x + w + 20, y + h, `${dims.width || 0} ${unit}`, 'vertical');
  },

  _drawCircle(svg, ns, dims, pad, maxW, maxH, unit) {
    const r = dims.radius || 5;
    const { w } = this._scaleToFit(r * 2, r * 2, maxW, maxH);
    const scaledR = w / 2;
    const cx = pad + maxW / 2;
    const cy = pad + maxH / 2;

    const pattern = this._createRockPattern(svg, ns);

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', scaledR);
    circle.setAttribute('fill', `url(#${pattern})`);
    circle.setAttribute('stroke', '#d4a853');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('stroke-dasharray', '8 4');
    svg.appendChild(circle);

    // Radius line
    this._addDimLine(svg, ns, cx, cy, cx + scaledR, cy, `r = ${r} ${unit}`, 'horizontal');
  },

  _drawRing(svg, ns, dims, pad, maxW, maxH, unit) {
    const or = dims.outerRadius || 8;
    const ir = dims.innerRadius || 4;
    const { scale } = this._scaleToFit(or * 2, or * 2, maxW, maxH);
    const cx = pad + maxW / 2;
    const cy = pad + maxH / 2;
    const scaledOR = or * scale;
    const scaledIR = ir * scale;

    const pattern = this._createRockPattern(svg, ns);

    // Outer circle
    const outer = document.createElementNS(ns, 'circle');
    outer.setAttribute('cx', cx);
    outer.setAttribute('cy', cy);
    outer.setAttribute('r', scaledOR);
    outer.setAttribute('fill', `url(#${pattern})`);
    outer.setAttribute('stroke', '#d4a853');
    outer.setAttribute('stroke-width', '2');
    outer.setAttribute('stroke-dasharray', '8 4');
    svg.appendChild(outer);

    // Inner cutout
    const inner = document.createElementNS(ns, 'circle');
    inner.setAttribute('cx', cx);
    inner.setAttribute('cy', cy);
    inner.setAttribute('r', scaledIR);
    inner.setAttribute('fill', '#141a21');
    inner.setAttribute('stroke', '#6b7a8d');
    inner.setAttribute('stroke-width', '1');
    inner.setAttribute('stroke-dasharray', '4 2');
    svg.appendChild(inner);

    this._addDimLine(svg, ns, cx, cy, cx + scaledOR, cy, `R = ${or} ${unit}`, 'horizontal');
    this._addDimLine(svg, ns, cx, cy + 15, cx + scaledIR, cy + 15, `r = ${ir} ${unit}`, 'horizontal');
  },

  _drawTriangle(svg, ns, dims, pad, maxW, maxH, unit) {
    const b = dims.base || 10;
    const h = dims.height || 8;
    const { w, h: sh } = this._scaleToFit(b, h, maxW, maxH);
    const x = pad + (maxW - w) / 2;
    const y = pad + (maxH - sh) / 2;

    const pattern = this._createRockPattern(svg, ns);

    const poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('points', `${x + w/2},${y} ${x},${y + sh} ${x + w},${y + sh}`);
    poly.setAttribute('fill', `url(#${pattern})`);
    poly.setAttribute('stroke', '#d4a853');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('stroke-dasharray', '8 4');
    svg.appendChild(poly);

    this._addDimLine(svg, ns, x, y + sh + 20, x + w, y + sh + 20, `${b} ${unit}`, 'horizontal');
    this._addDimLine(svg, ns, x + w + 20, y, x + w + 20, y + sh, `${h} ${unit}`, 'vertical');
  },

  _drawTrapezoid(svg, ns, dims, pad, maxW, maxH, unit) {
    const t = dims.top || 6;
    const b = dims.bottom || 12;
    const h = dims.height || 8;
    const maxDim = Math.max(t, b);
    const { w, h: sh, scale } = this._scaleToFit(maxDim, h, maxW, maxH);
    const x = pad + (maxW - w) / 2;
    const y = pad + (maxH - sh) / 2;
    const scaledT = t * scale;
    const offsetT = (w - scaledT) / 2;

    const pattern = this._createRockPattern(svg, ns);

    const poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('points', `${x + offsetT},${y} ${x + offsetT + scaledT},${y} ${x + w},${y + sh} ${x},${y + sh}`);
    poly.setAttribute('fill', `url(#${pattern})`);
    poly.setAttribute('stroke', '#d4a853');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('stroke-dasharray', '8 4');
    svg.appendChild(poly);

    this._addDimLine(svg, ns, x + offsetT, y - 20, x + offsetT + scaledT, y - 20, `${t} ${unit}`, 'horizontal');
    this._addDimLine(svg, ns, x, y + sh + 20, x + w, y + sh + 20, `${b} ${unit}`, 'horizontal');
  },

  _drawLShape(svg, ns, dims, pad, maxW, maxH, unit) {
    const l1 = dims.length1 || 12;
    const w1 = dims.width1 || 4;
    const l2 = dims.length2 || 6;
    const w2 = dims.width2 || 4;
    const totalW = Math.max(l1, l2 + w1);
    const totalH = w1 + w2;
    const { scale } = this._scaleToFit(totalW, totalH, maxW, maxH);
    const x = pad + (maxW - totalW * scale) / 2;
    const y = pad + (maxH - totalH * scale) / 2;

    const pattern = this._createRockPattern(svg, ns);

    const sL1 = l1 * scale;
    const sW1 = w1 * scale;
    const sL2 = l2 * scale;
    const sW2 = w2 * scale;

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M${x},${y} h${sL1} v${sW1} h${-(sL1 - sL2)} v${sW2} h${-sL2} Z`);
    path.setAttribute('fill', `url(#${pattern})`);
    path.setAttribute('stroke', '#d4a853');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '8 4');
    svg.appendChild(path);
  },

  _createRockPattern(svg, ns) {
    const id = 'rock-fill-' + Math.random().toString(36).substr(2, 6);
    const defs = document.createElementNS(ns, 'defs');
    const pattern = document.createElementNS(ns, 'pattern');
    pattern.setAttribute('id', id);
    pattern.setAttribute('width', '12');
    pattern.setAttribute('height', '12');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('width', '12');
    bg.setAttribute('height', '12');
    bg.setAttribute('fill', 'rgba(212,168,83,0.08)');
    pattern.appendChild(bg);

    // Small rock dots
    const positions = [[3,3],[9,7],[6,10],[1,8]];
    positions.forEach(([cx, cy]) => {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', '1');
      c.setAttribute('fill', 'rgba(212,168,83,0.15)');
      pattern.appendChild(c);
    });

    defs.appendChild(pattern);
    svg.appendChild(defs);
    return id;
  },

  _addDimLine(svg, ns, x1, y1, x2, y2, label, orientation) {
    const g = document.createElementNS(ns, 'g');

    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'dim-line');
    g.appendChild(line);

    // End caps
    [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(({ x, y }) => {
      const cap = document.createElementNS(ns, 'line');
      if (orientation === 'horizontal') {
        cap.setAttribute('x1', x);
        cap.setAttribute('y1', y - 5);
        cap.setAttribute('x2', x);
        cap.setAttribute('y2', y + 5);
      } else {
        cap.setAttribute('x1', x - 5);
        cap.setAttribute('y1', y);
        cap.setAttribute('x2', x + 5);
        cap.setAttribute('y2', y);
      }
      cap.setAttribute('class', 'dim-line');
      g.appendChild(cap);
    });

    const text = document.createElementNS(ns, 'text');
    text.setAttribute('class', 'dim-text');
    text.setAttribute('text-anchor', 'middle');
    if (orientation === 'horizontal') {
      text.setAttribute('x', (x1 + x2) / 2);
      text.setAttribute('y', y1 - 8);
    } else {
      text.setAttribute('x', x1 + 16);
      text.setAttribute('y', (y1 + y2) / 2 + 4);
      text.setAttribute('transform', `rotate(-90, ${x1 + 16}, ${(y1 + y2) / 2})`);
    }
    text.textContent = label;
    g.appendChild(text);

    svg.appendChild(g);
  },

  /* ── Cross-Section Diagram ── */

  renderCrossSection(containerId, depthInches, materialColor = '#8b9da8', materialName = 'Rock') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const w = container.clientWidth || 400;
    const h = 200;
    const maxDepthVis = 12; // inches max visual
    const depthRatio = Math.min(depthInches / maxDepthVis, 1);
    const rockH = depthRatio * 120; // max rock layer height
    const groundY = h - 30;
    const fabricY = groundY - 5;
    const rockTopY = fabricY - rockH;

    container.innerHTML = '';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('class', 'cross-section-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Side profile showing ${depthInches}" rock depth`);

    // Subgrade (ground)
    const subgrade = document.createElementNS(svgNS, 'rect');
    subgrade.setAttribute('x', 30);
    subgrade.setAttribute('y', groundY);
    subgrade.setAttribute('width', w - 60);
    subgrade.setAttribute('height', 30);
    subgrade.setAttribute('class', 'subgrade');
    subgrade.setAttribute('rx', '2');
    svg.appendChild(subgrade);

    // Subgrade label
    const sgLabel = document.createElementNS(svgNS, 'text');
    sgLabel.setAttribute('x', w / 2);
    sgLabel.setAttribute('y', groundY + 18);
    sgLabel.setAttribute('class', 'layer-label');
    sgLabel.setAttribute('text-anchor', 'middle');
    sgLabel.textContent = 'SUBGRADE';
    svg.appendChild(sgLabel);

    // Fabric layer
    const fabric = document.createElementNS(svgNS, 'line');
    fabric.setAttribute('x1', 30);
    fabric.setAttribute('y1', fabricY);
    fabric.setAttribute('x2', w - 30);
    fabric.setAttribute('y2', fabricY);
    fabric.setAttribute('class', 'fabric-layer');
    svg.appendChild(fabric);

    // Rock layer
    if (rockH > 2) {
      const rockLayer = document.createElementNS(svgNS, 'rect');
      rockLayer.setAttribute('x', 30);
      rockLayer.setAttribute('y', rockTopY);
      rockLayer.setAttribute('width', w - 60);
      rockLayer.setAttribute('height', rockH);
      rockLayer.setAttribute('fill', materialColor);
      rockLayer.setAttribute('opacity', '0.25');
      rockLayer.setAttribute('rx', '2');
      svg.appendChild(rockLayer);

      // Rock particles
      const particleCount = Math.min(Math.floor(rockH * 2), 40);
      for (let i = 0; i < particleCount; i++) {
        const px = 40 + Math.random() * (w - 80);
        const py = rockTopY + 5 + Math.random() * (rockH - 10);
        const pr = 2 + Math.random() * 4;
        const particle = document.createElementNS(svgNS, 'ellipse');
        particle.setAttribute('cx', px);
        particle.setAttribute('cy', py);
        particle.setAttribute('rx', pr);
        particle.setAttribute('ry', pr * 0.7);
        particle.setAttribute('transform', `rotate(${Math.random() * 360}, ${px}, ${py})`);
        particle.setAttribute('class', 'rock-particle');
        particle.setAttribute('fill', materialColor);
        particle.setAttribute('opacity', String(0.3 + Math.random() * 0.4));
        svg.appendChild(particle);
      }

      // Rock layer label
      const rlLabel = document.createElementNS(svgNS, 'text');
      rlLabel.setAttribute('x', w / 2);
      rlLabel.setAttribute('y', rockTopY + rockH / 2 + 4);
      rlLabel.setAttribute('class', 'layer-label');
      rlLabel.setAttribute('text-anchor', 'middle');
      rlLabel.textContent = materialName.toUpperCase();
      svg.appendChild(rlLabel);
    }

    // Depth ruler
    const rulerX = 18;
    const rulerLine = document.createElementNS(svgNS, 'line');
    rulerLine.setAttribute('x1', rulerX);
    rulerLine.setAttribute('y1', rockTopY);
    rulerLine.setAttribute('x2', rulerX);
    rulerLine.setAttribute('y2', fabricY);
    rulerLine.setAttribute('class', 'depth-ruler');
    svg.appendChild(rulerLine);

    // Ruler arrows
    [rockTopY, fabricY].forEach(yy => {
      const arrow = document.createElementNS(svgNS, 'line');
      arrow.setAttribute('x1', rulerX - 4);
      arrow.setAttribute('y1', yy);
      arrow.setAttribute('x2', rulerX + 4);
      arrow.setAttribute('y2', yy);
      arrow.setAttribute('class', 'depth-ruler');
      svg.appendChild(arrow);
    });

    // Depth label
    const depthLabel = document.createElementNS(svgNS, 'text');
    depthLabel.setAttribute('x', rulerX);
    depthLabel.setAttribute('y', rockTopY - 8);
    depthLabel.setAttribute('class', 'depth-label');
    depthLabel.setAttribute('text-anchor', 'middle');
    depthLabel.textContent = `${depthInches}"`;
    svg.appendChild(depthLabel);

    container.appendChild(svg);
  },

  /* ── Coverage Chart (canvas) ── */

  renderCoverageChart(canvasId, chartData, currentDepth) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    if (!chartData || chartData.length === 0) return;

    const maxCuYd = Math.max(...chartData.map(d => d.cuYd)) * 1.1;
    const maxDepth = Math.max(...chartData.map(d => d.depth));

    // Grid lines
    ctx.strokeStyle = 'rgba(107,122,141,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    gradient.addColorStop(0, 'rgba(212,168,83,0.2)');
    gradient.addColorStop(1, 'rgba(212,168,83,0)');

    ctx.beginPath();
    chartData.forEach((d, i) => {
      const x = pad.left + (d.depth / maxDepth) * plotW;
      const y = pad.top + plotH - (d.cuYd / maxCuYd) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const lastX = pad.left + (chartData[chartData.length - 1].depth / maxDepth) * plotW;
    ctx.lineTo(lastX, pad.top + plotH);
    ctx.lineTo(pad.left + (chartData[0].depth / maxDepth) * plotW, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    chartData.forEach((d, i) => {
      const x = pad.left + (d.depth / maxDepth) * plotW;
      const y = pad.top + plotH - (d.cuYd / maxCuYd) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#d4a853';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current depth marker
    if (currentDepth) {
      const cx = pad.left + (currentDepth / maxDepth) * plotW;
      const point = chartData.find(d => d.depth === currentDepth);
      if (point) {
        const cy = pad.top + plotH - (point.cuYd / maxCuYd) * plotH;

        // Pulsing circle
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#d4a853';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212,168,83,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Axes labels
    ctx.fillStyle = '#5a6a7d';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Depth (inches)', pad.left + plotW / 2, h - 4);

    ctx.save();
    ctx.translate(12, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Volume (cu yd)', 0, 0);
    ctx.restore();

    // Tick labels
    ctx.font = '9px JetBrains Mono, monospace';
    chartData.forEach(d => {
      const x = pad.left + (d.depth / maxDepth) * plotW;
      ctx.fillText(`${d.depth}"`, x, pad.top + plotH + 14);
    });

    for (let i = 0; i <= 4; i++) {
      const val = (maxCuYd / 4 * (4 - i)).toFixed(1);
      const y = pad.top + (plotH / 4) * i;
      ctx.textAlign = 'right';
      ctx.fillText(val, pad.left - 6, y + 3);
    }
  }
};
