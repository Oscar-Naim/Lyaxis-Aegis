const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../scratch/rsc-harness-inspected/rsc-harness-4.0.4/manifest.json');
const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 6 Tactical Squads of LYAXIS LABS
const SQUADS = [
  {
    id: 'squad-security',
    name: 'Escuadrón Seguridad Ofensiva & Defensiva',
    shortName: 'Seguridad & Forense',
    icon: 'ShieldAlert',
    color: '#06b6d4', // Cyan
    borderColor: 'border-cyan-500/40',
    bgBadge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    description: 'Defensa implacable, escaneo en profundidad en tiempo real, detección SAST/DAST y refutación formal de vulnerabilidades.',
    pillar: 'Aegis Engine'
  },
  {
    id: 'squad-performance',
    name: 'Escuadrón Rendimiento Extremo & Web Vitals',
    shortName: 'Rendimiento Extremo',
    icon: 'Zap',
    color: '#10b981', // Emerald
    borderColor: 'border-emerald-500/40',
    bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    description: 'Optimización sub-milisegundo, Core Web Vitals (LCP, INP, CLS), orquestación de caché y minimización cuántica de bundles.',
    pillar: 'Aegis Engine'
  },
  {
    id: 'squad-frontend',
    name: 'Escuadrón Frontend Ultra Moderno',
    shortName: 'Frontend Ultra',
    icon: 'Layout',
    color: '#38bdf8', // Sky
    borderColor: 'border-sky-500/40',
    bgBadge: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    description: 'Arquitectura Obsidian Specular Glass, React 19, componentes autónomos, microfrontends y accesibilidad WCAG AA certificada.',
    pillar: 'LYAXIS Architect'
  },
  {
    id: 'squad-backend',
    name: 'Escuadrón Backend Soberano & APIs',
    shortName: 'Backend & Sistemas',
    icon: 'Server',
    color: '#8b5cf6', // Violet
    borderColor: 'border-violet-500/40',
    bgBadge: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    description: 'Sistemas distribuidos de alta disponibilidad en Go, Rust, Python y Node; concurrencia implacable y bases de datos transaccionales.',
    pillar: 'LYAXIS Architect'
  },
  {
    id: 'squad-tdd-qa',
    name: 'Escuadrón TDD, QA & Resiliencia Forense',
    shortName: 'TDD & Resiliencia',
    icon: 'CheckCheck',
    color: '#f59e0b', // Amber
    borderColor: 'border-amber-500/40',
    bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    description: 'Ciclo estricto Red->Green->Refactor, pruebas de mutación, minería de especificaciones y compuertas de calidad sin concesiones.',
    pillar: 'Aegis Engine'
  },
  {
    id: 'squad-ai-data',
    name: 'Escuadrón Datos, AI Soberana & Neural Ops',
    shortName: 'AI & Neural Ops',
    icon: 'BrainCircuit',
    color: '#ec4899', // Pink
    borderColor: 'border-pink-500/40',
    bgBadge: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
    description: 'Gobernanza neural soberana, pipelines RAG contextuales, guardrails anti-jailbreak y evaluación empírica de agentes.',
    pillar: 'LYAXIS Architect'
  }
];

function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/rsc/gi, 'lyaxis-harness')
    .replace(/@ericrisco\/rsc/gi, 'lyaxis-harness')
    .replace(/ericrisco/gi, 'lyaxis')
    .replace(/cursor/gi, 'lyaxis-agent')
    .replace(/OpenAI\/Anthropic\/Gemini\/OSS/gi, 'Sovereign Engines (LYAXIS Architect & Aegis Engine)')
    .replace(/llama-qwen-mistral-gemma/gi, 'sovereign-local-runtime')
    .replace(/OpenAI-compatible/gi, 'Sovereign REST API compliant')
    .replace(/openai-compatible/gi, 'Sovereign REST API compliant')
    .replace(/CLAUDE\.md/g, 'SOVEREIGN.md')
    .replace(/claude/gi, 'sovereign-ai')
    .replace(/copilot/gi, 'Architect')
    .replace(/chatgpt/gi, 'sovereign-assistant')
    .replace(/openai/gi, 'Sovereign Engine')
    .replace(/anthropic/gi, 'Sovereign Engine')
    .replace(/gemini/gi, 'Aegis Engine')
    .replace(/mistral/gi, 'sovereign-runtime')
    .replace(/\bllama\b/gi, 'sovereign-model');
}

// Map Agent IDs to Squads
const agentSquadMap = {
  // Security
  'finding-verifier': 'squad-security',
  'refuter-security': 'squad-security',
  'refuter-correctness': 'squad-security',

  // Performance (we assign related build resolvers / reviewers or keep in squad)
  'react-build-resolver': 'squad-frontend',
  'react-reviewer': 'squad-frontend',
  'vue-reviewer': 'squad-frontend',
  'typescript-reviewer': 'squad-frontend',

  // Backend
  'go-build-resolver': 'squad-backend',
  'go-reviewer': 'squad-backend',
  'rust-build-resolver': 'squad-backend',
  'rust-reviewer': 'squad-backend',
  'python-reviewer': 'squad-backend',
  'fastapi-reviewer': 'squad-backend',
  'django-build-resolver': 'squad-backend',
  'django-reviewer': 'squad-backend',
  'postgres-reviewer': 'squad-backend',
  'cpp-build-resolver': 'squad-backend',
  'cpp-reviewer': 'squad-backend',
  'csharp-reviewer': 'squad-backend',
  'java-build-resolver': 'squad-backend',
  'java-reviewer': 'squad-backend',
  'kotlin-build-resolver': 'squad-backend',
  'kotlin-reviewer': 'squad-backend',
  'php-reviewer': 'squad-backend',
  'swift-build-resolver': 'squad-backend',
  'swift-reviewer': 'squad-backend',
  'flutter-build-resolver': 'squad-backend',
  'flutter-reviewer': 'squad-backend',

  // TDD / QA
  'developer': 'squad-tdd-qa',
  'refuter-tests': 'squad-tdd-qa',
  'spec-miner': 'squad-tdd-qa',

  // AI & Data
  'mle-reviewer': 'squad-ai-data',
  'pytorch-build-resolver': 'squad-ai-data',
  'rag-reviewer': 'squad-ai-data',
};

const processedAgents = rawManifest.agents.map((agent) => {
  const squadId = agentSquadMap[agent.id] || 'squad-backend';
  const tools = agent.tools || ['read', 'search', 'edit', 'execute'];
  const skills = agent.skills || [];
  
  return {
    id: agent.id,
    name: agent.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: sanitizeText(agent.description),
    role: agent.role,
    tier: agent.tier || 'balanced',
    squadId,
    tools,
    skills,
    systemDirective: `Agente especializado de LYAXIS LABS para ${agent.id}. Opera de forma autónoma bajo la Constitución y Gobernanza del Harness Soberano.`
  };
});

function assignSkillSquad(skill) {
  const allText = `${skill.id} ${(skill.tags || []).join(' ')} ${skill.description}`.toLowerCase();
  
  if (/security|auth|jwt|oauth|cipher|crypto|sanitiz|vulnerab|secret|guard|owasp|firewall|permission/.test(allText)) {
    return 'squad-security';
  }
  if (/performance|vital|cache|latency|cdn|speed|memory|profile|compress|lcp|cls|inp|optimi/.test(allText)) {
    return 'squad-performance';
  }
  if (/ai|llm|eval|rag|prompt|agent|neural|vector|embed|model|inference|mle/.test(allText)) {
    return 'squad-ai-data';
  }
  if (/test|tdd|qa|assert|mock|e2e|coverage|mutat|rubric|gate|verify|spec|sdd|asdd/.test(allText)) {
    return 'squad-tdd-qa';
  }
  if (/frontend|react|vue|ui|css|tailwind|html|dom|browser|web|design|a11y|accessib|layout|canvas|svelte/.test(allText)) {
    return 'squad-frontend';
  }
  return 'squad-backend';
}

const processedSkills = rawManifest.skills.map(skill => {
  const squadId = assignSkillSquad(skill);
  return {
    id: skill.id,
    name: skill.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: sanitizeText(skill.description),
    tags: (skill.tags || []).map(sanitizeText),
    recommends: (skill.recommends || []).map(sanitizeText),
    squadId
  };
});

console.log(`Processed ${processedAgents.length} agents and ${processedSkills.length} skills.`);
const squadCounts = {};
processedSkills.forEach(s => squadCounts[s.squadId] = (squadCounts[s.squadId] || 0) + 1);
console.log('Skill breakdown by squad:', squadCounts);

// Generate TypeScript Output
const tsOutput = `// LYAXIS LABS SOVEREIGN HARNESS - MASTER CATALOG
// 100% PROPRIETARY & OPEN-CORE ARCHITECTURE

export interface Squad {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  borderColor: string;
  bgBadge: string;
  description: string;
  pillar: 'LYAXIS Architect' | 'Aegis Engine';
}

export interface SovereignAgent {
  id: string;
  name: string;
  description: string;
  role: string;
  tier: string;
  squadId: string;
  tools: string[];
  skills: string[];
  systemDirective: string;
}

export interface SovereignSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  recommends: string[];
  squadId: string;
}

export const SQUADS: Squad[] = ${JSON.stringify(SQUADS, null, 2)};

export const SOVEREIGN_AGENTS: SovereignAgent[] = ${JSON.stringify(processedAgents, null, 2)};

export const SOVEREIGN_SKILLS: SovereignSkill[] = ${JSON.stringify(processedSkills, null, 2)};

export const HARNESS_METRICS = {
  totalAgents: ${processedAgents.length},
  totalSkills: ${processedSkills.length},
  totalSquads: ${SQUADS.length},
  version: "4.2.0-SOVEREIGN",
  coreEngines: ["LYAXIS Architect", "Aegis Engine"]
};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/data/sovereignHarnessData.ts'), tsOutput);
fs.writeFileSync(path.resolve(__dirname, '../api-src/_shared/sovereignHarnessData.ts'), tsOutput);
console.log('Successfully written catalog to src/data/sovereignHarnessData.ts and api-src/_shared/sovereignHarnessData.ts');
