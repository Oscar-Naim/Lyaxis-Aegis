import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  GitBranch, 
  Globe, 
  Code2, 
  ArrowRight, 
  ExternalLink,
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';
import { POPULAR_CHIPS } from '../data/mockData.ts';

interface MissionControlHeroProps {
  onRunScan: (target: string, sourceCode?: string, typeHint?: 'url' | 'github' | 'code') => void;
  isScanning: boolean;
  targetName: string;
}

export const MissionControlHero: React.FC<MissionControlHeroProps> = ({
  onRunScan,
  isScanning,
  targetName,
}) => {
  const [inputVal, setInputVal] = useState('https://github.com/OWASP/NodeGoat');
  const [inputMode, setInputMode] = useState<'url_repo' | 'code'>('url_repo');
  const [customSnippet, setCustomSnippet] = useState(`// Endpoint con vulnerabilidades críticas para análisis forense:
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const { cartId, couponCode, userToken } = await req.json();

  // Insecure JWT decode without signature verification
  const user = jwt.decode(userToken);

  // Raw SQL string concatenation (SQL Injection risk)
  const query = "SELECT * FROM coupons WHERE code = '" + couponCode + "' AND active = true";
  const coupon = await db.raw(query);

  // Blocking loop in main thread
  let total = 0;
  for (let i = 0; i < 10000; i++) { total += Math.sin(i) * 0.0001; }

  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}`);

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isScanning) return;

    if (inputMode === 'code') {
      onRunScan(inputVal || 'Módulo de Código Directo', customSnippet, 'code');
    } else {
      const trimmed = inputVal.trim();
      const isGithub = trimmed.includes('github.com') || (trimmed.includes('/') && !trimmed.startsWith('http'));
      const isUrl = /^https?:\/\//i.test(trimmed) || (!isGithub && trimmed.includes('.'));

      onRunScan(trimmed, '', isGithub ? 'github' : isUrl ? 'url' : 'code');
    }
  };

  const handleChipClick = (chip: typeof POPULAR_CHIPS[0]) => {
    if (chip.type === 'code') {
      setInputMode('code');
      setInputVal('Módulo Transaccional Inseguro');
      onRunScan('Módulo Transaccional Inseguro', customSnippet, 'code');
    } else {
      setInputMode('url_repo');
      setInputVal(chip.url || '');
      onRunScan(chip.url || '', '', chip.type as any);
    }
  };

  return (
    <div className="relative pt-6 pb-10">
      {/* Background glow radial highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-violet-500/5 to-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Header Tagline */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-4 shadow-sm backdrop-blur-md">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>MOTOR PROPIETARIO DE EJECUCIÓN FORENSE &middot; LYAXIS LABS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans leading-tight">
          Auditoría Forense Implacable &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Parches en Tiempo Real
          </span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pega cualquier <span className="text-slate-200 font-medium">URL de sitio web</span>,{' '}
          <span className="text-slate-200 font-medium">repositorio de GitHub</span> o código directo.{' '}
          <span className="text-cyan-300 font-medium">Aegis Engine</span> garantiza hallazgos reales en Seguridad, Rendimiento, SEO y Privacidad.
        </p>
      </div>

      {/* Mission Control Search Container */}
      <div className="max-w-3xl mx-auto">
        {/* Toggle Mode: URL/Repo vs Code */}
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setInputMode('url_repo')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                inputMode === 'url_repo'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>URL Web o Repositorio GitHub</span>
            </button>
            <button
              onClick={() => setInputMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                inputMode === 'code'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor de Código Directo</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            100% Gratuito y Abierto
          </span>
        </div>

        {/* Search Bar / Input Area */}
        <form onSubmit={handleExecute} className="relative group">
          <div className="obsidian-glass border border-white/[0.12] focus-within:border-cyan-500/60 rounded-2xl p-2.5 shadow-2xl shadow-cyan-950/20 transition-all duration-300">
            {inputMode === 'url_repo' ? (
              <div className="flex items-center gap-3 px-3 py-1">
                <Search className="w-5 h-5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="https://tudominio.com o https://github.com/owner/repo..."
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none font-sans"
                  disabled={isScanning}
                />
                <button
                  type="submit"
                  disabled={isScanning || !inputVal.trim()}
                  className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-white transition-all shadow-lg ${
                    isScanning
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 glow-cyan active:scale-95'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                      <span>Analizando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Escaneo Forense Aegis</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-2">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Nombre del componente o módulo (ej: Checkout.ts)"
                    className="bg-transparent text-xs text-slate-300 focus:outline-none w-2/3"
                  />
                  <span className="text-[11px] font-mono text-slate-500">TypeScript / JavaScript</span>
                </div>
                <textarea
                  value={customSnippet}
                  onChange={(e) => setCustomSnippet(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950/70 border border-white/[0.06] rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 resize-none leading-relaxed"
                  placeholder="Pega aquí el código fuente para auditoría estática y diff..."
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 glow-cyan active:scale-95 transition-all"
                  >
                    {isScanning ? 'Ejecutando Aegis...' : 'Auditar Código Fuente'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* 1-Click Quick Test Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Pruebas rápidas de 1 clic:</span>
          {POPULAR_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.07] hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              {chip.type === 'github' && <GitBranch className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />}
              {chip.type === 'url' && <Globe className="w-3 h-3 text-emerald-400" />}
              {chip.type === 'code' && <Code2 className="w-3 h-3 text-amber-400" />}
              <span>{chip.name}</span>
              <span className="text-[10px] text-slate-400 px-1 py-0.2 rounded bg-black/40">
                {chip.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
