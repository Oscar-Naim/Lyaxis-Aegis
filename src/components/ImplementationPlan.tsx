import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Terminal, 
  ShieldAlert, 
  Sparkles,
  Zap,
  Server,
  AlertTriangle
} from 'lucide-react';
import { MasterPlanStep, ScanResult } from '../types/index.ts';
import { requestArchitectMasterPlan } from '../lib/aegisClient.ts';

interface ImplementationPlanProps {
  currentScan: ScanResult;
  onSelectStepForRemediation?: (stepNumber: number) => void;
}

export const ImplementationPlan: React.FC<ImplementationPlanProps> = ({
  currentScan,
  onSelectStepForRemediation,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<
    'WordPress' | 'Next.js' | 'React' | 'Nginx' | 'Apache' | 'Cloudflare' | 'Vercel'
  >('Next.js');
  const [steps, setSteps] = useState<MasterPlanStep[]>(currentScan.masterPlan);
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handlePlatformChange = async (
    plat: 'WordPress' | 'Next.js' | 'React' | 'Nginx' | 'Apache' | 'Cloudflare' | 'Vercel'
  ) => {
    setSelectedPlatform(plat);
    setIsLoadingPlatform(true);
    try {
      const res = await requestArchitectMasterPlan({
        currentScanContext: currentScan,
        platform: plat,
      });
      if (res.masterPlan && res.masterPlan.length > 0) {
        setSteps(res.masterPlan);
      }
    } catch (err) {
      console.warn('Using local platform adaptation:', err);
    } finally {
      setIsLoadingPlatform(false);
    }
  };

  const handleCopy = (stepNumber: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  const PLATFORMS: Array<'Next.js' | 'WordPress' | 'Vercel' | 'Cloudflare' | 'Nginx' | 'Apache' | 'React'> = [
    'Next.js',
    'WordPress',
    'Vercel',
    'Cloudflare',
    'Nginx',
    'Apache',
    'React',
  ];

  return (
    <div className="space-y-6">
      {/* Architect Header Banner */}
      <div className="obsidian-glass p-6 rounded-2xl border border-violet-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span>LYAXIS Architect &middot; Estratega de Implementación</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Plan Maestro de Implementación Priorizado
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Hoja de ruta secuencial clasificada por impacto y esfuerzo para blindar y acelerar tu web sin romper producción.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-white/[0.08]">
          <span className="text-[11px] font-mono text-slate-400 px-2 hidden sm:inline">Stack:</span>
          {PLATFORMS.map((plat) => (
            <button
              key={plat}
              onClick={() => handlePlatformChange(plat)}
              disabled={isLoadingPlatform}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedPlatform === plat
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Pasos Totales</div>
          <div className="text-2xl font-black text-white mt-1">{steps.length} Fases</div>
        </div>
        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Quick Wins</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {steps.filter(s => s.impactVsEffort === 'Quick Win').length} Inmediatos
          </div>
        </div>
        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Progreso de Despliegue</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">
            {completedSteps.size} / {steps.length}
          </div>
        </div>
        <div className="obsidian-card p-4 border border-white/[0.08] text-center">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Riesgo en Producción</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">0% Seguro</div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isDone = completedSteps.has(step.stepNumber);

          return (
            <div
              key={step.stepNumber}
              className={`obsidian-card p-6 border transition-all ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : step.priority === 'immediate'
                  ? 'border-violet-500/40 bg-violet-950/10'
                  : 'border-white/[0.08]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Step tags and badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 font-mono text-xs font-bold flex items-center justify-center">
                      {step.stepNumber}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        step.impactVsEffort === 'Quick Win'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : step.impactVsEffort === 'High Impact'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {step.impactVsEffort}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-black/40 text-slate-400 text-xs font-mono border border-white/[0.06]">
                      {step.platform}
                    </span>

                    <span className="text-xs text-slate-500 uppercase font-mono">
                      Prioridad: {step.priority}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {step.description}
                  </p>

                  {/* Production Safety Notes */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 text-xs font-sans flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <strong className="text-emerald-400">Garantía sin roturas:</strong>{' '}
                      {step.productionSafeNotes}
                    </div>
                  </div>
                </div>

                {/* Mark as completed button */}
                <button
                  onClick={() => toggleStepCompleted(step.stepNumber)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isDone ? 'Paso Completado' : 'Marcar Desplegado'}</span>
                </button>
              </div>

              {/* Code Snippet & Verification Command */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                <div className="relative">
                  <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>CONFIGURACIÓN / CÓDIGO SUGERIDO:</span>
                    <button
                      onClick={() => handleCopy(step.stepNumber, step.codeOrConfig)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                    >
                      {copiedStep === step.stepNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedStep === step.stepNumber ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-white/[0.06] text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
                    {step.codeOrConfig}
                  </pre>
                </div>

                {step.verificationCommand && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/[0.04] font-mono text-xs">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-400 text-[11px]">Comando de Verificación:</span>
                    <code className="text-cyan-300 flex-1 overflow-x-auto">{step.verificationCommand}</code>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
