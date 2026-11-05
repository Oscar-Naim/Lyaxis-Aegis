import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Layers,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { PipelineRun, ScanResult } from '../types/index.ts';

interface PipelineIntegrationProps {
  currentScan: ScanResult;
  pipelineRun: PipelineRun;
  onSimulateRun: (threshold: 'critical' | 'strict' | 'permissive') => void;
  isSimulating: boolean;
}

export const PipelineIntegration: React.FC<PipelineIntegrationProps> = ({
  currentScan,
  pipelineRun,
  onSimulateRun,
  isSimulating,
}) => {
  const [selectedSnippetTab, setSelectedSnippetTab] = useState<'github' | 'gitlab' | 'precommit'>('github');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [policyThreshold, setPolicyThreshold] = useState<'critical' | 'strict' | 'permissive'>('critical');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const SNIPPETS = {
    github: `# .github/workflows/lyaxis-aegis-gate.yml
name: LYAXIS Aegis Quality Gate

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main ]

jobs:
  forensic-audit-and-gate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Run Aegis Engine Verification
        run: |
          echo "Ejecutando escaneo forense con Aegis Engine..."
          # Política: ${policyThreshold}
          npm run lint`,

    gitlab: `# .gitlab-ci.yml
stages:
  - test
  - verify

aegis_forensic_gate:
  stage: verify
  image: node:20
  script:
    - npm ci
    - echo "Ejecutando verificación con Aegis Engine..."
    - npm run lint
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'`,

    precommit: `#!/bin/sh
# .husky/pre-commit — LYAXIS Aegis Local Shield
echo "Ejecutando verificación pre-commit con Aegis Engine..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Commit rechazado por compuerta de calidad de Aegis."
  exit 1
fi`
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="obsidian-glass p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Compuerta de Calidad (Quality Gate) &middot; CI/CD DevSecOps</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Integración de Pipeline &amp; Bloqueo de Pull Requests
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Garantiza que ninguna vulnerabilidad crítica o degradación de Web Vitals llegue a la rama principal de producción.
          </p>
        </div>

        {/* Policy Selector & Trigger Simulation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={policyThreshold}
            onChange={(e) => setPolicyThreshold(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-white/[0.1] text-xs font-semibold text-white focus:outline-none"
          >
            <option value="critical">Fail on Critical &gt; 0 (Estricto)</option>
            <option value="strict">Fail on Critical &gt; 0 OR High &gt; 2</option>
            <option value="permissive">Modo Permisivo (Solo Advertencias)</option>
          </select>

          <button
            onClick={() => onSimulateRun(policyThreshold)}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md glow-cyan active:scale-95"
          >
            {isSimulating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Simulando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simular Ejecución CI/CD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pipeline Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Estado de la Compuerta</div>
          <div className={`text-xl font-black mt-1 flex items-center justify-center gap-1.5 ${
            pipelineRun.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {pipelineRun.status === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Aprobada</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span>Bloqueada</span>
              </>
            )}
          </div>
        </div>

        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Incidencias Críticas</div>
          <div className={`text-xl font-black font-mono mt-1 ${pipelineRun.summary.criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {pipelineRun.summary.criticalCount} detectadas
          </div>
        </div>

        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Score de Rendimiento</div>
          <div className="text-xl font-black font-mono text-cyan-400 mt-1">
            {pipelineRun.summary.perfScore}/100
          </div>
        </div>

        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Rama &middot; Commit</div>
          <div className="text-sm font-bold font-mono text-slate-300 mt-1 flex items-center justify-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>{pipelineRun.branch} ({pipelineRun.commitHash})</span>
          </div>
        </div>
      </div>

      {/* Live Pipeline Execution Stages */}
      <div className="obsidian-card p-6 border border-white/[0.08] rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Etapas de Ejecución en Tiempo Real (Stages):</span>
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {pipelineRun.stages.map((stage) => (
            <div
              key={stage.id}
              className={`rounded-xl border p-4 transition-all ${
                stage.status === 'success'
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : stage.status === 'failed'
                  ? 'border-rose-500/40 bg-rose-950/15'
                  : 'border-white/[0.08] bg-black/40'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  {stage.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="font-bold text-white">{stage.name}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {stage.durationMs}ms &middot; {stage.status.toUpperCase()}
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-[11px] text-slate-300 pl-6">
                {stage.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('CRÍTICA') || log.includes('FALLO')
                        ? 'text-rose-300 font-semibold'
                        : log.includes('Aprobado') || log.includes('0 type errors')
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }
                  >
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CI/CD Snippets Section */}
      <div className="obsidian-card p-6 border border-white/[0.08] rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white">
            Configuración para tu Pipeline CI/CD:
          </h3>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
            {(['github', 'gitlab', 'precommit'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedSnippetTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs uppercase font-bold transition-all ${
                  selectedSnippetTab === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-white/[0.06] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
            {SNIPPETS[selectedSnippetTab]}
          </pre>

          <button
            onClick={() => handleCopy(SNIPPETS[selectedSnippetTab])}
            className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'Copiado' : 'Copiar Snippet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
