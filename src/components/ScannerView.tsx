import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Zap, 
  Terminal, 
  GitBranch, 
  ArrowUpRight, 
  AlertTriangle, 
  FileCode, 
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Star,
  Layers,
  Search,
  Code2
} from 'lucide-react';
import { ScanResult, SecurityIssue, PerformanceIssue } from '../types/index.ts';

interface ScannerViewProps {
  currentScan: ScanResult;
  isScanning: boolean;
  onRunScan: (targetName: string, sourceCode: string, githubUrl?: string) => void;
  onSelectIssueForRemediation: (issue: SecurityIssue | PerformanceIssue) => void;
  onAskCopilotAboutIssue: (title: string, snippet: string) => void;
}

const POPULAR_REPOS = [
  {
    name: 'OWASP / NodeGoat',
    url: 'https://github.com/OWASP/NodeGoat',
    desc: 'Benchmark de seguridad oficial de OWASP para aplicaciones web Node.js',
    tag: 'Seguridad OWASP',
  },
  {
    name: 'vercel / next-learn',
    url: 'https://github.com/vercel/next-learn',
    desc: 'Next.js App Router, SSR, Server Actions y Auth',
    tag: 'Full-Stack Next.js',
  },
  {
    name: 'tastejs / todomvc',
    url: 'https://github.com/tastejs/todomvc',
    desc: 'Referente de rendimiento frontend y arquitectura MVC',
    tag: 'Web Performance',
  },
  {
    name: 'expressjs / express',
    url: 'https://github.com/expressjs/express',
    desc: 'Framework de servidor web para Node.js y APIs REST',
    tag: 'Backend Core',
  },
];

const PRESET_TEMPLATES = [
  {
    id: 'ecommerce',
    name: 'ShopSphere Next.js & Node API',
    branch: 'main',
    type: 'Full-Stack (Next.js + Node + PostgreSQL)',
    description: 'Endpoint transaccional de checkout con manejo de cupones, autenticación JWT y cálculo de carrito.',
    snippet: `// Route: src/api/checkout/process.ts
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const body = await req.json();
  const { cartId, couponCode, userToken } = body;

  // Insecure JWT decode without signature verification
  const user = jwt.decode(userToken);

  // Raw SQL string concatenation (SQL Injection risk)
  const query = "SELECT * FROM coupons WHERE code = '" + couponCode + "' AND active = true";
  const coupon = await db.raw(query);

  // Thread starvation: Nested blocking loop
  const cartItems = await db.query("SELECT * FROM items WHERE cart_id = ?", [cartId]);
  let total = 0;
  for (let i = 0; i < cartItems.length; i++) {
    for (let j = 0; j < 10000; j++) {
      total += Math.sin(j) * 0.0001;
    }
    total += cartItems[i].price;
  }

  return new Response(JSON.stringify({ status: 'ok', total }), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}`
  },
  {
    id: 'banking',
    name: 'VaultPay Financial Client Dashboard',
    branch: 'release/v2.4',
    type: 'Frontend SPA (React 19 + Tailwind)',
    description: 'Panel de saldos y transacciones bancarias en vivo con actualización periódica y exportación.',
    snippet: `// Component: src/components/AccountOverview.tsx
import React, { useState, useEffect } from 'react';

export function AccountOverview({ accountId }: { accountId: string }) {
  const [data, setData] = useState<any>(null);

  // Memory Leak: Uncleaned setInterval
  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await fetch(\`/api/balance?id=\${accountId}\`);
      const json = await res.json();
      setData(json);
    }, 1000);
    // Missing return () => clearInterval(timer);
  }, [accountId]);

  // XSS vulnerability: Direct innerHTML injection & dangerous eval
  return (
    <div className="card">
      <h2>Account Balance</h2>
      <div dangerouslySetInnerHTML={{ __html: data?.userNotes || '' }} />
      <button onClick={() => eval("console.log('debug:' + " + accountId + ")")}>
        Export Ledger
      </button>
    </div>
  );
}`
  }
];

export const ScannerView: React.FC<ScannerViewProps> = ({
  currentScan,
  isScanning,
  onRunScan,
  onSelectIssueForRemediation,
  onAskCopilotAboutIssue,
}) => {
  const [githubUrl, setGithubUrl] = useState('https://github.com/OWASP/NodeGoat');
  const [mode, setMode] = useState<'github' | 'preset' | 'custom'>('github');
  const [selectedPreset, setSelectedPreset] = useState(PRESET_TEMPLATES[0]);
  const [customCode, setCustomCode] = useState(PRESET_TEMPLATES[0].snippet);
  const [targetName, setTargetName] = useState(PRESET_TEMPLATES[0].name);

  // Quick metadata preview when typing GitHub URL
  const [repoPreview, setRepoPreview] = useState<{
    stars?: number;
    description?: string;
    language?: string;
    defaultBranch?: string;
    fullName?: string;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Fetch quick preview on GitHub URL changes
  useEffect(() => {
    if (mode !== 'github' || !githubUrl.trim()) {
      setRepoPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsPreviewLoading(true);
        const res = await fetch(`/api/github/info?url=${encodeURIComponent(githubUrl.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.meta) {
            setRepoPreview({
              stars: data.meta.stars,
              description: data.meta.description,
              language: data.meta.language,
              defaultBranch: data.meta.defaultBranch,
              fullName: data.meta.fullName,
            });
          }
        }
      } catch (err) {
        // quiet fallback
      } finally {
        setIsPreviewLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [githubUrl, mode]);

  const handleTriggerScan = () => {
    if (mode === 'github') {
      const cleanUrl = githubUrl.trim();
      if (!cleanUrl) return;
      onRunScan(cleanUrl, '', cleanUrl);
    } else if (mode === 'preset') {
      onRunScan(selectedPreset.name, selectedPreset.snippet);
    } else {
      onRunScan(targetName, customCode);
    }
  };

  const handleSelectQuickRepo = (repoUrl: string) => {
    setGithubUrl(repoUrl);
    setMode('github');
    onRunScan(repoUrl, '', repoUrl);
  };

  const criticalIssues = currentScan.issues.filter(i => i.severity === 'critical');
  const highIssues = currentScan.issues.filter(i => i.severity === 'high');

  return (
    <div className="space-y-8">
      {/* Top Hero / Control Center */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Escaneo Directo por Enlace de Repositorio</span>
            <span aria-hidden="true">·</span>
            <span>Descarga & Auditoría en Tiempo Real</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Auditoría de Seguridad & Rendimiento con URL de GitHub
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Pega directamente el enlace de cualquier repositorio público de GitHub. La plataforma descarga los archivos fuente críticos (endpoints, autenticación, dependencias, controladores), detecta vulnerabilidades en tiempo real y genera remediaciones con diffs.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMode('github')}
              className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                mode === 'github' ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pegar Enlace de GitHub</span>
            </button>
            <button
              onClick={() => setMode('preset')}
              className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                mode === 'preset' ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Proyectos Demo</span>
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                mode === 'custom' ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pegar Código Manual</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono hidden sm:flex items-center gap-1.5">
            <span>API v3</span>
            <span aria-hidden="true">·</span>
            <span>github.com</span>
          </div>
        </div>

        {/* MODE 1: GITHUB URL INPUT (HEROIC) */}
        {mode === 'github' && (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Enlace del Repositorio de GitHub:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 pointer-events-none">
                    <Search className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTriggerScan();
                      }
                    }}
                    placeholder="https://github.com/usuario/repositorio (ej: https://github.com/OWASP/NodeGoat)"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-colors shadow-inner"
                  />
                </div>

                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning || !githubUrl.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors rounded-lg shadow-sm shadow-cyan-500/20 whitespace-nowrap cursor-pointer select-none"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{isScanning ? 'Descargando & Auditando...' : 'Escanear Repositorio GitHub'}</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Repositories */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">Repositorios populares para probar:</span>
              {POPULAR_REPOS.map((repo, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuickRepo(repo.url)}
                  disabled={isScanning}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-mono flex items-center gap-1.5"
                  title={repo.desc}
                >
                  <span>{repo.name}</span>
                  <span className="text-cyan-400 text-[10px]">· {repo.tag}</span>
                </button>
              ))}
            </div>

            {/* Real-Time GitHub Preview Card (if fetched) */}
            {repoPreview && (
              <div className="p-3.5 bg-slate-950/80 border border-cyan-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-mono font-semibold text-cyan-300">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{repoPreview.fullName}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-normal">rama: {repoPreview.defaultBranch}</span>
                    {repoPreview.language && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 font-normal">{repoPreview.language}</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{repoPreview.description}</p>
                </div>

                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] shrink-0">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{repoPreview.stars?.toLocaleString()}</span>
                  </span>
                  <span className="text-emerald-400 font-medium">Listo para auditar</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: PRESET BENCHMARKS */}
        {mode === 'preset' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESET_TEMPLATES.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPreset(p);
                      setTargetName(p.name);
                      setCustomCode(p.snippet);
                    }}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-cyan-500/60 bg-cyan-950/20 shadow-sm'
                        : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-cyan-400">{p.type}</span>
                      {isSelected && (
                        <span className="text-[11px] font-sans text-cyan-300 font-semibold">Seleccionado</span>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-slate-200">{p.name}</div>
                    <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleTriggerScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors rounded-lg shadow-sm shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Auditar {selectedPreset.name}</span>
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: CUSTOM CODE */}
        {mode === 'custom' && (
          <div className="space-y-3">
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Nombre del componente o servicio (ej: AuthMicroservice / PaymentForm)"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>Código Fuente Directo</span>
                <span>{customCode.split('\n').length} líneas</span>
              </div>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                rows={7}
                className="w-full p-3 font-mono text-xs text-slate-300 bg-transparent resize-y focus:outline-none"
                placeholder="// Pega código TypeScript/JavaScript para auditar..."
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleTriggerScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors rounded-lg shadow-sm shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Auditar Código Manual</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Real-Time Scan Progress Indicator (when active) */}
      {isScanning && (
        <div className="p-4 bg-slate-900/80 border border-cyan-500/40 rounded-xl space-y-3 animate-pulse shadow-lg shadow-cyan-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-cyan-300">
            <span className="font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Conectando con GitHub API y descargando archivos fuente...</span>
            </span>
            <span className="font-mono text-slate-400">Inspección SAST, DAST & Web Vitals en curso</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-1.5 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '78%' }}></div>
          </div>
        </div>
      )}

      {/* GitHub Scanned Repository Badge (if currentScan came from GitHub) */}
      {currentScan.repoDetails && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-cyan-400 font-bold">{currentScan.repoDetails.owner}/{currentScan.repoDetails.repo}</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-400">rama: {currentScan.repoDetails.branch}</span>
              {currentScan.repoDetails.language && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">{currentScan.repoDetails.language}</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">{currentScan.repoDetails.description}</p>
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Archivos inspeccionados ({currentScan.repoDetails.filesScanned.length}):</span>
              {currentScan.repoDetails.filesScanned.map((f, idx) => (
                <span key={idx} className="font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <a
            href={currentScan.repoDetails.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors shrink-0 self-start md:self-center"
          >
            <span>Ver en GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Executive KPI Scoreboard */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Overall Score */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-xs text-slate-400 mb-1">Puntuación Global</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {currentScan.overallScore}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {currentScan.overallScore >= 75 ? 'Estado Saludable' : 'Riesgo Detectado'}
          </div>
        </div>

        {/* Security Score */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Seguridad (SAST/DAST)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${
              currentScan.securityScore < 60 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {currentScan.securityScore}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400/90 font-medium">
            {criticalIssues.length} Críticas · {highIssues.length} Altas
          </div>
        </div>

        {/* Performance Score */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Rendimiento Web</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-amber-400">
              {currentScan.performanceScore}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            LCP: 3.4s · INP: 280ms
          </div>
        </div>

        {/* Architecture Score */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-xs text-slate-400 mb-1">Escalabilidad & Arq.</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-cyan-400">
              {currentScan.architectureScore}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            3 Patrones recomendados
          </div>
        </div>

        {/* CI/CD Quality Gate Status */}
        <div className={`p-4 rounded-xl border col-span-2 md:col-span-1 ${
          currentScan.ciStatus.passed
            ? 'border-emerald-800/80 bg-emerald-950/20'
            : 'border-rose-800/80 bg-rose-950/20'
        }`}>
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Quality Gate CI/CD</span>
            {currentScan.ciStatus.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className={`text-lg font-bold ${
            currentScan.ciStatus.passed ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {currentScan.ciStatus.passed ? 'APROBADO' : 'BLOQUEADO'}
          </div>
          <div className="mt-1 text-[11px] text-slate-300 truncate" title={currentScan.ciStatus.thresholdPolicy}>
            {currentScan.ciStatus.passed ? 'Merge autorizado' : 'PR bloqueado'}
          </div>
        </div>
      </section>

      {/* Prioritized Critical Findings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Incidencias Críticas Prioritarias en el Código</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vulnerabilidades que violan políticas de seguridad y bloquean el pipeline de despliegue continuo.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total: {currentScan.issues.length} incidencias
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentScan.issues.map((issue) => {
            const isCritical = issue.severity === 'critical';
            const isHigh = issue.severity === 'high';

            return (
              <div
                key={issue.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`font-mono font-bold ${
                      isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-slate-300'
                    }`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400">{issue.id}</span>
                    {issue.cwe && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-cyan-400">{issue.cwe}</span>
                      </>
                    )}
                    {issue.cvss && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono tabular-nums text-slate-300">CVSS {issue.cvss}</span>
                      </>
                    )}
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono">{issue.fileLocation}</span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100">{issue.title}</h3>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {issue.description}
                  </p>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong className="text-slate-300">Impacto:</strong> {issue.impact}</span>
                  </div>
                </div>

                <div className="flex lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0">
                  <button
                    onClick={() => onSelectIssueForRemediation(issue)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 rounded transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Ver Solución & Diff</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onAskCopilotAboutIssue(issue.title, issue.vulnerableSnippet)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 rounded transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Consultar Asesor IA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
