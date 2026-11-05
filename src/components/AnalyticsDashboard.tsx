import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Layers,
  Activity,
  Award,
  Zap,
  Cpu,
  Eye,
  Filter
} from 'lucide-react';
import { ScanResult, SecurityIssue, PerformanceIssue } from '../types/index.ts';

interface AnalyticsDashboardProps {
  currentScan: ScanResult;
  onSelectIssue: (issue: SecurityIssue | PerformanceIssue) => void;
  onAskCopilot: (topic: string, details?: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  currentScan,
  onSelectIssue,
  onAskCopilot,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'security' | 'performance' | 'social_seo' | 'accessibility_privacy'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'issues' | 'webvitals' | 'compliance' | 'architecture'>('issues');

  const filteredIssues = currentScan.issues.filter((issue) => {
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.fileLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.cwe && issue.cwe.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  const criticalCount = currentScan.issues.filter(i => i.severity === 'critical').length;
  const highCount = currentScan.issues.filter(i => i.severity === 'high').length;
  const mediumCount = currentScan.issues.filter(i => i.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-mono">
            <span>DIAGNÓSTICO ANALÍTICO</span>
            <span>&middot;</span>
            <span>MATRIZ DE RIESGO FORENSE</span>
            <span>&middot;</span>
            <span>AEGIS ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Diagnóstico Integral de Vulnerabilidades &amp; Web Vitals
          </h1>
        </div>

        {/* Sub-view Segmented Switch */}
        <div className="flex items-center p-1 bg-black/40 border border-white/[0.08] rounded-xl self-start">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'issues'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incidencias ({currentScan.issues.length})
          </button>
          <button
            onClick={() => setActiveTab('webvitals')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'webvitals'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Web Vitals ({currentScan.metrics.length})
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Conformidad &amp; Normas
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recomendaciones Arquitectura
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="obsidian-card p-4 border border-rose-500/30 text-center">
          <div className="text-[11px] font-mono text-rose-400 uppercase">Críticas (Bloqueantes)</div>
          <div className="text-3xl font-black font-mono text-rose-400 mt-1">{criticalCount}</div>
        </div>
        <div className="obsidian-card p-4 border border-amber-500/30 text-center">
          <div className="text-[11px] font-mono text-amber-400 uppercase">Severidad Alta</div>
          <div className="text-3xl font-black font-mono text-amber-400 mt-1">{highCount}</div>
        </div>
        <div className="obsidian-card p-4 border border-cyan-500/30 text-center">
          <div className="text-[11px] font-mono text-cyan-400 uppercase">Media / Informativa</div>
          <div className="text-3xl font-black font-mono text-cyan-400 mt-1">{mediumCount}</div>
        </div>
        <div className="obsidian-card p-4 border border-emerald-500/30 text-center">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Parches Disponibles</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">{currentScan.issues.length}</div>
        </div>
      </div>

      {/* Tab: Issues Triage */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="obsidian-card p-3 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, ruta de archivo o CWE..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] font-mono hidden sm:inline">Severidad:</span>
              {(['all', 'critical', 'high', 'medium'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold transition-colors ${
                    severityFilter === sev
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="obsidian-card p-4 border border-white/[0.08] hover:border-cyan-500/40 transition-all rounded-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{issue.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        issue.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : issue.severity === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    {issue.cwe && (
                      <span className="text-slate-400 text-xs font-mono px-1.5 py-0.2 bg-white/[0.02] rounded">
                        {issue.cwe}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAskCopilot(issue.title, issue.description)}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <span>Consultar Architect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onSelectIssue(issue)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold transition-colors"
                    >
                      Ver Parche Diff
                    </button>
                  </div>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-sm font-bold text-white">{issue.title}</h4>
                  <div className="text-[11px] font-mono text-cyan-400/80 mt-0.5">{issue.fileLocation}</div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Core Web Vitals */}
      {activeTab === 'webvitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentScan.metrics.map((metric, idx) => (
            <div key={idx} className="obsidian-card p-5 border border-white/[0.08] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{metric.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    metric.status === 'good'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : metric.status === 'needs-improvement'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {metric.status}
                </span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">{metric.value}</div>
              <p className="text-xs text-slate-300">{metric.plainImpact}</p>
              <div className="p-2.5 rounded-lg bg-black/40 text-[11px] text-cyan-300 font-mono border border-white/[0.04]">
                Recomendación: {metric.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Compliance & Norms */}
      {activeTab === 'compliance' && (
        <div className="obsidian-card p-6 border border-white/[0.08] rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Auditoría de Normas &amp; Estándares Internacionales:</span>
          </h3>

          <div className="space-y-2">
            {currentScan.complianceAudits.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{item.standard} &middot; {item.rule}</div>
                  <div className="text-slate-400 text-[11px]">{item.notes}</div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    item.status === 'passed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : item.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Architecture Recommendations */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          {currentScan.architectureRecommendations.map((rec) => (
            <div key={rec.id} className="obsidian-card p-6 border border-white/[0.08] rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-xs font-mono font-bold text-violet-400 uppercase">{rec.domain}</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">{rec.scalabilityImpact}</span>
              </div>
              <h3 className="text-base font-bold text-white">{rec.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300">
                <strong>Riesgo Actual:</strong> {rec.currentRisk}
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-white/[0.06] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {rec.codeOrConfigExample}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
