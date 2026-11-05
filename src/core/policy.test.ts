import { describe, expect, it } from 'vitest';
import { DEFAULT_POLICY, type Finding } from './models.ts';
import { evaluatePolicy } from './policy.ts';

const finding = (severity: Finding['severity'], kind: Finding['kind'] = 'confirmed'): Finding => ({
  id: severity, ruleId: severity, kind, title: severity, category: 'security', severity, confidence: 'high', source: 'static_code_rule', summary: '', impact: '', evidence: [],
  remediation: { plainChecklist: [], explanation: '', verificationCommands: [] }, reviewStatus: 'open',
});

describe('evaluatePolicy', () => {
  it('blocks confirmed critical findings', () => {
    const result = evaluatePolicy([finding('critical')], 90, DEFAULT_POLICY);
    expect(result.passed).toBe(false);
    expect(result.reasons[0]).toContain('Críticas');
  });

  it('does not let recommendations block a gate', () => {
    expect(evaluatePolicy([finding('critical', 'recommendation')], 90, DEFAULT_POLICY).passed).toBe(true);
  });
});
