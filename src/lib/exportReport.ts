import { ScanResult } from '../types/index.ts';

export function printExecutiveReport(): void {
  window.print();
}

export function downloadReportHtml(scan: ScanResult): void {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Ejecutivo — LYAXIS AEGIS (${scan.targetName})</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #05070B; color: #f1f5f9; padding: 40px; margin: 0; }
    .header { border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 24px; font-weight: 800; color: #06b6d4; letter-spacing: 1px; }
    .scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .card { background: #0c121e; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 18px; }
    .score-val { font-size: 32px; font-weight: 800; font-family: monospace; color: #10b981; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table th, .table td { padding: 10px 12px; border-bottom: 1px solid #1e293b; text-align: left; }
    .badge-crit { color: #f43f5e; font-weight: bold; }
    .badge-high { color: #f59e0b; font-weight: bold; }
    .footer { margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">LYAXIS AEGIS · INFORME EJECUTIVO FORENSE</div>
      <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Auditoría Forense: ${scan.targetName} | ID: ${scan.scanId}</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #94a3b8;">
      Fecha: ${new Date(scan.timestamp).toLocaleString()}<br/>
      Motor: Aegis Engine v2.0 &amp; LYAXIS Architect
    </div>
  </div>

  <div class="scores">
    <div class="card">
      <div style="font-size: 12px; color: #94a3b8;">PUNTUACIÓN GLOBAL</div>
      <div class="score-val">${scan.overallScore}/100</div>
    </div>
    <div class="card">
      <div style="font-size: 12px; color: #94a3b8;">INMUNIDAD (SEGURIDAD)</div>
      <div class="score-val" style="color: ${scan.securityScore > 75 ? '#10b981' : '#f59e0b'};">${scan.securityScore}/100</div>
    </div>
    <div class="card">
      <div style="font-size: 12px; color: #94a3b8;">VELOCIDAD (RENDIMIENTO)</div>
      <div class="score-val" style="color: ${scan.performanceScore > 75 ? '#10b981' : '#06b6d4'};">${scan.performanceScore}/100</div>
    </div>
    <div class="card">
      <div style="font-size: 12px; color: #94a3b8;">SEO SOCIAL &amp; PRIVACIDAD</div>
      <div class="score-val" style="color: #8b5cf6;">${Math.round((scan.socialSeoScore + scan.privacyScore)/2)}/100</div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 25px;">
    <h3 style="margin-top: 0; color: #06b6d4;">Resumen Forense Ejecutivo</h3>
    <p style="line-height: 1.6; color: #cbd5e1;">${scan.summary}</p>
    <p style="line-height: 1.6; color: #94a3b8; font-style: italic;">Diagnóstico en Lenguaje Claro: ${scan.plainSummary}</p>
  </div>

  <div class="card" style="margin-bottom: 25px;">
    <h3 style="margin-top: 0; color: #f43f5e;">Vulnerabilidades &amp; Hallazgos de Inmunidad (${scan.issues.length})</h3>
    <table class="table">
      <thead>
        <tr style="color: #94a3b8;">
          <th>ID</th>
          <th>Severidad</th>
          <th>Título del Hallazgo</th>
          <th>CWE / Vector</th>
          <th>Ubicación</th>
        </tr>
      </thead>
      <tbody>
        ${scan.issues.map(iss => `
          <tr>
            <td style="font-family: monospace;">${iss.id}</td>
            <td class="${iss.severity === 'critical' ? 'badge-crit' : 'badge-high'}">${iss.severity.toUpperCase()}</td>
            <td><strong>${iss.title}</strong><br/><small style="color: #94a3b8;">${iss.plainSpanishExplanation}</small></td>
            <td style="font-family: monospace;">${iss.cwe || 'N/A'}</td>
            <td style="font-family: monospace; font-size: 12px;">${iss.fileLocation}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="card">
    <h3 style="margin-top: 0; color: #10b981;">Plan Maestro de Implementación — LYAXIS Architect</h3>
    <ol style="line-height: 1.8; color: #cbd5e1; padding-left: 20px;">
      ${scan.masterPlan.map(s => `
        <li>
          <strong>[${s.impactVsEffort}] ${s.title}</strong> (${s.platform})<br/>
          <span style="color: #94a3b8;">${s.description}</span>
        </li>
      `).join('')}
    </ol>
  </div>

  <div class="footer">
    Informe generado de forma 100% gratuita y abierta por LYAXIS LABS · Aegis Engine &amp; LYAXIS Architect.<br/>
    Sin intermediarios ni proveedores externos. Verificación criptográfica integral.
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte-Ejecutivo-LYAXIS-AEGIS-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
