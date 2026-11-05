import type { AuditHistoryEntry, Finding, PolicyConfig } from './models.ts';
import { evaluatePolicy } from './policy.ts';

export function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8'): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type: mime }));
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export function downloadPatch(finding: Finding): void {
  if (!finding.remediation.patch?.canDownload) return;
  downloadText(`${finding.ruleId}.patch`, finding.remediation.patch.unifiedDiff, 'text/x-diff;charset=utf-8');
}

export function workflowFor(kind: 'github' | 'gitlab' | 'precommit', policy: PolicyConfig): string {
  const gate = `--fail-on ${policy.failOn} --max-critical ${policy.thresholds.maxCritical} --max-high ${policy.thresholds.maxHigh} --min-score ${policy.thresholds.minimumOverallScore}`;
  if (kind === 'gitlab') return `stages:\n  - verify\n\naegis_audit:\n  stage: verify\n  image: node:20\n  script:\n    - npx lyaxis-aegis audit --source . --output aegis-result.json\n    - npx lyaxis-aegis gate --input aegis-result.json ${gate}\n`;
  if (kind === 'precommit') return `#!/bin/sh\n# .husky/pre-commit\nnpx lyaxis-aegis audit --source . --output aegis-result.json\nnpx lyaxis-aegis gate --input aegis-result.json ${gate}\n`;
  return `name: LYAXIS AEGIS Quality Gate\non:\n  pull_request:\n  push:\n    branches: [main]\n  workflow_dispatch:\n\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npx lyaxis-aegis audit --source . --output aegis-result.json\n      - run: npx lyaxis-aegis gate --input aegis-result.json ${gate}\n`;
}

export function reportHtml(audit: AuditHistoryEntry): string {
  const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character));
  const policy = evaluatePolicy(audit.findings, audit.score.overall, audit.policy);
  const findings = audit.findings.map(finding => `<article><p class="label">${escape(finding.severity)} · ${escape(finding.kind)} · ${escape(finding.confidence)}</p><h3>${escape(finding.title)}</h3><p>${escape(finding.summary)}</p><p><strong>Evidencia:</strong> ${escape(finding.evidence.map(item => item.value).join(' | '))}</p><p><strong>Estado:</strong> ${escape(finding.reviewStatus)}${finding.reviewNote ? ` — ${escape(finding.reviewNote)}` : ''}</p></article>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe AEGIS</title><style>body{font:15px system-ui;color:#172033;max-width:900px;margin:48px auto;padding:0 24px}h1{font-size:32px}article{border:1px solid #dbe2ea;border-radius:12px;padding:16px;margin:12px 0}.label{text-transform:uppercase;font-size:11px;color:#3b5bdb;font-weight:700}small{color:#64748b}</style></head><body><small>LYAXIS AEGIS · Informe local</small><h1>${escape(audit.source.displayName)}</h1><p>Fecha: ${escape(new Date(audit.timestamp).toLocaleString())}</p><p>Alcance: ${escape(audit.scope.checks.join(', '))}</p><h2>Puntaje ${audit.score.overall}/100</h2><p>Política: ${policy.passed ? 'Aprobada' : `Bloqueada — ${escape(policy.reasons.join('; '))}`}</p><h2>Hallazgos</h2>${findings}<h2>Limitaciones</h2><ul>${audit.limitations.map(item => `<li>${escape(item)}</li>`).join('')}</ul></body></html>`;
}
