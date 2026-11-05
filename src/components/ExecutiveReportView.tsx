import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { ScanResult } from '../types/index.ts';
import { printExecutiveReport, downloadReportHtml } from '../lib/exportReport.ts';

interface ExecutiveReportViewProps {
  scan: ScanResult;
  onClose: () => void;
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({
  scan,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto obsidian-glass border border-white/[0.12] rounded-3xl p-6 sm:p-10 shadow-2xl relative space-y-8 bg-[#05070B]">
        {/* Top Floating Action Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Informe Ejecutivo Forense</h2>
              <div className="text-xs text-slate-400 font-mono">
                LYAXIS LABS &middot; Aegis Engine &middot; ID: {scan.scanId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadReportHtml(scan)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>HTML</span>
            </button>

            <button
              onClick={printExecutiveReport}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md glow-cyan"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editorial Report Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <span>OBJETIVO: {scan.targetName}</span>
            <span>FECHA: {new Date(scan.timestamp).toLocaleString()}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Auditoría Forense de Ciberseguridad &amp; Rendimiento Web
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {scan.summary}
          </p>

          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200">
            <strong>Diagnóstico en Lenguaje Claro:</strong> {scan.plainSummary}
          </div>
        </div>

        {/* 4 Pillars Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="obsidian-card p-4 border border-white/[0.08] text-center">
            <div className="text-xs text-slate-400 font-mono">SCORE GLOBAL</div>
            <div className="text-3xl font-black font-mono text-cyan-400 mt-1">{scan.overallScore}/100</div>
          </div>
          <div className="obsidian-card p-4 border border-white/[0.08] text-center">
            <div className="text-xs text-slate-400 font-mono">INMUNIDAD (SEGURIDAD)</div>
            <div className={`text-3xl font-black font-mono mt-1 ${scan.securityScore >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {scan.securityScore}/100
            </div>
          </div>
          <div className="obsidian-card p-4 border border-white/[0.08] text-center">
            <div className="text-xs text-slate-400 font-mono">VELOCIDAD (RENDIMIENTO)</div>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-1">{scan.performanceScore}/100</div>
          </div>
          <div className="obsidian-card p-4 border border-white/[0.08] text-center">
            <div className="text-xs text-slate-400 font-mono">SEO &amp; PRIVACIDAD</div>
            <div className="text-3xl font-black font-mono text-violet-400 mt-1">
              {Math.round((scan.socialSeoScore + scan.privacyScore) / 2)}/100
            </div>
          </div>
        </div>

        {/* Detailed Findings Table */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Matriz de Vulnerabilidades &amp; Hallazgos ({scan.issues.length})</span>
          </h3>

          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/40">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="p-3 font-mono">ID</th>
                  <th className="p-3">Severidad</th>
                  <th className="p-3">Hallazgo</th>
                  <th className="p-3 font-mono">Vector / CWE</th>
                  <th className="p-3">Remediación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {scan.issues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-cyan-400 font-bold">{iss.id}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          iss.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {iss.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{iss.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{iss.plainSpanishExplanation}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{iss.cwe || 'N/A'}</td>
                    <td className="p-3 text-[11px] text-slate-300 font-mono max-w-xs truncate">
                      {iss.remediation.diffSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Core Web Vitals Table */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Evaluación de Rendimiento &amp; Core Web Vitals</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scan.metrics.map((m, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                <div className="text-slate-400 font-medium">{m.name}</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{m.value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{m.plainImpact}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LYAXIS Architect Master Plan */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-400" />
            <span>Plan Maestro de Implementación — LYAXIS Architect</span>
          </h3>

          <div className="space-y-2">
            {scan.masterPlan.map((step) => (
              <div key={step.stepNumber} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.stepNumber}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-white">
                    [{step.impactVsEffort}] {step.title} ({step.platform})
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Footer */}
        <div className="pt-6 border-t border-white/[0.08] text-center text-xs text-slate-500 font-sans">
          Iniciativa 100% gratuita y abierta por <strong>LYAXIS LABS</strong>. Aegis Engine &amp; LYAXIS Architect.
        </div>
      </div>
    </div>
  );
};
