export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AuditCategory = 
  | 'security'               // 🔴 Seguridad & Red (Inmunidad)
  | 'performance'            // 🟡 Rendimiento Extremo (Báscula de Megabytes)
  | 'social_seo'             // 🟣 Presencia Social & SEO Técnico
  | 'accessibility_privacy'; // 🟢 Accesibilidad (a11y) & Privacidad

export interface CodeRemediation {
  explanation: string;
  originalSnippet: string;
  remediatedSnippet: string;
  diffSummary: string;
  verificationTest?: string;
  nginxSnippet?: string;
  apacheSnippet?: string;
  cloudflareSnippet?: string;
  vercelSnippet?: string;
}

export interface SecurityIssue {
  id: string;
  title: string;
  severity: Severity;
  category: AuditCategory;
  cwe?: string;
  cvss?: number;
  owaspTop10?: string;
  fileLocation: string;
  lineRange: string;
  description: string;
  plainSpanishExplanation: string; // Zero jargon for Modo Humano
  plainSpanishFix: string;         // Plain Spanish direct action for Modo Humano
  impact: string;
  vulnerableSnippet: string;
  remediation: CodeRemediation;
  status: 'open' | 'investigating' | 'resolved' | 'suppressed';
  estimatedScoreImpact: number;    // Points gained when fixed (+3 to +18)
}

export interface PerformanceMetric {
  name: string;
  value: string;
  score: number; // 0-100
  status: 'good' | 'needs-improvement' | 'poor';
  recommendation: string;
  plainImpact: string;
}

export interface PerformanceIssue {
  id: string;
  title: string;
  severity: Severity;
  type: 'render-bottleneck' | 'bundle-bloat' | 'memory-leak' | 'network-waterfall' | 'blocking-script' | 'unoptimized-image' | 'render-blocking-font';
  description: string;
  plainSpanishExplanation: string;
  plainSpanishFix: string;
  fileLocation: string;
  impact: string;
  remediation: CodeRemediation;
  estimatedScoreImpact: number;
}

export interface ArchitectureRecommendation {
  id: string;
  domain: string;
  title: string;
  description: string;
  currentRisk: string;
  recommendedPattern: string;
  codeOrConfigExample: string;
  scalabilityImpact: string;
}

export interface MasterPlanStep {
  stepNumber: number;
  title: string;
  platform: 'WordPress' | 'Next.js' | 'React' | 'Nginx' | 'Apache' | 'Cloudflare' | 'Vercel' | 'General';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  impactVsEffort: 'Quick Win' | 'High Impact' | 'Strategic' | 'Maintenance';
  description: string;
  productionSafeNotes: string;
  codeOrConfig: string;
  verificationCommand: string;
  applied?: boolean;
}

export interface SocialCardData {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary_large_image' | 'summary';
  canonicalUrl: string;
  metaHtml: string;
  missingTags: string[];
}

export interface ComplianceAuditItem {
  standard: 'OWASP Top 10' | 'SOC 2' | 'GDPR' | 'PCI-DSS' | 'ISO 27001';
  rule: string;
  status: 'passed' | 'failed' | 'warning';
  notes: string;
}

export interface RepoDetails {
  owner: string;
  repo: string;
  url: string;
  branch: string;
  description?: string;
  language?: string;
  stars?: number;
  openIssues?: number;
  filesScanned: string[];
}

export interface ScanResult {
  scanId: string;
  targetName: string;
  targetUrl?: string;
  targetType: 'url' | 'github' | 'code';
  timestamp: string;
  durationMs: number;
  overallScore: number;       // 0-100
  securityScore: number;      // 0-100 (Inmunidad)
  performanceScore: number;   // 0-100 (Velocidad)
  architectureScore?: number; // 0-100 (LYAXIS Architect Score)
  socialSeoScore: number;     // 0-100 (Presencia Social / SEO)
  privacyScore: number;       // 0-100 (Accesibilidad / Privacidad)
  summary: string;
  plainSummary: string;       // Modo Humano summary
  issues: SecurityIssue[];
  performanceIssues: PerformanceIssue[];
  metrics: PerformanceMetric[];
  architectureRecommendations: ArchitectureRecommendation[];
  masterPlan: MasterPlanStep[]; // LYAXIS Architect roadmap
  socialCardData: SocialCardData;
  complianceAudits: ComplianceAuditItem[];
  ciStatus: {
    passed: boolean;
    failReason?: string;
    thresholdPolicy: string;
  };
  repoDetails?: RepoDetails;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  durationMs?: number;
  logs: string[];
}

export interface PipelineRun {
  runId: string;
  commitHash: string;
  branch: string;
  author: string;
  trigger: 'pull_request' | 'push' | 'manual' | 'sentinel';
  timestamp: string;
  status: 'success' | 'failed' | 'running';
  stages: PipelineStage[];
  summary: {
    criticalCount: number;
    highCount: number;
    perfScore: number;
    gatePassed: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  codeBlock?: {
    language: string;
    code: string;
    caption?: string;
  };
}

export interface SentinelConfig {
  target: string;
  frequency: 'daily' | 'weekly' | 'on_push';
  alertThreshold: 'critical' | 'strict' | 'permissive';
  notifyWebhook?: string;
}
