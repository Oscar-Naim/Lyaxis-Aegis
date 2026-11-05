import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Terminal, 
  FileCode, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { ScanResult, SecurityIssue, PerformanceIssue } from '../types/index.ts';
import { DiffViewer } from './DiffViewer.tsx';

interface RemediationViewerProps {
  currentScan: ScanResult;
  onApplyFix: (issueId: string) => void;
  onAskCopilot: (topic: string, details?: string) => void;
  selectedIssueId?: string;
  resolvedIssueIds: Set<string>;
}

export const RemediationViewer: React.FC<RemediationViewerProps> = ({
  currentScan,
  onApplyFix,
  onAskCopilot,
  selectedIssueId,
  resolvedIssueIds,
}) => {
  const allRemediations: Array<SecurityIssue | PerformanceIssue> = [
    ...currentScan.issues,
    ...currentScan.performanceIssues,
  ];

  const [activeIssueId, setActiveIssueId] = useState<string>(
    selectedIssueId || allRemediations[0]?.id || 'SEC-101'
  );

  useEffect(() => {
    if (selectedIssueId) {
      setActiveIssueId(selectedIssueId);
    }
  }, [selectedIssueId]);

  const activeIssue = allRemediations.find(r => r.id === activeIssueId) || allRemediations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="obsidian-glass p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Motor de Parches &middot; Algoritmo Myers LCS Diff</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Remediación Forense &amp; Visor de Diffs Interactivo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Revisa la diferencia exacta línea por línea entre el código vulnerable detectado y el parche blindado generado por Aegis Engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="obsidian-card px-4 py-2 border border-white/[0.08] text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Resueltos</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {resolvedIssueIds.size} / {allRemediations.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Issue Selector on Left, DiffViewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Issue List Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            INCIDENCIAS REMEDIABLES:
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {allRemediations.map((item) => {
              const isSelected = item.id === activeIssue?.id;
              const isApplied = resolvedIssueIds.has(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIssueId(item.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-md'
                      : 'border-white/[0.06] bg-black/40 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-cyan-400">
                      {item.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isApplied && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aplicado</span>
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : item.severity === 'high'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                  </div>

                  <div className="font-bold text-white line-clamp-1">{item.title}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                    {item.fileLocation}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active DiffViewer (8 cols) */}
        <div className="lg:col-span-8">
          {activeIssue ? (
            <div className="space-y-4">
              <DiffViewer
                remediation={activeIssue.remediation}
                fileLocation={activeIssue.fileLocation}
                issueId={activeIssue.id}
                onApplyFix={onApplyFix}
                isApplied={resolvedIssueIds.has(activeIssue.id)}
              />

              {/* Ask Architect contextual button */}
              <div className="obsidian-card p-4 border border-white/[0.08] flex items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  ¿Necesitas consideraciones adicionales de arquitectura sobre este parche?
                </div>
                <button
                  onClick={() => onAskCopilot(activeIssue.title, activeIssue.description)}
                  className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/40 text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Consultar con LYAXIS Architect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="obsidian-card p-12 text-center text-slate-500">
              Selecciona una incidencia a la izquierda para visualizar el parche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
