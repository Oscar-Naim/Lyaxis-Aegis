import type { PerformanceIssue, ScanResult, SecurityIssue } from '../types/index.ts';
import type { AuditHistoryEntry, AuditSourceType, Finding, PolicyConfig, Project } from './models.ts';

function parseLineRange(value: string): { startLine?: number; endLine?: number } {
  const match = value.match(/(\d+)(?:\D+(\d+))?/);
  return match ? { startLine: Number(match[1]), endLine: match[2] ? Number(match[2]) : Number(match[1]) } : {};
}

function sourceFor(type: AuditSourceType): Finding['source'] {
  if (type === 'url') return 'passive_url_audit';
  return type === 'github_public' ? 'github_public_repo' : 'static_code_rule';
}

function categoryFor(issue: SecurityIssue | PerformanceIssue): Finding['category'] {
  if ('type' in issue) return 'performance';
  if (issue.category === 'social_seo') return 'seo';
  if (issue.category === 'accessibility_privacy') return 'accessibility';
  return 'security';
}

function isDirectUrlEvidence(issue: SecurityIssue | PerformanceIssue, sourceType: AuditSourceType): boolean {
  if (sourceType !== 'url') return true;
  return /cabecera|header|content-security|hsts|x-frame|permissions-policy|script|imágenes|metadatos|cookies/i.test(issue.title);
}

function toFinding(issue: SecurityIssue | PerformanceIssue, sourceType: AuditSourceType): Finding {
  const remediation = issue.remediation;
  const lineRange = parseLineRange(('lineRange' in issue ? issue.lineRange : issue.fileLocation) || '');
  const hasPatchContext = Boolean(
    sourceType === 'github_public' &&
    remediation.originalSnippet &&
    remediation.remediatedSnippet &&
    /[\w/-]+\.(?:ts|tsx|js|jsx|json|css|html|php|py)/i.test(issue.fileLocation),
  );
  const direct = isDirectUrlEvidence(issue, sourceType);
  return {
    id: crypto.randomUUID(),
    ruleId: issue.id,
    kind: direct ? 'confirmed' : 'recommendation',
    title: issue.title,
    category: categoryFor(issue),
    severity: issue.severity,
    confidence: direct ? 'high' : 'medium',
    source: sourceFor(sourceType),
    summary: issue.plainSpanishExplanation,
    technicalDetail: issue.description,
    impact: issue.impact,
    evidence: [{
      type: sourceType === 'url' ? 'url' : 'code',
      label: sourceType === 'url' ? 'Objetivo auditado' : 'Ubicación detectada',
      value: ('vulnerableSnippet' in issue ? issue.vulnerableSnippet : undefined) || issue.description,
      file: sourceType === 'url' ? undefined : issue.fileLocation,
      ...lineRange,
    }],
    standards: 'cwe' in issue ? { cwe: issue.cwe, owasp: issue.owaspTop10 } : undefined,
    remediation: {
      plainChecklist: [
        { id: 'understand', label: issue.plainSpanishFix },
        { id: 'verify', label: 'Comprueba el cambio antes de marcarlo como resuelto.' },
      ],
      explanation: remediation.explanation,
      originalSnippet: remediation.originalSnippet,
      remediatedSnippet: remediation.remediatedSnippet,
      verificationCommands: remediation.verificationTest ? ['Ejecuta la prueba de verificación incluida en el diff.'] : [],
      patch: hasPatchContext ? {
        filePath: issue.fileLocation.split(':')[0],
        unifiedDiff: `--- a/${issue.fileLocation.split(':')[0]}\n+++ b/${issue.fileLocation.split(':')[0]}\n@@\n-${remediation.originalSnippet}\n+${remediation.remediatedSnippet}`,
        canDownload: true,
      } : undefined,
    },
    reviewStatus: 'open',
  };
}

export function projectFromScan(scan: ScanResult): Project {
  const sourceType: AuditSourceType = scan.targetType === 'github' ? 'github_public' : scan.targetType;
  return {
    id: crypto.randomUUID(),
    name: scan.targetName,
    sourceType,
    sourceReference: scan.targetUrl || scan.repoDetails?.url,
    createdAt: scan.timestamp,
    updatedAt: scan.timestamp,
  };
}

export function auditFromScan(scan: ScanResult, projectId: string, policy: PolicyConfig): AuditHistoryEntry {
  const sourceType: AuditSourceType = scan.targetType === 'github' ? 'github_public' : scan.targetType;
  const findings = [...scan.issues, ...scan.performanceIssues].map(issue => toFinding(issue, sourceType));
  return {
    id: crypto.randomUUID(),
    projectId,
    timestamp: scan.timestamp,
    durationMs: scan.durationMs,
    source: {
      type: sourceType,
      displayName: scan.targetName,
      url: scan.targetUrl,
      repository: scan.repoDetails ? {
        owner: scan.repoDetails.owner,
        name: scan.repoDetails.repo,
        branch: scan.repoDetails.branch,
        filesScanned: scan.repoDetails.filesScanned,
      } : undefined,
    },
    scope: {
      scannedFiles: scan.repoDetails?.filesScanned.length,
      scannedUrl: scan.targetUrl,
      checks: sourceType === 'url'
        ? ['Cabeceras HTTP', 'Metadatos SEO/sociales', 'Señales de rendimiento pasivo']
        : ['Reglas estáticas de seguridad', 'Patrones de rendimiento', 'Metadatos de proyecto'],
    },
    score: {
      overall: scan.overallScore,
      security: scan.securityScore,
      performance: scan.performanceScore,
      privacySeo: Math.round((scan.privacyScore + scan.socialSeoScore) / 2),
      methodology: 'deterministic-v1',
    },
    findings,
    metrics: scan.metrics
      .filter(metric => sourceType === 'url' && metric.name === 'Time to First Byte (TTFB)')
      .map(metric => ({
      id: crypto.randomUUID(),
      label: metric.name,
      value: metric.value,
      status: metric.status === 'good' ? 'good' : metric.status === 'poor' ? 'poor' : 'warning',
      })),
    limitations: sourceType === 'url'
      ? ['La auditoría URL es pasiva: no ejecuta ataques, no inicia sesión y no comprueba infraestructura privada.']
      : ['El análisis estático revisa los archivos disponibles; no ejecuta la aplicación ni sustituye una revisión humana.'],
    policy,
  };
}
