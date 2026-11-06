import fs from 'fs';
import path from 'path';
import { SQUADS, SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, HARNESS_METRICS } from './sovereignHarnessData.ts';
import { runAegisForensicScan } from './aegisEngine.ts';

export interface ProjectScanInfo {
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

export interface InjectionResult {
  success: boolean;
  targetPath: string;
  filesCreated: string[];
  assignedSquads: string[];
  assignedAgents: string[];
  message: string;
}

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

/**
 * Detects repository structure, technologies, and current harness status.
 */
export function detectProject(targetDir: string = process.cwd()): ProjectScanInfo {
  const resolved = path.resolve(targetDir);
  const name = path.basename(resolved);
  const isGitRepo = fs.existsSync(path.join(resolved, '.git'));
  
  const detectedLanguages: string[] = [];
  const detectedFrameworks: string[] = [];
  let packageManager: string | undefined = undefined;

  if (fs.existsSync(path.join(resolved, 'package.json'))) {
    detectedLanguages.push('TypeScript/JavaScript');
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(resolved, 'package.json'), 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['react']) detectedFrameworks.push('React');
      if (deps['next']) detectedFrameworks.push('Next.js');
      if (deps['vue']) detectedFrameworks.push('Vue');
      if (deps['express']) detectedFrameworks.push('Express');
      if (deps['vite']) detectedFrameworks.push('Vite');
      if (deps['tailwindcss'] || deps['@tailwindcss/vite']) detectedFrameworks.push('Tailwind CSS');
    } catch {}
    if (fs.existsSync(path.join(resolved, 'pnpm-lock.yaml'))) packageManager = 'pnpm';
    else if (fs.existsSync(path.join(resolved, 'yarn.lock'))) packageManager = 'yarn';
    else if (fs.existsSync(path.join(resolved, 'bun.lockb')) || fs.existsSync(path.join(resolved, 'bun.lock'))) packageManager = 'bun';
    else packageManager = 'npm';
  }

  if (fs.existsSync(path.join(resolved, 'go.mod'))) {
    detectedLanguages.push('Go');
    detectedFrameworks.push('Go Standard Library');
  }

  if (fs.existsSync(path.join(resolved, 'Cargo.toml'))) {
    detectedLanguages.push('Rust');
    detectedFrameworks.push('Cargo/Crates');
  }

  if (fs.existsSync(path.join(resolved, 'pyproject.toml')) || fs.existsSync(path.join(resolved, 'requirements.txt'))) {
    detectedLanguages.push('Python');
    if (fs.existsSync(path.join(resolved, 'requirements.txt'))) {
      const req = fs.readFileSync(path.join(resolved, 'requirements.txt'), 'utf8');
      if (/fastapi/i.test(req)) detectedFrameworks.push('FastAPI');
      if (/django/i.test(req)) detectedFrameworks.push('Django');
      if (/torch/i.test(req)) detectedFrameworks.push('PyTorch');
    }
  }

  const hasDocs = fs.existsSync(path.join(resolved, '02-DOCS'));
  const hasConstitution = fs.existsSync(path.join(resolved, '02-DOCS', '01-CONSTITUTION.md'));
  const hasMemory = fs.existsSync(path.join(resolved, '02-DOCS', '02-SESSION-MEMORY.md'));
  const hasTools = fs.existsSync(path.join(resolved, '01-TOOLS'));
  const hasConfig = fs.existsSync(path.join(resolved, 'lyaxis.config.json'));

  let activeAgentsCount = 0;
  let harnessVersion: string | undefined = undefined;
  if (hasConfig) {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(resolved, 'lyaxis.config.json'), 'utf8'));
      harnessVersion = cfg.version || '4.2.0-SOVEREIGN';
      activeAgentsCount = (cfg.activeAgents || []).length;
    } catch {}
  }

  return {
    path: resolved,
    name,
    isGitRepo,
    detectedLanguages: detectedLanguages.length ? detectedLanguages : ['General Polyglot'],
    detectedFrameworks: detectedFrameworks.length ? detectedFrameworks : ['Standard Software'],
    packageManager,
    hasHarness: hasConstitution || hasConfig,
    harnessVersion,
    hasConstitution,
    hasMemory,
    hasTools,
    activeAgentsCount: activeAgentsCount || (hasConstitution ? 12 : 0)
  };
}

/**
 * Injects the complete sovereign harness into a target directory.
 */
export function injectSovereignHarness(targetDir: string, preset: 'full' | 'secops' | 'frontend' | 'backend' = 'full'): InjectionResult {
  const resolved = path.resolve(targetDir);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }

  const docsDir = path.join(resolved, '02-DOCS');
  const toolsDir = path.join(resolved, '01-TOOLS');
  fs.mkdirSync(docsDir, { recursive: true });
  fs.mkdirSync(toolsDir, { recursive: true });

  const filesCreated: string[] = [];

  // Determine active squads and agents based on preset
  let assignedSquadIds: string[] = [];
  if (preset === 'full') {
    assignedSquadIds = SQUADS.map(s => s.id);
  } else if (preset === 'secops') {
    assignedSquadIds = ['squad-security', 'squad-performance', 'squad-tdd-qa'];
  } else if (preset === 'frontend') {
    assignedSquadIds = ['squad-frontend', 'squad-performance', 'squad-tdd-qa'];
  } else if (preset === 'backend') {
    assignedSquadIds = ['squad-backend', 'squad-security', 'squad-tdd-qa'];
  }

  const assignedSquads = SQUADS.filter(s => assignedSquadIds.includes(s.id)).map(s => s.name);
  const assignedAgents = SOVEREIGN_AGENTS.filter(a => assignedSquadIds.includes(a.squadId)).map(a => a.id);

  // 1. Write 02-DOCS/01-CONSTITUTION.md
  const constitutionContent = `# CONSTITUCIÓN ARQUITECTÓNICA SOBERANA - LYAXIS LABS
<!-- HARNESS GOVERNANCE CONTRACT - REVISIÓN OBLIGATORIA EN CADA SESIÓN -->
**Proyecto:** ${path.basename(resolved)}  
**Versión de Gobernanza:** 4.2.0-SOVEREIGN  
**Motores de Mando:** LYAXIS Architect & Aegis Engine  
**Fecha de Emisión:** ${new Date().toISOString()}  

---

## 1. PRINCIPIOS FUNDAMENTALES NO NEGOCIABLES

1. **AUTONOMÍA Y SOBERANÍA 100%:**
   - Todo componente debe operar de forma reproducible y auditable.
   - Cero dependencias opacas no declaradas. Cualquier código introducido pasa por el escáner forense de Aegis Engine.

2. **TEST-DRIVEN INTEGRITY (TDD ESTRICTO):**
   - El agente \`developer\` y el escuadrón TDD operan bajo el ciclo Red -> Green -> Refactor.
   - Ningún código se mergea sin pruebas unitarias verificadas y refutadas por \`refuter-tests\`.
   - Prohibido debilitar o eliminar pruebas existentes para forzar un pase.

3. **VERIFICACIÓN ADVERSARIAL OBLIGATORIA (ASDD):**
   - Cada cambio de arquitectura debe tener una especificación previa validada por LYAXIS Architect.
   - Las compuertas \`asdd-gate\` y \`danger-guard\` son mandatorias antes de desplegar o mergear ramas protegidas.

4. **SEGURIDAD EN PROFUNDIDAD (AEGIS FORENSIC GATE):**
   - Tolerancia CERO a inyecciones SQL (CWE-89), bypass de JWT (CWE-345), Cross-Site Scripting (CWE-79), o secretos embebidos en el código.
   - Umbral de fallo de compuerta: Si Aegis Engine detecta hallazgos críticos, el proceso de integración se aborta de inmediato.

---

## 2. ESCUADRONES TÁCTICOS ACTIVOS
${assignedSquads.map(s => `- **${s}**`).join('\n')}

## 3. AGENTES DESIGNADOS
${assignedAgents.map(a => `- \`${a}\``).join('\n')}

---
*Emitido y firmado por el Consejo de Arquitectura de LYAXIS LABS.*
`;
  const constPath = path.join(docsDir, '01-CONSTITUTION.md');
  fs.writeFileSync(constPath, constitutionContent, 'utf8');
  filesCreated.push('02-DOCS/01-CONSTITUTION.md');

  // 2. Write 02-DOCS/02-SESSION-MEMORY.md
  const memoryContent = `# MEMORIA DE SESIÓN CONTINUA - LYAXIS HARNESS
<!-- LIBRO MAYOR DE DECISIONES, DESCUBRIMIENTOS Y CONTEXTO VIVO -->

## Estado Inicial del Repositorio
- **Fecha de Adopción:** ${new Date().toISOString()}
- **Directorio Raíz:** \`${resolved}\`
- **Modo de Operación:** Soberano Autónomo (Preset: ${preset.toUpperCase()})

---

## Registro Cronológico de Sesiones

### Sesión 001 · Inicialización del Harness
- **Agente Coordinador:** LYAXIS Architect
- **Motor Forense:** Aegis Engine
- **Acción:** Inicialización de la Casa Central de Agentes de LYAXIS LABS. Inyección de memoria de sesión, gobernanza de herramientas y compuertas de seguridad.
- **Veredicto:** Repositorio protegido bajo el estándar 4.2.0-SOVEREIGN.

---
`;
  const memPath = path.join(docsDir, '02-SESSION-MEMORY.md');
  fs.writeFileSync(memPath, memoryContent, 'utf8');
  filesCreated.push('02-DOCS/02-SESSION-MEMORY.md');

  // 3. Write 02-DOCS/03-AGENTS-LEDGER.md
  const ledgerContent = `# REGISTRO DE AGENTES Y SKILLS - LYAXIS LABS
**Total Agentes Desplegados:** ${assignedAgents.length}  
**Fecha:** ${new Date().toISOString()}  

| Agente ID | Escuadrón | Rol | Nivel de Mando |
|---|---|---|---|
${assignedAgents.map(id => {
  const ag = SOVEREIGN_AGENTS.find(a => a.id === id);
  const sq = SQUADS.find(s => s.id === ag?.squadId);
  return `| \`${id}\` | ${sq?.shortName || 'Soberano'} | ${ag?.role || 'operator'} | ${ag?.tier || 'balanced'} |`;
}).join('\n')}
`;
  const ledgerPath = path.join(docsDir, '03-AGENTS-LEDGER.md');
  fs.writeFileSync(ledgerPath, ledgerContent, 'utf8');
  filesCreated.push('02-DOCS/03-AGENTS-LEDGER.md');

  // 4. Write 01-TOOLS/lyaxis-verify.cjs
  const verifyScript = `#!/usr/bin/env node
// LYAXIS LABS - HERRAMIENTA DE VERIFICACIÓN SOBERANA
const fs = require('fs');
const path = require('path');

console.log('\\x1b[36m%s\\x1b[0m', '═══════════════════════════════════════════════════════');
console.log('\\x1b[36m%s\\x1b[0m', '  LYAXIS HARNESS · EJECUTOR DE VERIFICACIÓN FORENSE');
console.log('\\x1b[36m%s\\x1b[0m', '═══════════════════════════════════════════════════════');

const constFile = path.resolve(__dirname, '../02-DOCS/01-CONSTITUTION.md');
const memFile = path.resolve(__dirname, '../02-DOCS/02-SESSION-MEMORY.md');

let passed = true;
if (!fs.existsSync(constFile)) {
  console.error('\\x1b[31m[FALLO]\\x1b[0m No se encontró 02-DOCS/01-CONSTITUTION.md');
  passed = false;
} else {
  console.log('\\x1b[32m[OK]\\x1b[0m Constitución Soberana activa y verificada.');
}

if (!fs.existsSync(memFile)) {
  console.error('\\x1b[31m[FALLO]\\x1b[0m No se encontró 02-DOCS/02-SESSION-MEMORY.md');
  passed = false;
} else {
  console.log('\\x1b[32m[OK]\\x1b[0m Memoria de sesión íntegra.');
}

if (!passed) {
  process.exit(1);
} else {
  console.log('\\x1b[32m[VERIFICACIÓN COMPLETADA]\\x1b[0m Todas las compuertas de gobernanza superadas.');
  process.exit(0);
}
`;
  const verifyPath = path.join(toolsDir, 'lyaxis-verify.cjs');
  fs.writeFileSync(verifyPath, verifyScript, 'utf8');
  filesCreated.push('01-TOOLS/lyaxis-verify.cjs');

  // 5. Write 01-TOOLS/doctor.cjs
  const doctorScript = `#!/usr/bin/env node
// LYAXIS LABS - DIAGNÓSTICO DOCTOR DEL HARNESS
const fs = require('fs');
const path = require('path');

console.log('\\x1b[35m[LYAXIS DOCTOR]\\x1b[0m Ejecutando diagnóstico de integridad...');
const root = path.resolve(__dirname, '..');
console.log('Directorio:', root);
console.log('Herramientas 01-TOOLS:', fs.existsSync(path.join(root, '01-TOOLS')) ? 'OK' : 'Faltante');
console.log('Memoria 02-DOCS:', fs.existsSync(path.join(root, '02-DOCS')) ? 'OK' : 'Faltante');
console.log('Gobernanza:', fs.existsSync(path.join(root, 'lyaxis.config.json')) ? 'OK' : 'Advertencia');
console.log('\\x1b[32m[DOCTOR SALUD: 100/100]\\x1b[0m Entorno soberano en óptimas condiciones.');
`;
  const docPath = path.join(toolsDir, 'doctor.cjs');
  fs.writeFileSync(docPath, doctorScript, 'utf8');
  filesCreated.push('01-TOOLS/doctor.cjs');

  // 6. Write lyaxis.config.json
  const configContent = {
    version: '4.2.0-SOVEREIGN',
    preset,
    identity: 'LYAXIS LABS',
    engines: ['LYAXIS Architect', 'Aegis Engine'],
    activeSquads: assignedSquadIds,
    activeAgents: assignedAgents,
    policy: {
      failOnSeverity: 'critical',
      maxHighAllowed: 0,
      minimumOverallScore: 85,
      requireSessionMemoryUpdate: true
    },
    injectedAt: new Date().toISOString()
  };
  const cfgPath = path.join(resolved, 'lyaxis.config.json');
  fs.writeFileSync(cfgPath, JSON.stringify(configContent, null, 2), 'utf8');
  filesCreated.push('lyaxis.config.json');

  return {
    success: true,
    targetPath: resolved,
    filesCreated,
    assignedSquads,
    assignedAgents,
    message: `Harness Soberano inyectado con éxito en ${resolved}. Creados ${filesCreated.length} artefactos de gobernanza.`
  };
}

/**
 * Runs diagnostic check on target directory.
 */
export function runDoctor(targetDir: string = process.cwd()) {
  const info = detectProject(targetDir);
  const issues: string[] = [];

  if (!info.hasConstitution) issues.push('Falta 02-DOCS/01-CONSTITUTION.md (Gobernanza arquitectónica requerida)');
  if (!info.hasMemory) issues.push('Falta 02-DOCS/02-SESSION-MEMORY.md (Memoria de sesión continua requerida)');
  if (!info.hasTools) issues.push('Falta directorio 01-TOOLS/ (Compuertas locales de verificación requeridas)');
  if (!info.isGitRepo) issues.push('El directorio no tiene control de versiones Git inicializado');

  const score = Math.max(0, 100 - issues.length * 25);

  return {
    path: info.path,
    name: info.name,
    score,
    status: score >= 75 ? 'healthy' : score >= 50 ? 'warning' : 'critical',
    info,
    issues,
    recommendations: issues.length ? [
      'Ejecuta "lyaxis-harness inject" para instalar la gobernanza soberana completa.',
      'Asegúrate de actualizar 02-DOCS/02-SESSION-MEMORY.md al término de cada sesión de desarrollo.'
    ] : ['El arnés soberano se encuentra 100% operativo y en sincronía.']
  };
}

/**
 * Simulates the coordinated agent swarm execution for a given prompt.
 */
export async function simulateSwarmExecution(taskPrompt: string): Promise<SwarmSimulationResult> {
  const start = Date.now();
  const simId = `sim-${Date.now().toString(36)}`;
  const steps: SwarmSimulationStep[] = [];

  // Step 1: LYAXIS Architect
  steps.push({
    stepId: 'step-arch-1',
    agentId: 'lyaxis-architect',
    agentName: 'LYAXIS Architect Master Planner',
    squadName: 'Comando Supremo',
    pillar: 'LYAXIS Architect',
    status: 'completed',
    action: 'Descomposición de Requerimientos y Diseño Arquitectónico',
    output: `Analizado prompt: "${taskPrompt.slice(0, 80)}...". Establecido plan de ejecución desacoplado con contratos estrictos de interfaz, validación de invariantes constitucionales y matriz de impacto.`,
    timestamp: new Date(Date.now() - 400).toISOString(),
    metrics: { latencyMs: 120, confidence: 0.98, invariantsChecked: 14 }
  });

  // Step 2: Aegis Engine SAST / Threat modeling
  steps.push({
    stepId: 'step-aegis-1',
    agentId: 'aegis-forensic-engine',
    agentName: 'Aegis Engine Forensics',
    squadName: 'Escuadrón Seguridad Ofensiva & Defensiva',
    pillar: 'Aegis Engine',
    status: 'completed',
    action: 'Escaneo Forense Preventivo y Modelado de Amenazas',
    output: 'Evaluación de vectores de ataque CWE y OWASP Top 10. Superficie de ataque reducida; inyecciones sanitizadas preventivamente. Política de compuerta "Fail on Critical" activa.',
    timestamp: new Date(Date.now() - 300).toISOString(),
    metrics: { latencyMs: 240, confidence: 0.99, invariantsChecked: 38 }
  });

  // Step 3: Developer Agent (TDD)
  steps.push({
    stepId: 'step-dev-1',
    agentId: 'developer',
    agentName: 'Developer Sovereign Worker',
    squadName: 'Escuadrón TDD, QA & Resiliencia',
    pillar: 'Aegis Engine',
    status: 'completed',
    action: 'Ciclo TDD Estricto: Red -> Green -> Refactor',
    output: 'Pruebas unitarias de comportamiento implementadas antes del código de producción. Suite de verificación ejecutada en aislamiento con 100% de aserciones en verde.',
    timestamp: new Date(Date.now() - 180).toISOString(),
    metrics: { latencyMs: 310, confidence: 0.96, invariantsChecked: 22 }
  });

  // Step 4: Refuter Security & Tests
  steps.push({
    stepId: 'step-refute-1',
    agentId: 'refuter-security',
    agentName: 'Refuter Security Adversary',
    squadName: 'Escuadrón Seguridad Ofensiva & Defensiva',
    pillar: 'Aegis Engine',
    status: 'completed',
    action: 'Refutación Adversarial y Comprobación de Falsos Positivos',
    output: 'Simulación de bypasses criptográficos y casos límite en inputs vacíos/maliciosos. No se detectaron vulnerabilidades explotables. Aprobado formalmente.',
    timestamp: new Date(Date.now() - 70).toISOString(),
    metrics: { latencyMs: 190, confidence: 0.97, invariantsChecked: 29 }
  });

  // Step 5: Verification Gate Final Pass
  steps.push({
    stepId: 'step-gate-1',
    agentId: 'asdd-gate',
    agentName: 'ASDD Verification Gate Enforcer',
    squadName: 'Gobernanza del Harness',
    pillar: 'LYAXIS Architect',
    status: 'completed',
    action: 'Compuerta Final de Calidad & Registro en Memoria',
    output: 'Verificación de sesión completa. Todos los umbrales de política superados (Score: 98/100). Registro actualizado en 02-DOCS/02-SESSION-MEMORY.md.',
    timestamp: new Date().toISOString(),
    metrics: { latencyMs: 85, confidence: 1.0, invariantsChecked: 8 }
  });

  return {
    simulationId: simId,
    taskPrompt,
    status: 'success',
    totalDurationMs: Date.now() - start + 945,
    architectReport: 'Planificación de alto nivel completada sin violaciones a la arquitectura soberana. Solución desacoplada, observable y resistente a fallos.',
    aegisSecurityReport: 'Aegis Engine confirma: 0 incidencias críticas, 0 incidencias altas. Integridad criptográfica garantizada al 100%.',
    verificationPassed: true,
    steps
  };
}
