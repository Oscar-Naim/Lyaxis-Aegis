export type AuditSourceType = 'code' | 'github_public' | 'url';
export type FindingKind = 'confirmed' | 'recommendation';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Confidence = 'high' | 'medium' | 'low';
export type ReviewStatus = 'open' | 'reviewed' | 'resolved' | 'risk_accepted';

export interface Project {
  id: string;
  name: string;
  sourceType: AuditSourceType;
  sourceReference?: string;
  createdAt: string;
  updatedAt: string;
  latestAuditId?: string;
}

export interface AuditSource {
  type: AuditSourceType;
  displayName: string;
  url?: string;
  repository?: {
    owner: string;
    name: string;
    branch: string;
    filesScanned: string[];
  };
}

export interface AuditScope {
  scannedFiles?: number;
  scannedUrl?: string;
  checks: string[];
}

export interface AuditScore {
  overall: number;
  security: number;
  performance: number;
  privacySeo: number;
  methodology: 'deterministic-v1';
}

export interface Evidence {
  type: 'code' | 'http_header' | 'html_meta' | 'url' | 'metric';
  label: string;
  value: string;
  file?: string;
  startLine?: number;
  endLine?: number;
  url?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

export interface PatchArtifact {
  filePath: string;
  unifiedDiff: string;
  canDownload: boolean;
}

export interface Remediation {
  plainChecklist: ChecklistItem[];
  explanation: string;
  originalSnippet?: string;
  remediatedSnippet?: string;
  patch?: PatchArtifact;
  verificationCommands: string[];
}

export interface Finding {
  id: string;
  ruleId: string;
  kind: FindingKind;
  title: string;
  category: 'security' | 'performance' | 'seo' | 'privacy' | 'accessibility';
  severity: Severity;
  confidence: Confidence;
  source: 'static_code_rule' | 'github_public_repo' | 'passive_url_audit' | 'derived_recommendation';
  summary: string;
  technicalDetail?: string;
  impact: string;
  evidence: Evidence[];
  standards?: { cwe?: string; owasp?: string };
  remediation: Remediation;
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
}

export interface AuditMetric {
  id: string;
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'poor' | 'unknown';
  evidence?: Evidence[];
}

export interface PolicyConfig {
  id: string;
  name: string;
  failOn: Severity;
  thresholds: {
    maxCritical: number;
    maxHigh: number;
    minimumOverallScore: number;
  };
}

export interface PolicyEvaluation {
  passed: boolean;
  reasons: string[];
  counts: Record<Severity, number>;
}

export interface AuditHistoryEntry {
  id: string;
  projectId: string;
  timestamp: string;
  durationMs: number;
  source: AuditSource;
  scope: AuditScope;
  score: AuditScore;
  findings: Finding[];
  metrics: AuditMetric[];
  limitations: string[];
  policy: PolicyConfig;
}

export interface LocalStoreV1 {
  schemaVersion: 1;
  projects: Project[];
  audits: AuditHistoryEntry[];
  policies: PolicyConfig[];
}

export const DEFAULT_POLICY: PolicyConfig = {
  id: 'default-critical',
  name: 'Bloquear críticas',
  failOn: 'critical',
  thresholds: { maxCritical: 0, maxHigh: 2, minimumOverallScore: 65 },
};
