import type { PipelineRun } from '../src/types/index.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { branch = 'main', commitHash = '7a29e4f', author = 'dev-team@lyaxis.com', threshold = 'critical' } = body;

  const passed = threshold === 'permissive';

  const mockRun: PipelineRun = {
    runId: `run-${Date.now().toString(36)}`,
    commitHash: commitHash.slice(0, 7),
    branch,
    author,
    trigger: 'pull_request',
    timestamp: new Date().toISOString(),
    status: passed ? 'success' : 'failed',
    stages: [
      {
        id: 'stage-1',
        name: 'Lint & Strict Type Check',
        status: 'success',
        durationMs: 380,
        logs: [
          'Checking syntax and strict TypeScript types...',
          'Compiled 142 files in 380ms with 0 fatal errors.',
          'ESLint rules: 0 errors, 1 minor warning.'
        ]
      },
      {
        id: 'stage-2',
        name: 'Aegis Engine Forensic Analysis (SAST & DAST)',
        status: passed ? 'success' : 'failed',
        durationMs: 760,
        logs: [
          'Aegis Engine: Inspeccionando AST y dependencias...',
          '⚠️ ALERTA CRÍTICA: Concatenación SQL detectada en process.ts (CWE-89)',
          '⚠️ ALERTA CRÍTICA: Bypass criptográfico jwt.decode() (CWE-345)',
          passed
            ? 'Regla de política permisiva activa: Se permite continuar con advertencias.'
            : 'FALLO: Política estricta "Fail on Critical" violada. 2 incidencias críticas.'
        ]
      },
      {
        id: 'stage-3',
        name: 'Web Vitals & Performance Gate',
        status: 'success',
        durationMs: 580,
        logs: [
          'Ejecutando Lighthouse Headless & bundle inspector...',
          'LCP: 3.1s (Advertencia umbral > 2.5s)',
          'CLS: 0.04 (Aprobado)',
          'INP: 240ms (Aceptable bajo umbral de PR)',
          'Performance Score general: 71/100 (Umbral mínimo: 65).'
        ]
      },
      {
        id: 'stage-4',
        name: 'Quality Gate & Compliance Enforcer',
        status: passed ? 'success' : 'failed',
        durationMs: 190,
        logs: [
          passed
            ? 'Compuerta aprobada en modo permisivo. Se notifica al equipo de ingeniería.'
            : 'Compuerta rechazada. Pull Request bloqueado para merge por política Aegis.'
        ]
      }
    ],
    summary: {
      criticalCount: 2,
      highCount: 2,
      perfScore: 71,
      gatePassed: passed
    }
  };

  return res.status(200).json(mockRun);
}
