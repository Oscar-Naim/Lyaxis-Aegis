import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { runAegisForensicScan } from './api-src/_shared/aegisEngine.ts';
import { parseGitHubUrl, fetchRepoMetadata } from './api-src/_shared/githubFetcher.ts';
import { generateMasterImplementationPlan, handleArchitectChat } from './api-src/_shared/lyaxisArchitect.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Fast GitHub info probe
app.get('/api/github/info', async (req, res) => {
  const url = (req.query.url as string) || '';
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return res.status(400).json({ error: 'URL de GitHub inválida. Formato: https://github.com/owner/repo' });
  }

  const meta = await fetchRepoMetadata(parsed.owner, parsed.repo);
  return res.json({ parsed, meta });
});

// Aegis Engine Forensic Scan endpoint
app.post('/api/scan', async (req, res) => {
  try {
    const { targetName, targetUrl, githubUrl, sourceCode, targetTypeHint } = req.body;
    const targetInput = githubUrl || targetUrl || targetName || '';

    const result = await runAegisForensicScan({
      targetInput,
      sourceCodeInput: sourceCode,
      targetTypeHint,
    });

    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/scan:', err);
    return res.status(500).json({ error: 'Error al ejecutar escaneo forense con Aegis Engine' });
  }
});

// LYAXIS Architect endpoints
app.post('/api/architect', (req, res) => {
  try {
    const { action, message, history, currentScanContext, platform } = req.body;

    if (action === 'chat' || message) {
      const response = handleArchitectChat({
        message,
        history,
        currentScanContext,
        platformTarget: platform
      });
      return res.json({ response });
    }

    const masterPlan = generateMasterImplementationPlan(currentScanContext || {}, platform || 'Next.js');
    return res.json({ masterPlan });
  } catch (err: any) {
    console.error('Error in /api/architect:', err);
    return res.status(500).json({ error: 'Error en LYAXIS Architect' });
  }
});

// Chat endpoint alias for LYAXIS Architect
app.post('/api/chat', (req, res) => {
  try {
    const { message, history, currentScanContext, platform } = req.body;
    const response = handleArchitectChat({
      message,
      history,
      currentScanContext,
      platformTarget: platform
    });
    return res.json({ response });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({ error: 'Error al comunicar con LYAXIS Architect' });
  }
});

// CI/CD Pipeline Simulator endpoint
app.post(['/api/pipeline', '/api/pipeline/simulate'], (req, res) => {
  const { branch = 'main', commitHash = '7a29e4f', author = 'dev-team@lyaxis.com', threshold = 'critical' } = req.body;
  const passed = threshold === 'permissive';

  const mockRun = {
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
          'Compiled 142 files in 380ms with 0 type errors.',
          'ESLint rules: 0 errors, 1 minor warning (unused import).'
        ]
      },
      {
        id: 'stage-2',
        name: 'Aegis Engine SAST & DAST Forensic Analysis',
        status: passed ? 'success' : 'failed',
        durationMs: 760,
        logs: [
          'Scanning AST and dependency vulnerability trees...',
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
            ? 'Compuerta aprobada en modo permisivo. Se notifica al equipo en Slack.'
            : 'Compuerta rechazada. Pull Request bloqueado para merge.'
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

  return res.json(mockRun);
});

// LYAXIS HARNESS: Sovereign Harness Endpoints
import { SQUADS, SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, HARNESS_METRICS } from './api-src/_shared/sovereignHarnessData.ts';
import { detectProject, injectSovereignHarness, runDoctor, simulateSwarmExecution } from './api-src/_shared/sovereignHarnessEngine.ts';

// Get status of target directory / current harness
app.get('/api/harness/status', (req, res) => {
  try {
    const targetPath = (req.query.path as string) || process.cwd();
    const info = detectProject(targetPath);
    return res.json({ info, metrics: HARNESS_METRICS });
  } catch (err: any) {
    console.error('Error in /api/harness/status:', err);
    return res.status(500).json({ error: 'Error al detectar estado del harness' });
  }
});

// Get complete catalog of 34 agents and 274 skills
app.get('/api/harness/catalog', (req, res) => {
  return res.json({
    squads: SQUADS,
    agents: SOVEREIGN_AGENTS,
    skills: SOVEREIGN_SKILLS,
    metrics: HARNESS_METRICS
  });
});

// 1-Click Sovereign Harness Injection
app.post('/api/harness/inject', (req, res) => {
  try {
    const { targetPath = '.', preset = 'full' } = req.body;
    const result = injectSovereignHarness(targetPath, preset);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/harness/inject:', err);
    return res.status(500).json({ error: err.message || 'Error al inyectar el harness' });
  }
});

// Real-Time Multi-Agent Swarm Simulation
app.post('/api/harness/simulate', async (req, res) => {
  try {
    const { prompt = 'Refactorizar módulo con TDD y verificar compuerta de seguridad' } = req.body;
    const result = await simulateSwarmExecution(prompt);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/harness/simulate:', err);
    return res.status(500).json({ error: 'Error al ejecutar simulación de enjambre' });
  }
});

// Diagnostic Doctor check
app.get('/api/harness/doctor', (req, res) => {
  try {
    const targetPath = (req.query.path as string) || process.cwd();
    const result = runDoctor(targetPath);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/harness/doctor:', err);
    return res.status(500).json({ error: 'Error en diagnóstico doctor' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LYAXIS AEGIS] Aegis Engine & LYAXIS Architect online at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
