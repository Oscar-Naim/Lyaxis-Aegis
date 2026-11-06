export interface SwarmSimulationStep {
  stepId: string;
  agentId: string;
  agentName: string;
  squadName: string;
  pillar: 'LYAXIS Architect' | 'Aegis Engine';
  status: 'pending' | 'running' | 'completed' | 'warning' | 'failed';
  action: string;
  output: string;
  timestamp: string;
  metrics?: {
    latencyMs: number;
    confidence: number;
    invariantsChecked: number;
  };
}

export interface SwarmSimulationResult {
  simulationId: string;
  taskPrompt: string;
  status: 'success' | 'warning' | 'failed';
  totalDurationMs: number;
  architectReport: string;
  aegisSecurityReport: string;
  verificationPassed: boolean;
  steps: SwarmSimulationStep[];
}

export interface HarnessStatusReport {
  path: string;
  name: string;
  isGitRepo: boolean;
  detectedLanguages: string[];
  detectedFrameworks: string[];
  packageManager?: string;
  hasHarness: boolean;
  harnessVersion?: string;
  hasConstitution: boolean;
  hasMemory: boolean;
  hasTools: boolean;
  activeAgentsCount: number;
}
