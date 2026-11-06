import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Flame, 
  Layers, 
  Sparkles, 
  Bot, 
  RefreshCw,
  Code2,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { SwarmSimulationStep, SwarmSimulationResult } from '../types/harness.ts';

interface AgentSwarmSimulatorProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const PRESET_PROMPTS = [
  {
    label: 'TDD & Sanitización SQL',
    prompt: 'Implementar endpoint de facturación con TDD estricto y sanitizar contra SQL Injection (CWE-89).'
  },
  {
    label: 'Web Vitals LCP & INP',
    prompt: 'Optimizar Core Web Vitals en cliente React 19: LCP < 800ms, streaming SSR y CLS 0.'
  },
  {
    label: 'Microservicio Go Resiliente',
    prompt: 'Diseñar arquitectura de microservicio transaccional en Go con canales concurrentes libres de race conditions.'
  },
  {
    label: 'Bypass JWT & Cryptographic Fix',
    prompt: 'Auditar jwt.decode() inseguro y reemplazarlo con verificación formal de firma asimétrica RS256.'
  }
];

export const AgentSwarmSimulator: React.FC<AgentSwarmSimulatorProps> = ({
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [taskPrompt, setTaskPrompt] = useState<string>(initialPrompt || PRESET_PROMPTS[0].prompt);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SwarmSimulationResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  const handleRunSimulation = async (promptToRun?: string) => {
    const prompt = promptToRun || taskPrompt;
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setSimulationResult(null);
    setCurrentStepIndex(0);

    try {
      const res = await fetch('/api/harness/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error('Error al ejecutar la simulación del enjambre');
      const data: SwarmSimulationResult = await res.json();

      // Animate steps sequential reveal
      for (let i = 0; i < data.steps.length; i++) {
        setCurrentStepIndex(i);
        await new Promise(r => setTimeout(r, 450));
      }

      setSimulationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
      onClearInitialPrompt?.();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Simulator Hero & Prompt Launcher */}
      <div className="p-6 sm:p-8 rounded-2xl obsidian-glass border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-[#060D1A] to-slate-950 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Simulador de Enjambre / Live Terminal
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                  COORDINACIÓN MULTI-AGENTE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Observa el flujo coordinado entre LYAXIS Architect, Aegis Engine y los escuadrones técnicos.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTaskPrompt(p.prompt);
                  handleRunSimulation(p.prompt);
                }}
                disabled={isRunning}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            disabled={isRunning}
            placeholder="Escribe una tarea para el enjambre (ej. Implementar arquitectura JWT segura con pruebas TDD)..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-white/[0.12] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
          />
          <button
            onClick={() => handleRunSimulation()}
            disabled={isRunning || !taskPrompt.trim()}
            className="primary-button whitespace-nowrap px-6 py-3 justify-center text-xs sm:text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Ejecutando Enjambre...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Lanzar al Enjambre
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="rounded-2xl obsidian-glass border border-white/[0.1] bg-[#02050A] overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="px-5 py-3 border-b border-white/[0.08] bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="text-xs font-mono text-slate-400 ml-2">lyaxis-agent-swarm://live-execution</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            {isRunning ? (
              <span className="text-cyan-400 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                PROCESANDO DIRECTIVA...
              </span>
            ) : simulationResult ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFICACIÓN EXITOSA ({simulationResult.totalDurationMs} ms)
              </span>
            ) : (
              <span className="text-slate-500">LISTO PARA EJECUCIÓN</span>
            )}
          </div>
        </div>

        {/* Terminal Content Body */}
        <div className="p-6 font-mono text-xs space-y-6 min-h-[380px]">
          {/* Welcome ASCII header */}
          <div className="text-cyan-500/70 select-none whitespace-pre leading-tight">
{`   __  __  _   _   ___  __   ___  _   _     _  _   ___   ___  _  _  ___  ___  ___ 
  |  \\/  |/ \\ | | / _ \\ \\ \\ / / \\| | / \\   | || | / _ \\ | _ \\| \\| || __|/ __|/ __|
  | |\\/| / _ \\| || (_) |\\ V /| .  |/ _ \\  | __ || (_) ||   /| .  || _| \\__ \\\\__ \\
  |_|  /_/ \\_\\___|\\___/  \\_/ |_|\\_/_/ \\_\\ |_||_| \\___/ |_|_\\|_|\\_||___||___/|___/`}
          </div>

          <div className="text-slate-400 text-[11px] border-b border-white/[0.06] pb-3">
            [Soberano 4.2.0] Directiva activa: <span className="text-white font-semibold">"{taskPrompt}"</span>
          </div>

          {/* Stepper display */}
          <div className="space-y-4">
            {(simulationResult?.steps || (isRunning ? [
              {
                stepId: 'step-arch-1',
                agentId: 'lyaxis-architect',
                agentName: 'LYAXIS Architect Master Planner',
                squadName: 'Comando Supremo',
                pillar: 'LYAXIS Architect' as const,
                status: currentStepIndex >= 0 ? 'completed' as const : 'pending' as const,
                action: 'Descomposición de Requerimientos y Diseño Arquitectónico',
                output: 'Analizando directiva y planificando interfaces desacopladas...',
                timestamp: new Date().toISOString()
              },
              {
                stepId: 'step-aegis-1',
                agentId: 'aegis-forensic-engine',
                agentName: 'Aegis Engine Forensics',
                squadName: 'Seguridad Ofensiva & Defensiva',
                pillar: 'Aegis Engine' as const,
                status: currentStepIndex >= 1 ? 'completed' as const : currentStepIndex === 0 ? 'running' as const : 'pending' as const,
                action: 'Escaneo Forense Preventivo y Modelado de Amenazas',
                output: 'Auditando vectores CWE-89 y sanitización de inputs...',
                timestamp: new Date().toISOString()
              },
              {
                stepId: 'step-dev-1',
                agentId: 'developer',
                agentName: 'Developer Sovereign Worker',
                squadName: 'TDD & Resiliencia',
                pillar: 'Aegis Engine' as const,
                status: currentStepIndex >= 2 ? 'completed' as const : currentStepIndex === 1 ? 'running' as const : 'pending' as const,
                action: 'Ciclo TDD Estricto: Red -> Green -> Refactor',
                output: 'Generando pruebas unitarias de comportamiento antes del código...',
                timestamp: new Date().toISOString()
              },
              {
                stepId: 'step-refute-1',
                agentId: 'refuter-security',
                agentName: 'Refuter Security Adversary',
                squadName: 'Seguridad Ofensiva & Defensiva',
                pillar: 'Aegis Engine' as const,
                status: currentStepIndex >= 3 ? 'completed' as const : currentStepIndex === 2 ? 'running' as const : 'pending' as const,
                action: 'Refutación Adversarial y Comprobación de Falsos Positivos',
                output: 'Simulando bypasses criptográficos y casos límite en inputs...',
                timestamp: new Date().toISOString()
              },
              {
                stepId: 'step-gate-1',
                agentId: 'asdd-gate',
                agentName: 'ASDD Verification Gate Enforcer',
                squadName: 'Gobernanza del Harness',
                pillar: 'LYAXIS Architect' as const,
                status: currentStepIndex >= 4 ? 'completed' as const : 'pending' as const,
                action: 'Compuerta Final de Calidad & Registro en Memoria',
                output: 'Verificando invariantes y registrando en 02-DOCS/02-SESSION-MEMORY.md...',
                timestamp: new Date().toISOString()
              }
            ] : [])).map((step, idx) => (
              <div 
                key={step.stepId}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  step.status === 'completed'
                    ? 'bg-slate-900/50 border-cyan-500/30'
                    : step.status === 'running'
                    ? 'bg-cyan-950/20 border-cyan-400 animate-pulse'
                    : 'bg-white/[0.01] border-white/[0.05] opacity-40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <strong className="text-white text-xs">{step.agentName}</strong>
                    <span className="text-[10px] text-slate-500">[{step.pillar}]</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    {step.metrics && (
                      <span>Latencia: {step.metrics.latencyMs}ms · Invariantes: {step.metrics.invariantsChecked}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] ${
                      step.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : step.status === 'running'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-cyan-300/90 font-semibold">
                  Acción: {step.action}
                </div>

                <p className="mt-1 text-slate-300 text-xs leading-relaxed font-sans">
                  {step.output}
                </p>
              </div>
            ))}
          </div>

          {/* Verification Passed Summary Card */}
          {simulationResult && (
            <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <strong className="text-sm font-bold text-white">Compuerta Soberana ASDD Superada</strong>
                </div>
                <span className="text-[10px] font-mono text-emerald-300">POLÍTICA 100% CUMPLIDA</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08]">
                  <span className="text-slate-400 text-[10px] font-mono uppercase block mb-1">Informe LYAXIS Architect:</span>
                  <p className="text-slate-200">{simulationResult.architectReport}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08]">
                  <span className="text-slate-400 text-[10px] font-mono uppercase block mb-1">Certificación Aegis Engine:</span>
                  <p className="text-slate-200">{simulationResult.aegisSecurityReport}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
