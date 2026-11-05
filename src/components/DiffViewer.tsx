import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Copy, 
  FileCode2, 
  TestTube2, 
  ArrowRight, 
  Columns, 
  AlignJustify,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CodeRemediation } from '../types/index.ts';
import { computeMyersDiff } from '../lib/diffEngine.ts';

interface DiffViewerProps {
  remediation: CodeRemediation;
  fileLocation: string;
  issueId: string;
  onApplyFix?: (issueId: string) => void;
  isApplied?: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  remediation,
  fileLocation,
  issueId,
  onApplyFix,
  isApplied = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'remediated' | 'test'>('diff');
  const [diffLayout, setDiffLayout] = useState<'side-by-side' | 'unified'>('side-by-side');

  const diffResult = useMemo(() => {
    return computeMyersDiff(remediation.originalSnippet, remediation.remediatedSnippet);
  }, [remediation.originalSnippet, remediation.remediatedSnippet]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-white/[0.08] rounded-2xl overflow-hidden obsidian-glass shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-black/40 border-b border-white/[0.08] text-xs">
        <div className="flex items-center gap-2 font-mono">
          <FileCode2 className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-semibold">{fileLocation}</span>
          <span className="text-slate-600">&middot;</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
            {issueId}
          </span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            (+{diffResult.additions} líns / -{diffResult.deletions} líns)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Switcher (Side-by-Side vs Unified) */}
          {activeTab === 'diff' && (
            <div className="flex items-center p-0.5 bg-black/50 rounded-lg border border-white/[0.06] text-[11px]">
              <button
                onClick={() => setDiffLayout('side-by-side')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  diffLayout === 'side-by-side'
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista en 2 columnas (Side-by-Side)"
              >
                <Columns className="w-3 h-3" />
                <span>Side-by-Side</span>
              </button>
              <button
                onClick={() => setDiffLayout('unified')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  diffLayout === 'unified'
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista unificada en 1 columna"
              >
                <AlignJustify className="w-3 h-3" />
                <span>Unified</span>
              </button>
            </div>
          )}

          {/* Sub-tabs */}
          <div className="flex items-center p-0.5 bg-black/50 rounded-lg border border-white/[0.06] text-[11px]">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'diff'
                  ? 'bg-white/[0.08] text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Myers Diff
            </button>
            <button
              onClick={() => setActiveTab('remediated')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'remediated'
                  ? 'bg-white/[0.08] text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Código Corregido
            </button>
            {remediation.verificationTest && (
              <button
                onClick={() => setActiveTab('test')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                  activeTab === 'test'
                    ? 'bg-white/[0.08] text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TestTube2 className="w-3 h-3 text-emerald-400" />
                <span>Test</span>
              </button>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={() => handleCopy(remediation.remediatedSnippet)}
            className="flex items-center gap-1 px-3 py-1 text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors"
            title="Copiar código remediado"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          {/* Apply Patch Button */}
          {onApplyFix && (
            <button
              onClick={() => onApplyFix(issueId)}
              disabled={isApplied}
              className={`flex items-center gap-1.5 px-3.5 py-1 font-bold rounded-lg transition-all text-xs ${
                isApplied
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 glow-emerald active:scale-95'
              }`}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Parche Aplicado</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aplicar Parche &amp; Recalcular</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="px-5 py-2.5 bg-cyan-950/20 border-b border-white/[0.06] text-xs text-slate-300 flex items-start gap-2">
        <span className="font-bold text-cyan-400 shrink-0">Remediación Forense:</span>
        <span>{remediation.explanation}</span>
      </div>

      {/* Diff Content View Area */}
      <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed bg-[#05070B]">
        {activeTab === 'diff' && (
          <>
            {diffLayout === 'side-by-side' ? (
              /* Side-by-Side View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Left: Original / Deletions */}
                <div className="rounded-xl border border-rose-950/60 bg-rose-950/10 overflow-hidden">
                  <div className="px-3 py-1.5 bg-rose-950/40 border-b border-rose-950/60 text-rose-400 font-bold text-[11px] flex items-center justify-between">
                    <span>CÓDIGO ORIGINAL VULNERABLE</span>
                    <span className="text-rose-500/80">Líneas a eliminar</span>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {diffResult.left.map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 px-2 py-0.5 rounded text-[11px] ${
                          line.type === 'del'
                            ? 'bg-rose-500/20 text-rose-300 font-medium'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="text-slate-600 select-none w-6 text-right font-mono">
                          {line.oldLineNumber || ''}
                        </span>
                        <span className="select-none text-rose-400 font-bold w-3">
                          {line.type === 'del' ? '-' : ' '}
                        </span>
                        <pre className="whitespace-pre-wrap flex-1 overflow-x-auto">{line.text || ' '}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Remediated / Additions */}
                <div className="rounded-xl border border-emerald-950/60 bg-emerald-950/10 overflow-hidden">
                  <div className="px-3 py-1.5 bg-emerald-950/40 border-b border-emerald-950/60 text-emerald-400 font-bold text-[11px] flex items-center justify-between">
                    <span>PARCHE BLINDADO SUGERIDO</span>
                    <span className="text-emerald-500/80">Líneas añadidas</span>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {diffResult.right.map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 px-2 py-0.5 rounded text-[11px] ${
                          line.type === 'add'
                            ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="text-slate-600 select-none w-6 text-right font-mono">
                          {line.newLineNumber || ''}
                        </span>
                        <span className="select-none text-emerald-400 font-bold w-3">
                          {line.type === 'add' ? '+' : ' '}
                        </span>
                        <pre className="whitespace-pre-wrap flex-1 overflow-x-auto">{line.text || ' '}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Unified View */
              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-2 space-y-0.5">
                {diffResult.unified.map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-3 py-0.5 rounded text-[11px] ${
                      line.type === 'del'
                        ? 'bg-rose-500/20 text-rose-300'
                        : line.type === 'add'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="text-slate-600 select-none w-6 text-right font-mono">
                      {line.type === 'del' ? line.oldLineNumber : line.newLineNumber || ''}
                    </span>
                    <span
                      className={`select-none font-bold w-3 ${
                        line.type === 'del' ? 'text-rose-400' : line.type === 'add' ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    >
                      {line.type === 'del' ? '-' : line.type === 'add' ? '+' : ' '}
                    </span>
                    <pre className="whitespace-pre-wrap flex-1 overflow-x-auto">{line.text || ' '}</pre>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Remediated Only Tab */}
        {activeTab === 'remediated' && (
          <div className="rounded-xl border border-white/[0.08] bg-slate-950 p-4">
            <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">{remediation.remediatedSnippet}</pre>
          </div>
        )}

        {/* Verification Test Tab */}
        {activeTab === 'test' && remediation.verificationTest && (
          <div className="rounded-xl border border-white/[0.08] bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-3">
              <TestTube2 className="w-4 h-4" />
              <span>Test Automatizado de Regresión (Jest / Vitest)</span>
            </div>
            <pre className="text-emerald-200/90 whitespace-pre-wrap leading-relaxed">{remediation.verificationTest}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
