import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Layers, 
  Terminal, 
  FileCheck2, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Activity, 
  FolderPlus,
  RefreshCw,
  Lock,
  Bot
} from 'lucide-react';
import { SQUADS, HARNESS_METRICS, SOVEREIGN_AGENTS } from '../data/sovereignHarnessData.ts';

interface HarnessHUDProps {
  onNavigateTab: (tab: string) => void;
  onOpenInjector: () => void;
  onRunQuickSimulation: (presetPrompt: string) => void;
}

export const HarnessHUD: React.FC<HarnessHUDProps> = ({
  onNavigateTab,
  onOpenInjector,
  onRunQuickSimulation
}) => {
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner: Sovereign Central House of Agents */}
      <div className="relative overflow-hidden rounded-2xl obsidian-glass border border-cyan-500/30 p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-[#050B14] to-slate-950">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                LYAXIS LABS · CASA CENTRAL DE AGENTES
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% SOBERANO & ABIERTO
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                v{HARNESS_METRICS.version}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Gobernanza Total del Enjambre:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-violet-400">
                34 Agentes &amp; 274 Skills
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Plataforma soberana bajo el mando de los 2 Pilares Supremos:{' '}
              <strong className="text-violet-300">LYAXIS Architect</strong> (Estrategia, diseño de sistemas y gobernanza de memoria) y{' '}
              <strong className="text-cyan-300">Aegis Engine</strong> (Ejecución implacable, escaneo forense y autocuración en tiempo real).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenInjector}
                className="primary-button shadow-lg shadow-cyan-950/40 text-xs sm:text-sm font-semibold"
              >
                <FolderPlus className="w-4 h-4" />
                Inyectar Harness en Repositorio
              </button>
              <button
                onClick={() => onNavigateTab('simulator')}
                className="secondary-button text-xs sm:text-sm font-medium"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                Live Terminal de Agentes
              </button>
              <button
                onClick={() => onNavigateTab('catalog')}
                className="secondary-button text-xs sm:text-sm font-medium"
              >
                <Layers className="w-4 h-4 text-violet-400" />
                Explorar Catálogo ({HARNESS_METRICS.totalSkills} Skills)
              </button>
            </div>
          </div>

          {/* Quick Metrics Badge Card */}
          <div className="grid grid-cols-2 gap-3 sm:w-80 shrink-0">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Agentes Especializados</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">{HARNESS_METRICS.totalAgents}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">En 6 Escuadrones</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Skills Certificadas</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{HARNESS_METRICS.totalSkills}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">0 Proveedores Externos</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Memoria de Sesión</div>
              <div className="text-2xl font-black text-violet-400 mt-1">02-DOCS</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Constitución &amp; Memory</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Herramientas Locales</div>
              <div className="text-2xl font-black text-amber-400 mt-1">01-TOOLS</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Compuertas ASDD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Radial HUD Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Aegis Security Inmunity */}
        <div className="p-5 rounded-xl obsidian-glass border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Inmunidad Forense
            </span>
            <span className="text-3xl font-black text-white mt-1 block">99.4%</span>
            <span className="text-xs text-slate-400 mt-1 block">Aegis Engine activo</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#06b6d4"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={163.3}
                strokeDashoffset={163.3 * (1 - 0.994)}
                strokeLinecap="round"
              />
            </svg>
            <ShieldCheck className="w-6 h-6 text-cyan-400 absolute" />
          </div>
        </div>

        {/* Gauge 2: Quantum Performance */}
        <div className="p-5 rounded-xl obsidian-glass border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
              Índice Web Vitals
            </span>
            <span className="text-3xl font-black text-white mt-1 block">98/100</span>
            <span className="text-xs text-slate-400 mt-1 block">LCP &lt; 0.9s · CLS 0.00</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#10b981"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={163.3}
                strokeDashoffset={163.3 * (1 - 0.98)}
                strokeLinecap="round"
              />
            </svg>
            <Zap className="w-6 h-6 text-emerald-400 absolute" />
          </div>
        </div>

        {/* Gauge 3: Harness Integrity */}
        <div className="p-5 rounded-xl obsidian-glass border border-violet-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold block">
              Gobernanza Memoria
            </span>
            <span className="text-3xl font-black text-white mt-1 block">100%</span>
            <span className="text-xs text-slate-400 mt-1 block">Constitución y ASDD alineados</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#8b5cf6"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={163.3}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
            </svg>
            <Cpu className="w-6 h-6 text-violet-400 absolute" />
          </div>
        </div>

        {/* Gauge 4: Swarm Readiness */}
        <div className="p-5 rounded-xl obsidian-glass border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
              Disponibilidad Enjambre
            </span>
            <span className="text-3xl font-black text-white mt-1 block">34/34</span>
            <span className="text-xs text-slate-400 mt-1 block">6 escuadrones operativos</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#f59e0b"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={163.3}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
            </svg>
            <Activity className="w-6 h-6 text-amber-400 absolute" />
          </div>
        </div>
      </div>

      {/* Radar Section: Tactical Squads */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Radar Táctico de Escuadrones Soberanos
            </h2>
            <p className="text-xs text-slate-400">
              Distribución de los 34 agentes especializados bajo las directivas de LYAXIS Architect y Aegis Engine.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition"
          >
            Ver catálogo completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SQUADS.map((squad) => {
            const squadAgents = SOVEREIGN_AGENTS.filter(a => a.squadId === squad.id);
            const isSelected = selectedSquad === squad.id;

            return (
              <div
                key={squad.id}
                onClick={() => setSelectedSquad(isSelected ? null : squad.id)}
                className={`p-5 rounded-xl cursor-pointer transition-all obsidian-glass border ${
                  isSelected ? `${squad.borderColor} bg-white/[0.04] shadow-lg shadow-cyan-950/30` : 'border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                      style={{ backgroundColor: `${squad.color}15`, color: squad.color, border: `1px solid ${squad.color}40` }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{squad.shortName}</h3>
                      <span className="text-[10px] font-mono text-slate-400">Pilar: {squad.pillar}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${squad.bgBadge}`}>
                    {squadAgents.length} Agentes
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {squad.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">Agentes de choque:</span>
                  <div className="flex items-center gap-1">
                    {squadAgents.slice(0, 3).map((agent) => (
                      <span
                        key={agent.id}
                        className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-slate-300"
                        title={agent.name}
                      >
                        {agent.id.replace('-build-resolver', '').replace('-reviewer', '')}
                      </span>
                    ))}
                    {squadAgents.length > 3 && (
                      <span className="text-[10px] font-mono text-slate-500">+{squadAgents.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Swarm Live Simulation Quick Triggers */}
      <div className="p-6 rounded-2xl obsidian-glass border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Simulador de Tareas del Enjambre</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Coordinación en Tiempo Real</span>
        </div>

        <p className="text-xs text-slate-400">
          Dispara un ciclo autónomo completo: LYAXIS Architect (especificación y contratos) ➔ Aegis Engine (análisis forense y mitigación de amenazas) ➔ Agente Developer (TDD Red-Green-Refactor) ➔ Verificación ASDD.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => onRunQuickSimulation('Refactorizar módulo de checkout aplicando TDD estricto y sanitización contra SQL Injection (CWE-89)')}
            className="p-3 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-500/40 transition group"
          >
            <div className="text-xs font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
              <span>Seguridad &amp; TDD Refactor</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Sanitiza CWE-89 y genera pruebas unitarias de comportamiento antes del código de producción.
            </p>
          </button>

          <button
            onClick={() => onRunQuickSimulation('Optimizar Core Web Vitals en interfaz React 19: LCP por debajo de 800ms y CLS cero mediante streaming')}
            className="p-3 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/40 transition group"
          >
            <div className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center justify-between">
              <span>Rendimiento Web Vitals</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Audita hidratación, tree-shaking de paquetes y compresión cuántica de assets.
            </p>
          </button>

          <button
            onClick={() => onRunQuickSimulation('Diseñar arquitectura de microservicios resilientes en Go y Rust con concurrencia sin carreras')}
            className="p-3 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-violet-500/40 transition group"
          >
            <div className="text-xs font-semibold text-white group-hover:text-violet-300 flex items-center justify-between">
              <span>Arquitectura Go / Rust</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Plan maestro con canales Go, borrow checker en Rust y garantías transaccionales ACID.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
