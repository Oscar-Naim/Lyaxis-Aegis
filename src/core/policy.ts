import type { Finding, PolicyConfig, PolicyEvaluation, Severity } from './models.ts';

const severities: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export function evaluatePolicy(findings: Finding[], score: number, policy: PolicyConfig): PolicyEvaluation {
  const actionable = findings.filter(finding => finding.kind === 'confirmed' && finding.reviewStatus !== 'risk_accepted');
  const counts = severities.reduce((result, severity) => {
    result[severity] = actionable.filter(finding => finding.severity === severity).length;
    return result;
  }, {} as Record<Severity, number>);
  const reasons: string[] = [];
  if (counts.critical > policy.thresholds.maxCritical) reasons.push(`Críticas: ${counts.critical}/${policy.thresholds.maxCritical}`);
  if (counts.high > policy.thresholds.maxHigh) reasons.push(`Altas: ${counts.high}/${policy.thresholds.maxHigh}`);
  if (score < policy.thresholds.minimumOverallScore) reasons.push(`Puntaje: ${score}/${policy.thresholds.minimumOverallScore}`);
  return { passed: reasons.length === 0, reasons, counts };
}
