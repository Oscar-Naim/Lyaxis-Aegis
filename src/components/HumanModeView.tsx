import React from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  ThumbsUp
} from 'lucide-react';
import { ScanResult, SecurityIssue, PerformanceIssue } from '../types/index.ts';

interface HumanModeViewProps {
  currentScan: ScanResult;
  onApplyFix: (issueId: string) => void;
  onSelectIssueForRemediation: (issue: SecurityIssue | PerformanceIssue) => void;
  resolvedIssueIds: Set<string>;
}

export const HumanModeView: React.FC<HumanModeViewProps> = ({
  currentScan,
  onApplyFix,
  onSelectIssueForRemediation,
  resolvedIssueIds,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Banner: Human Friendly Diagnosis */}
      <div className="obsidian-glass border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Diagnóstico en Español Cotidiano (Sin Jerga Técnica)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              ¿Cómo está la salud de tu web hoy?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentScan.plainSummary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="obsidian-card p-4 border border-white/[0.08] text-center min-w-[120px]">
              <div className="text-xs text-slate-400 font-medium">Estado General</div>
              <div className={`text-2xl font-black mt-1 ${currentScan.overallScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentScan.overallScore >= 75 ? 'Saludable' : 'Atención Urgente'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security / Immunity Cards */}
        {currentScan.issues.map((issue) => {
          const isResolved = resolvedIssueIds.has(issue.id);
          const isCritical = issue.severity === 'critical';

          return (
            <div
              key={issue.id}
              className={`obsidian-card p-5 border transition-all duration-300 ${
                isResolved
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isCritical
                  ? 'border-rose-500/30 hover:border-rose-500/50'
                  : 'border-white/[0.08] hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isResolved ? 'Solucionado' : isCritical ? 'Peligro Inmediato' : 'Importante'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">+{issue.estimatedScoreImpact} pts</span>
                </div>

                <button
                  onClick={() => onSelectIssueForRemediation(issue)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  <span>Ver código</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {issue.title}
              </h3>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed mb-4">
                <p className="bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                  <strong className="text-cyan-300 block mb-1">¿Qué está pasando?:</strong>
                  {issue.plainSpanishExplanation}
                </p>

                <p className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-200">
                  <strong className="text-emerald-400 block mb-1">¿Cómo lo resuelves?:</strong>
                  {issue.plainSpanishFix}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {issue.category === 'security' ? '🛡️ Inmunidad y Protección' : '🌐 Presencia y Accesibilidad'}
                </span>

                <button
                  onClick={() => onApplyFix(issue.id)}
                  disabled={isResolved}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isResolved
                      ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
                  }`}
                >
                  {isResolved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Solución Aplicada</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Aplicar Solución (+{issue.estimatedScoreImpact} pts)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Performance Cards */}
        {currentScan.performanceIssues.map((perf) => {
          const isResolved = resolvedIssueIds.has(perf.id);

          return (
            <div
              key={perf.id}
              className={`obsidian-card p-5 border transition-all duration-300 ${
                isResolved
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-white/[0.08] hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isResolved ? 'Acelerado' : 'Freno de Velocidad'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">+{perf.estimatedScoreImpact} pts</span>
                </div>

                <button
                  onClick={() => onSelectIssueForRemediation(perf)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  <span>Ver diff</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {perf.title}
              </h3>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed mb-4">
                <p className="bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                  <strong className="text-amber-300 block mb-1">Impacto en la experiencia:</strong>
                  {perf.plainSpanishExplanation}
                </p>

                <p className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-200">
                  <strong className="text-emerald-400 block mb-1">Acción recomendada:</strong>
                  {perf.plainSpanishFix}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">⚡ Velocidad &amp; Core Web Vitals</span>

                <button
                  onClick={() => onApplyFix(perf.id)}
                  disabled={isResolved}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isResolved
                      ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                  }`}
                >
                  {isResolved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Optimización Lista</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Acelerar Web (+{perf.estimatedScoreImpact} pts)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
