/**
 * Export & Sharing Engine - rockcoveragecalculator.com
 * Quarry Spec Sheet, CSV Bill of Materials, URL state encoder, print handler.
 */

export const RockExporter = {

  exportToCSV(result) {
    const rows = [
      ['Rock Coverage Calculator - Bill of Materials'],
      ['Generated', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      [''],
      ['Parameter', 'Value'],
      ['Shape', result.shape],
      ['Material', result.materialName],
      ['Total Area', `${result.areaSqFt} sq ft`],
      ['Depth', `${result.depthInches} inches`],
      ['Order Allowance', `${result.wastePercent}%`],
      ['Loose Bulk Density', `${result.densityLbsPerCuYd} lbs/cu yd`],
      ['Density Basis', result.isCustomDensity ? 'Entered value' : 'Calculator planning factor'],
      ['Compactable Base Allowance', result.isCompacted ? `Yes (${result.compactionMultiplier}x)` : 'No'],
      [''],
      ['Measurement', 'Quantity'],
      ['Volume (cu ft)', result.volumeCuFt],
      ['Volume (cu yd)', result.volumeCuYd],
      ['Weight (lbs)', result.weightLbs],
      ['Weight (tons)', result.weightTons],
      [''],
      ['Purchasing', 'Quantity'],
      ['0.5 cu ft Bags', result.bags],
      ['35 cu ft Reference Sacks', result.superSacks],
      ['6 cu ft Reference Wheelbarrow Loads', result.wheelbarrowLoads],
      ['10 cu yd Reference Truck Loads', result.dumpTruckLoads],
    ];

    const csv = rows.map(row => row.map(value => {
      const cell = String(value ?? '');
      const safe = /^[\s]*[=+\-@]/.test(cell) ? `'${cell}` : cell;
      return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rock-coverage-${result.materialId}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  printQuarryTicket(result) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Quarry Order Spec Sheet - ${result.materialName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
  .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
  .ticket-header h1 { font-size: 22px; letter-spacing: -0.02em; }
  .ticket-header .site { font-size: 12px; color: #666; }
  .ticket-header .date { text-align: right; font-size: 12px; color: #666; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 0; font-size: 13px; border-bottom: 1px solid #eee; }
  td:last-child { text-align: right; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
  .highlight { background: #f5f5f5; padding: 16px; border-radius: 4px; text-align: center; margin-bottom: 24px; }
  .highlight .value { font-size: 32px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
  .highlight .label { font-size: 12px; color: #666; margin-top: 4px; }
  .footer { margin-top: 32px; border-top: 1px solid #ddd; padding-top: 16px; font-size: 10px; color: #999; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="ticket-header">
    <div>
      <h1>Quarry Order Spec Sheet</h1>
      <div class="site">rockcoveragecalculator.com</div>
    </div>
    <div class="date">
      ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
      ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>

  <div class="highlight">
    <div class="value">${result.volumeCuYd} cu yd</div>
    <div class="label">Estimated order volume with ${result.wastePercent}% extra allowance${result.isCompacted ? ` and ${result.compactionMultiplier}x compactable-base factor` : ''}</div>
  </div>

  <div class="section">
    <div class="section-title">Material Specification</div>
    <table>
      <tr><th scope="row">Material</th><td>${result.materialName}</td></tr>
      <tr><th scope="row">Loose Bulk Density</th><td>${result.densityLbsPerCuYd.toLocaleString()} lbs/cu yd (${result.isCustomDensity ? 'entered value' : 'planning factor'})</td></tr>
      <tr><th scope="row">Tons per Cubic Yard</th><td>${result.tonsPerCuYd}</td></tr>
      <tr><th scope="row">Suggested Starting Layer</th><td>${result.minDepthInches}"</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Project Dimensions</div>
    <table>
      <tr><th scope="row">Shape</th><td>${result.shape.charAt(0).toUpperCase() + result.shape.slice(1)}</td></tr>
      <tr><th scope="row">Total Coverage Area</th><td>${result.areaSqFt} sq ft</td></tr>
      <tr><th scope="row">Applied Depth</th><td>${result.depthInches}"</td></tr>
      <tr><th scope="row">Order Allowance</th><td>${result.wastePercent}%</td></tr>
      <tr><th scope="row">Compactable Base Allowance</th><td>${result.isCompacted ? `${result.compactionMultiplier}x` : 'None'}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Calculated Quantities</div>
    <table>
      <tr><th scope="row">Volume (cubic feet)</th><td>${result.volumeCuFt}</td></tr>
      <tr><th scope="row">Volume (cubic yards)</th><td>${result.volumeCuYd}</td></tr>
      <tr><th scope="row">Weight (lbs)</th><td>${result.weightLbs.toLocaleString()}</td></tr>
      <tr><th scope="row">Weight (tons)</th><td>${result.weightTons}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Purchasing Guide</div>
    <table>
      <tr><th scope="row">0.5 cu ft Bags</th><td>${result.bags}</td></tr>
      <tr><th scope="row">35 cu ft Reference Sacks</th><td>${result.superSacks}</td></tr>
      <tr><th scope="row">Wheelbarrow Loads (6 cu ft)</th><td>${result.wheelbarrowLoads}</td></tr>
      <tr><th scope="row">10 cu yd Reference Truck Loads</th><td>${result.dumpTruckLoads}</td></tr>
    </table>
  </div>

  <div class="footer">
    Generated by Rock Coverage Calculator &middot; rockcoveragecalculator.com &middot; Estimates only: confirm bag capacity, truck payload, and delivered weight with your supplier.
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  },

  encodeState(state) {
    try {
      const encoded = btoa(JSON.stringify(state));
      const url = new URL(window.location.href);
      url.searchParams.set('calc', encoded);
      return url.toString();
    } catch (e) {
      return window.location.href;
    }
  },

  decodeState() {
    try {
      const url = new URL(window.location.href);
      const encoded = url.searchParams.get('calc');
      if (!encoded) return null;
      return JSON.parse(atob(encoded));
    } catch (e) {
      return null;
    }
  },

  copyShareLink(state) {
    const url = this.encodeState(state);
    navigator.clipboard.writeText(url).then(() => {
      // Show brief confirmation (handled by app.js)
    }).catch(() => {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    });
  }
};
