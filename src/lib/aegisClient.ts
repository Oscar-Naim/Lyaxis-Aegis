import { ScanResult, PipelineRun, MasterPlanStep } from '../types/index.ts';

export async function requestAegisScan(payload: {
  targetName?: string;
  targetUrl?: string;
  githubUrl?: string;
  sourceCode?: string;
  targetTypeHint?: 'url' | 'github' | 'code';
}): Promise<ScanResult> {
  const res = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Aegis Engine falló con estado HTTP ${res.status}`);
  }

  return await res.json();
}

export async function requestArchitectMasterPlan(payload: {
  currentScanContext: Partial<ScanResult>;
  platform: 'WordPress' | 'Next.js' | 'React' | 'Nginx' | 'Apache' | 'Cloudflare' | 'Vercel';
}): Promise<{ masterPlan: MasterPlanStep[] }> {
  const res = await fetch('/api/architect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Error al consultar LYAXIS Architect');
  }

  return await res.json();
}

export async function requestArchitectChat(payload: {
  message: string;
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  currentScanContext?: Partial<ScanResult>;
  platform?: string;
}): Promise<{ response: string }> {
  const res = await fetch('/api/architect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'chat', ...payload }),
  });

  if (!res.ok) {
    throw new Error('Error en el chat de LYAXIS Architect');
  }

  return await res.json();
}

export async function simulatePipelineRun(threshold: 'critical' | 'strict' | 'permissive'): Promise<PipelineRun> {
  const res = await fetch('/api/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threshold,
      branch: 'main',
      commitHash: '8b41e9c',
      author: 'dev-team@lyaxis.com'
    }),
  });

  if (!res.ok) {
    throw new Error('Error al simular pipeline');
  }

  return await res.json();
}

export async function fetchGitHubRepoInfo(url: string): Promise<any> {
  const res = await fetch(`/api/github/info?url=${encodeURIComponent(url)}`);
  if (!res.ok) return null;
  return await res.json();
}
