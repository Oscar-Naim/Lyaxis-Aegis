import type { AuditHistoryEntry } from './models.ts';

const SECRET_PATTERNS = [
  /(authorization\s*[:=]\s*(?:bearer\s+)?)[^\s,'"`]+/gi,
  /((?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?)[^\s,'"`]+/gi,
  /(-----BEGIN [A-Z ]+KEY-----)[\s\S]*?(-----END [A-Z ]+KEY-----)/g,
  /(gh[pousr]_[A-Za-z0-9_]{20,})/g,
];

export function redactSecrets(value: string): string {
  return SECRET_PATTERNS.reduce((text, pattern) => text.replace(pattern, '$1[REDACTED]'), value);
}

export function sanitizeAuditForPersistence(audit: AuditHistoryEntry): AuditHistoryEntry {
  return {
    ...audit,
    findings: audit.findings.map(finding => ({
      ...finding,
      reviewNote: finding.reviewNote ? redactSecrets(finding.reviewNote) : undefined,
      evidence: finding.evidence.map(evidence => ({ ...evidence, value: redactSecrets(evidence.value) })),
      remediation: {
        ...finding.remediation,
        originalSnippet: finding.remediation.originalSnippet
          ? redactSecrets(finding.remediation.originalSnippet)
          : undefined,
        remediatedSnippet: finding.remediation.remediatedSnippet
          ? redactSecrets(finding.remediation.remediatedSnippet)
          : undefined,
      },
    })),
  };
}
