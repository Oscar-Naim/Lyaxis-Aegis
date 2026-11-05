import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Check, 
  Copy, 
  FileCode, 
  ExternalLink, 
  Layers, 
  Server, 
  GitCommit, 
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { ScanResult, SecurityIssue, PerformanceIssue } from '../types/index.ts';

interface HackerDevViewProps {
  currentScan: ScanResult;
  onApplyFix: (issueId: string) => void;
  onSelectIssueForRemediation: (issue: SecurityIssue | PerformanceIssue) => void;
  resolvedIssueIds: Set<string>;
}

export const HackerDevView: React.FC<HackerDevViewProps> = ({
  currentScan,
  onApplyFix,
  onSelectIssueForRemediation,
  resolvedIssueIds,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [activeServerTab, setActiveServerTab] = useState<'nginx' | 'apache' | 'cloudflare' | 'vercel'>('vercel');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredIssues = currentScan.issues.filter(i => {
    if (filterSeverity === 'all') return true;
    return i.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Dev Telemetry Bar */}
      <div className="obsidian-glass p-4 rounded-2xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-bold">AEGIS DEV ENGINE FORENSICS</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">TARGET: {currentScan.targetName}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">SCAN ID: {currentScan.scanId}</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
          <span className="text-[11px] text-slate-500 px-2 flex items-center gap-1 font-sans">
            <Filter className="w-3 h-3" /> Filtrar:
          </span>
          {(['all', 'critical', 'high', 'medium'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition-colors ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Forensic Triage Cards */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const isResolved = resolvedIssueIds.has(issue.id);

          return (
            <div
              key={issue.id}
              className={`obsidian-card p-5 border transition-all ${
                isResolved
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : issue.severity === 'critical'
                  ? 'border-rose-500/40 bg-rose-950/5'
                  : 'border-white/[0.08]'
              }`}
            >
              {/* Header line */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/60 font-mono text-[11px] text-cyan-400 font-bold border border-cyan-500/30">
                    {issue.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
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
                    <span className="px-2 py-0.5 rounded bg-white/[0.03] text-slate-400 text-[11px] border border-white/[0.06]">
                      {issue.cwe}
                    </span>
                  )}
                  {issue.cvss && (
                    <span className="px-2 py-0.5 rounded bg-white/[0.03] text-slate-300 text-[11px] border border-white/[0.06]">
                      CVSS {issue.cvss}
                    </span>
                  )}
                  {issue.owaspTop10 && (
                    <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 text-[10px] border border-violet-500/20 hidden md:inline-block">
                      {issue.owaspTop10}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectIssueForRemediation(issue)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Abrir en DiffViewer</span>
                  </button>

                  <button
                    onClick={() => onApplyFix(issue.id)}
                    disabled={isResolved}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Parche Aplicado</span>
                      </>
                    ) : (
                      <>
                        <GitCommit className="w-3.5 h-3.5" />
                        <span>Aplicar Parche (+{issue.estimatedScoreImpact} pts)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Title and File Path */}
              <div className="mt-3">
                <h3 className="text-sm font-bold text-white font-sans">{issue.title}</h3>
                <div className="text-slate-400 text-[11px] font-mono mt-0.5 flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-cyan-400/90">{issue.fileLocation}</span>
                  <span className="text-slate-600">&middot;</span>
                  <span className="text-slate-400">{issue.lineRange}</span>
                </div>
              </div>

              {/* Technical Description */}
              <p className="mt-2 text-slate-300 text-xs font-sans leading-relaxed">
                {issue.description}
              </p>

              {/* Diff Snippet Preview */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-950/60 text-rose-300">
                  <div className="text-[10px] font-mono font-semibold text-rose-400 mb-1">VULNERABLE SNIPPET:</div>
                  <pre className="whitespace-pre-wrap overflow-x-auto">{issue.vulnerableSnippet}</pre>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-950/60 text-emerald-300">
                  <div className="text-[10px] font-mono font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                    <span>REMEDIATED SOLUTION:</span>
                    <button
                      onClick={() => handleCopy(`fix-${issue.id}`, issue.remediation.remediatedSnippet)}
                      className="text-slate-400 hover:text-white"
                      title="Copiar código remediado"
                    >
                      {copiedKey === `fix-${issue.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap overflow-x-auto">{issue.remediation.remediatedSnippet}</pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Platform Server Snippets Generator */}
      <div className="obsidian-card p-6 border border-white/[0.08] rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Snippets de Configuración Server-Side Listos para Producción</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Copia y pega la configuración exacta para mitigar vulnerabilidades en tu infraestructura.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
            {(['vercel', 'nginx', 'cloudflare', 'apache'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveServerTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs uppercase font-bold transition-colors ${
                  activeServerTab === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Server Snippet Content */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-white/[0.06] text-slate-200 text-xs overflow-x-auto leading-relaxed">
            {activeServerTab === 'vercel' && `// vercel.json — Cabeceras de Inmunidad y Calidad
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https:; object-src 'none';" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}`}
            {activeServerTab === 'nginx' && `# /etc/nginx/conf.d/security.conf
# LYAXIS Aegis Hardening Directive
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; object-src 'none';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Gzip / Brotli Fast Compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;`}
            {activeServerTab === 'cloudflare' && `# Cloudflare Ruleset / Response Headers Transform Rule
# Regla 1: Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https:; object-src 'none';"
# Regla 2: Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
# Regla 3: X-Frame-Options = "DENY"
# Regla 4: X-Content-Type-Options = "nosniff"
# Regla 5: Referrer-Policy = "strict-origin-when-cross-origin"`}
            {activeServerTab === 'apache' && `# .htaccess / httpd.conf
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:;"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`}
          </pre>

          <button
            onClick={() => handleCopy('server-tab', activeServerTab === 'vercel' ? 'vercel.json' : 'server-config')}
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] transition-colors"
          >
            {copiedKey === 'server-tab' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'server-tab' ? 'Copiado' : 'Copiar Configuración'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
