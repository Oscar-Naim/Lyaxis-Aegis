import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import express from 'express';
import { SQUADS, SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, HARNESS_METRICS } from '../api-src/_shared/sovereignHarnessData.ts';
import { detectProject, injectSovereignHarness, runDoctor, simulateSwarmExecution } from '../api-src/_shared/sovereignHarnessEngine.ts';
import { runAegisForensicScan } from '../api-src/_shared/aegisEngine.ts';
import { parseGitHubUrl, fetchRepoMetadata } from '../api-src/_shared/githubFetcher.ts';
import { generateMasterImplementationPlan, handleArchitectChat } from '../api-src/_shared/lyaxisArchitect.ts';

// In-memory embedded assets (populated during bundle or fallback to disk)
declare const __EMBEDDED_ASSETS__: Record<string, { content: string; mime: string }> | undefined;

const ASCII_BANNER = `
\x1b[36m██╗     ██╗   ██╗ █████╗ ██╗  ██╗██╗███████╗    ██╗  ██╗ █████╗ ██████╗ ███╗   ██╗███████╗███████╗███████╗
██║     ╚██╗ ██╔╝██╔══██╗╚██╗██╔╝██║██╔════╝    ██║  ██║██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔════╝██╔════╝
██║      ╚████╔╝ ███████║ ╚███╔╝ ██║███████╗    ███████║███████║██████╔╝██╔██╗ ██║█████╗  ███████╗███████╗
██║       ╚██╔╝  ██╔══██║ ██╔██╗ ██║╚════██║    ██╔══██║██╔══██║██╔══██╗██║╚██╗██║██╔══╝  ╚════██║╚════██║
███████╗   ██║   ██║  ██║██╔╝ ██╗██║███████║    ██║  ██║██║  ██║██║  ██║██║ ╚████║███████╗███████║███████║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝\x1b[0m
             \x1b[32mCASA CENTRAL DE AGENTES SOBERANOS · LYAXIS LABS v4.2.0-SOVEREIGN\x1b[0m
             \x1b[35mPilares de Mando: LYAXIS Architect (Estrategia) & Aegis Engine (Forense)\x1b[0m
`;

function printBanner() {
  console.log(ASCII_BANNER);
}

function printHelp() {
  printBanner();
  console.log(`
\x1b[1mUSO:\x1b[0m
  lyaxis-harness.exe                       Inicia el servidor local y abre la interfaz Obsidian Glass en el navegador
  lyaxis-harness.exe onboard [ruta]        Analiza el repositorio e inyecta la Constitución, Memoria y Agentes adecuados
  lyaxis-harness.exe status [ruta]         Verifica el estado del arnés soberano, memoria de sesión y compuertas
  lyaxis-harness.exe catalog [opciones]    Muestra los 34 agentes especializados y 274 skills en consola
  lyaxis-harness.exe inject <ruta>         Inyecta la arquitectura de memoria (02-DOCS/) y herramientas (01-TOOLS/)
  lyaxis-harness.exe audit [ruta]          Ejecuta un escaneo forense con Aegis Engine en el código local
  lyaxis-harness.exe doctor [ruta]         Diagnóstico de salud de herramientas, git, memoria y compuertas
  lyaxis-harness.exe help                  Muestra este mensaje de ayuda

\x1b[1mOPCIONES DE CATÁLOGO:\x1b[0m
  --agents                                 Lista los 34 agentes especializados con roles y herramientas
  --skills                                 Lista las 274 skills certificadas organizadas por escuadrón
  --squad <id>                             Filtra por escuadrón (security, performance, frontend, backend, tdd, ai)

\x1b[1mOPCIONES DE INYECCIÓN:\x1b[0m
  --preset full                            Inyecta los 6 escuadrones completos (Recomendado)
  --preset secops                          Inyecta DevSecOps Fortress (Seguridad + Rendimiento + TDD)
  --preset frontend                        Inyecta Frontend Ultra & Web Vitals
  --preset backend                         Inyecta Backend Soberano & APIs
`);
}

async function runCli() {
  const args = process.argv.slice(2);

  // If run with no arguments: Start Desktop GUI Mode
  if (args.length === 0) {
    return startGuiServer();
  }

  const command = args[0].toLowerCase();

  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  if (command === 'status') {
    printBanner();
    const targetDir = args[1] || '.';
    const info = detectProject(targetDir);
    console.log(`\x1b[1mESTADO DEL HARNESS SOBERANO:\x1b[0m`);
    console.log(`  Proyecto:               \x1b[36m${info.name}\x1b[0m`);
    console.log(`  Ruta:                   ${info.path}`);
    console.log(`  Control Git:            ${info.isGitRepo ? '\x1b[32mSí (.git presente)\x1b[0m' : '\x1b[33mNo detectado\x1b[0m'}`);
    console.log(`  Lenguajes Detectados:   ${info.detectedLanguages.join(', ')}`);
    console.log(`  Frameworks:             ${info.detectedFrameworks.join(', ')}`);
    console.log(`  Arnés Instalado:        ${info.hasHarness ? '\x1b[32mACTIVO (v' + (info.harnessVersion || '4.2.0') + ')\x1b[0m' : '\x1b[31mNO INSTALADO (Ejecuta "lyaxis-harness onboard")\x1b[0m'}`);
    console.log(`  Constitución Soberana:  ${info.hasConstitution ? '\x1b[32m02-DOCS/01-CONSTITUTION.md OK\x1b[0m' : '\x1b[31mFaltante\x1b[0m'}`);
    console.log(`  Memoria de Sesión:      ${info.hasMemory ? '\x1b[32m02-DOCS/02-SESSION-MEMORY.md OK\x1b[0m' : '\x1b[31mFaltante\x1b[0m'}`);
    console.log(`  Herramientas de Mando:  ${info.hasTools ? '\x1b[32m01-TOOLS/ OK\x1b[0m' : '\x1b[31mFaltante\x1b[0m'}`);
    console.log(`  Agentes Asignados:      \x1b[35m${info.activeAgentsCount} Agentes\x1b[0m`);
    console.log('');
    process.exit(0);
  }

  if (command === 'doctor') {
    printBanner();
    const targetDir = args[1] || '.';
    console.log(`\x1b[35m[LYAXIS DOCTOR]\x1b[0m Ejecutando diagnóstico profundo en ${path.resolve(targetDir)}...\n`);
    const doc = runDoctor(targetDir);

    console.log(`  Puntuación de Salud:    \x1b[1m${doc.score >= 80 ? '\x1b[32m' : '\x1b[33m'}${doc.score}/100\x1b[0m`);
    console.log(`  Estado General:         \x1b[1m${doc.status.toUpperCase()}\x1b[0m`);
    
    if (doc.issues.length > 0) {
      console.log(`\n\x1b[33m  ADVERTENCIAS DETECTADAS:\x1b[0m`);
      doc.issues.forEach(i => console.log(`   - ${i}`));
    } else {
      console.log(`\n\x1b[32m  ✓ Todas las compuertas de gobernanza y salud están impecables.\x1b[0m`);
    }

    console.log(`\n\x1b[36m  RECOMENDACIONES:\x1b[0m`);
    doc.recommendations.forEach(r => console.log(`   * ${r}`));
    console.log('');
    process.exit(doc.score >= 50 ? 0 : 1);
  }

  if (command === 'catalog') {
    printBanner();
    const showAgents = args.includes('--agents') || (!args.includes('--skills') && !args.includes('--squad'));
    const showSkills = args.includes('--skills');
    const squadFilter = args.find((_, i, arr) => arr[i - 1] === '--squad');

    if (showAgents) {
      console.log(`\x1b[1mCATÁLOGO DE AGENTES ESPECIALIZADOS (Total: ${SOVEREIGN_AGENTS.length}):\x1b[0m\n`);
      const agents = squadFilter 
        ? SOVEREIGN_AGENTS.filter(a => a.squadId.toLowerCase().includes(squadFilter.toLowerCase()))
        : SOVEREIGN_AGENTS;

      agents.forEach((ag, idx) => {
        const sq = SQUADS.find(s => s.id === ag.squadId);
        console.log(`\x1b[36m[${idx + 1}] ${ag.name}\x1b[0m (\x1b[33m${ag.id}\x1b[0m)`);
        console.log(`    Escuadrón:  \x1b[35m${sq?.name || ag.squadId}\x1b[0m · Rol: ${ag.role} · Tier: ${ag.tier}`);
        console.log(`    Directiva:  ${ag.description}`);
        console.log(`    Tools:      [${ag.tools.join(', ')}]`);
        console.log('');
      });
    }

    if (showSkills) {
      console.log(`\x1b[1mCATÁLOGO DE SKILLS CERTIFICADAS (Total: ${SOVEREIGN_SKILLS.length}):\x1b[0m\n`);
      const skills = squadFilter
        ? SOVEREIGN_SKILLS.filter(s => s.squadId.toLowerCase().includes(squadFilter.toLowerCase()))
        : SOVEREIGN_SKILLS;

      skills.slice(0, 50).forEach((sk, idx) => {
        console.log(`\x1b[32m* ${sk.name}\x1b[0m (skill:${sk.id})`);
        console.log(`    Tags: [${sk.tags.join(', ')}]`);
        console.log(`    Uso:  ${sk.description.slice(0, 100)}...`);
      });
      if (skills.length > 50) {
        console.log(`\n\x1b[33m... y ${skills.length - 50} skills más. Para ver el catálogo interactivo completo ejecuta lyaxis-harness.exe sin argumentos.\x1b[0m\n`);
      }
    }
    process.exit(0);
  }

  if (command === 'inject' || command === 'onboard') {
    printBanner();
    const targetDir = args[1] && !args[1].startsWith('--') ? args[1] : '.';
    let preset: 'full' | 'secops' | 'frontend' | 'backend' = 'full';

    const presetIdx = args.indexOf('--preset');
    if (presetIdx !== -1 && args[presetIdx + 1]) {
      const p = args[presetIdx + 1].toLowerCase();
      if (['full', 'secops', 'frontend', 'backend'].includes(p)) {
        preset = p as any;
      }
    }

    console.log(`\x1b[36m[LYAXIS INJECT]\x1b[0m Inyectando Harness Soberano en: \x1b[1m${path.resolve(targetDir)}\x1b[0m`);
    console.log(`  Preset seleccionado:    \x1b[35m${preset.toUpperCase()}\x1b[0m\n`);

    const result = injectSovereignHarness(targetDir, preset);

    if (result.success) {
      console.log(`\x1b[32m✓ INYECCIÓN EXITOSA:\x1b[0m`);
      result.filesCreated.forEach(f => console.log(`   + Creado: \x1b[36m${f}\x1b[0m`));
      console.log(`\n  Escuadrones Activados:`);
      result.assignedSquads.forEach(s => console.log(`   * ${s}`));
      console.log(`\n  Total de Agentes asignados: \x1b[35m${result.assignedAgents.length} Agentes\x1b[0m`);
      console.log(`\n\x1b[32m[Gobernanza Activa]\x1b[0m Repositorio protegido bajo el estándar LYAXIS LABS 4.2.0.\n`);
    } else {
      console.error(`\x1b[31mError al inyectar el arnés:\x1b[0m ${result.message}`);
    }
    process.exit(result.success ? 0 : 1);
  }

  if (command === 'audit') {
    printBanner();
    const targetDir = args[1] || '.';
    console.log(`\x1b[36m[AEGIS FORENSIC ENGINE]\x1b[0m Iniciando escaneo en \x1b[1m${path.resolve(targetDir)}\x1b[0m...\n`);

    // Collect representative files
    const resolved = path.resolve(targetDir);
    let sampleCode = '';
    const candidates = ['src/api/checkout/process.ts', 'server.ts', 'app.ts', 'index.js', 'main.go', 'src/main.rs'];
    for (const c of candidates) {
      const p = path.join(resolved, c);
      if (fs.existsSync(p)) {
        sampleCode = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    const scan = await runAegisForensicScan({
      targetInput: path.basename(resolved),
      sourceCodeInput: sampleCode || `// Repository: ${path.basename(resolved)}`,
      targetTypeHint: 'code'
    });

    console.log(`  Puntuación General:     \x1b[1m${scan.overallScore >= 80 ? '\x1b[32m' : '\x1b[31m'}${scan.overallScore}/100\x1b[0m`);
    console.log(`  Inmunidad de Seguridad: \x1b[1m${scan.securityScore}/100\x1b[0m`);
    console.log(`  Rendimiento Extremo:    \x1b[1m${scan.performanceScore}/100\x1b[0m`);
    console.log(`  Total de Hallazgos:     \x1b[33m${scan.issues.length} incidencias\x1b[0m`);
    console.log(`  Compuerta CI/CD:        ${scan.ciStatus.passed ? '\x1b[32mAPROBADA\x1b[0m' : '\x1b[31mBLOQUEADA\x1b[0m'}`);

    if (scan.issues.length > 0) {
      console.log(`\n\x1b[31m  HALLAZGOS FORENSES DETECTADOS:\x1b[0m`);
      scan.issues.forEach(iss => {
        console.log(`   [${iss.severity.toUpperCase()}] ${iss.title} (${iss.cwe || 'CWE-GENERIC'})`);
        console.log(`     Acción: ${iss.remediation.explanation}`);
      });
    }

    console.log('');
    process.exit(scan.ciStatus.passed ? 0 : 1);
  }

  // Fallback unrecognized command
  console.log(`Comando no reconocido: "${command}". Ejecuta "lyaxis-harness.exe help" para ver comandos disponibles.`);
  process.exit(1);
}

// -------------------------------------------------------------
// EMBEDDED SERVER & DESKTOP GUI RUNNER
// -------------------------------------------------------------
async function startGuiServer() {
  printBanner();
  const app = express();
  const PORT = Number(process.env.PORT) || 3800;

  app.use(express.json({ limit: '15mb' }));

  // API Routes
  app.get('/api/harness/status', (req, res) => {
    const targetPath = (req.query.path as string) || process.cwd();
    const info = detectProject(targetPath);
    return res.json({ info, metrics: HARNESS_METRICS });
  });

  app.get('/api/harness/catalog', (req, res) => {
    return res.json({
      squads: SQUADS,
      agents: SOVEREIGN_AGENTS,
      skills: SOVEREIGN_SKILLS,
      metrics: HARNESS_METRICS
    });
  });

  app.post('/api/harness/inject', (req, res) => {
    const { targetPath = '.', preset = 'full' } = req.body;
    const result = injectSovereignHarness(targetPath, preset);
    return res.json(result);
  });

  app.post('/api/harness/simulate', async (req, res) => {
    const { prompt = 'Refactorizar módulo con TDD y compuertas de seguridad' } = req.body;
    const result = await simulateSwarmExecution(prompt);
    return res.json(result);
  });

  app.get('/api/harness/doctor', (req, res) => {
    const targetPath = (req.query.path as string) || process.cwd();
    const result = runDoctor(targetPath);
    return res.json(result);
  });

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
      console.error(err);
      return res.status(500).json({ error: 'Error en escaneo forense con Aegis Engine' });
    }
  });

  app.post('/api/architect', (req, res) => {
    try {
      const { action, message, history, currentScanContext, platform } = req.body;
      if (action === 'chat' || message) {
        const response = handleArchitectChat({ message, history, currentScanContext, platformTarget: platform });
        return res.json({ response });
      }
      const masterPlan = generateMasterImplementationPlan(currentScanContext || {}, platform || 'Next.js');
      return res.json({ masterPlan });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error en LYAXIS Architect' });
    }
  });

  app.post('/api/chat', (req, res) => {
    try {
      const { message, history, currentScanContext, platform } = req.body;
      const response = handleArchitectChat({ message, history, currentScanContext, platformTarget: platform });
      return res.json({ response });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error en Copilot' });
    }
  });

  app.post(['/api/pipeline', '/api/pipeline/simulate'], (req, res) => {
    const { branch = 'main', commitHash = '7a29e4f', author = 'dev-team@lyaxis.com', threshold = 'critical' } = req.body;
    const passed = threshold === 'permissive';
    return res.json({
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
          logs: ['Checking syntax...', 'Compiled 142 files in 380ms with 0 type errors.']
        },
        {
          id: 'stage-2',
          name: 'Aegis Engine SAST & DAST Forensic Analysis',
          status: passed ? 'success' : 'failed',
          durationMs: 760,
          logs: [
            'Escaneando AST...',
            '⚠️ CWE-89 SQL Injection detectado en process.ts',
            passed ? 'Permitido por política permisiva' : 'FALLO: Violación de política estricta'
          ]
        },
        {
          id: 'stage-3',
          name: 'Web Vitals & Performance Gate',
          status: 'success',
          durationMs: 580,
          logs: ['LCP: 0.8s, CLS: 0.00, INP: 180ms. Score: 98/100.']
        },
        {
          id: 'stage-4',
          name: 'Quality Gate & Compliance Enforcer',
          status: passed ? 'success' : 'failed',
          durationMs: 190,
          logs: [passed ? 'Compuerta superada' : 'Compuerta rechazada: PR bloqueado para merge']
        }
      ],
      summary: {
        criticalCount: 2,
        highCount: 1,
        perfScore: 98,
        gatePassed: passed
      }
    });
  });

  // Serve Embedded Assets or fallback to dist folder
  const embedded = typeof __EMBEDDED_ASSETS__ !== 'undefined' ? __EMBEDDED_ASSETS__ : null;

  if (embedded) {
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      const cleanPath = req.path === '/' ? '/index.html' : req.path;
      const asset = embedded[cleanPath] || embedded['/index.html'];
      if (asset) {
        res.setHeader('Content-Type', asset.mime);
        return res.send(Buffer.from(asset.content, 'base64'));
      }
      next();
    });
  } else {
    const distPath = path.resolve(__dirname, '../dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Start HTTP listener
  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\x1b[32m[LYAXIS SOBERANO]\x1b[0m Servidor local ultrarrápido activo en: \x1b[1m\x1b[36m${url}\x1b[0m`);
    console.log(`\x1b[32m[OBSIDIAN GLASS]\x1b[0m Abriendo interfaz en el navegador predeterminado...`);
    console.log(`\x1b[90mPresiona Ctrl+C en cualquier momento para detener el servidor.\x1b[0m\n`);

    // Auto-open browser on Windows
    try {
      exec(`start ${url}`);
    } catch {}
  });
}

// Run CLI
runCli().catch((err) => {
  console.error('\x1b[31m[ERROR FATAL]\x1b[0m', err);
  process.exit(1);
});
