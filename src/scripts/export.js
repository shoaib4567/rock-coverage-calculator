/**
 * Export & Sharing Engine — rockcoveragecalculator.com
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
      ['Waste Factor', `${result.wastePercent}%`],
      [''],
      ['Measurement', 'Quantity'],
      ['Volume (cu ft)', result.volumeCuFt],
      ['Volume (cu yd)', result.volumeCuYd],
      ['Weight (lbs)', result.weightLbs],
      ['Weight (tons)', result.weightTons],
      [''],
      ['Purchasing', 'Quantity'],
      ['0.5 cu ft Bags', result.bags],
      ['Super Sacks (1 cu yd)', result.superSacks],
      ['Wheelbarrow Loads', result.wheelbarrowLoads],
      ['Dump Truck Loads (10 yd)', result.dumpTruckLoads],
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rock-coverage-${result.materialId}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  printQuarryTicket(result, dims) {
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
    <div class="label">Total Volume Required (with ${result.wastePercent}% waste)</div>
  </div>

  <div class="section">
    <div class="section-title">Material Specification</div>
    <table>
      <tr><td>Material</td><td>${result.materialName}</td></tr>
      <tr><td>Density</td><td>${result.densityLbsPerCuYd.toLocaleString()} lbs/cu yd</td></tr>
      <tr><td>Tons per Cubic Yard</td><td>${result.tonsPerCuYd}</td></tr>
      <tr><td>Minimum Recommended Depth</td><td>${result.minDepthInches}"</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Project Dimensions</div>
    <table>
      <tr><td>Shape</td><td>${result.shape.charAt(0).toUpperCase() + result.shape.slice(1)}</td></tr>
      <tr><td>Total Coverage Area</td><td>${result.areaSqFt} sq ft</td></tr>
      <tr><td>Applied Depth</td><td>${result.depthInches}"</td></tr>
      <tr><td>Waste / Settling Factor</td><td>${result.wastePercent}%</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Calculated Quantities</div>
    <table>
      <tr><td>Volume (cubic feet)</td><td>${result.volumeCuFt}</td></tr>
      <tr><td>Volume (cubic yards)</td><td>${result.volumeCuYd}</td></tr>
      <tr><td>Weight (lbs)</td><td>${result.weightLbs.toLocaleString()}</td></tr>
      <tr><td>Weight (tons)</td><td>${result.weightTons}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Purchasing Guide</div>
    <table>
      <tr><td>0.5 cu ft Bags</td><td>${result.bags}</td></tr>
      <tr><td>Super Sacks (1 cu yd / 35 cu ft)</td><td>${result.superSacks}</td></tr>
      <tr><td>Wheelbarrow Loads (6 cu ft)</td><td>${result.wheelbarrowLoads}</td></tr>
      <tr><td>Dump Truck Loads (10 cu yd)</td><td>${result.dumpTruckLoads}</td></tr>
    </table>
  </div>

  <div class="footer">
    Generated by Rock Coverage Calculator &middot; rockcoveragecalculator.com &middot; For estimation purposes only
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
