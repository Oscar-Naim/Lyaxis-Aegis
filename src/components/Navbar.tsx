import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Globe, 
  Lock, 
  Award, 
  FileText, 
  Layers, 
  Cpu, 
  Zap, 
  Share2, 
  Clock, 
  GitPullRequest,
  Sparkles,
  FolderPlus,
  Bot,
  Activity
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isHumanMode: boolean;
  onToggleHumanMode: () => void;
  onOpenVault: () => void;
  onOpenBadge: () => void;
  onOpenInjector?: () => void;
  onExportReport: () => void;
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isHumanMode,
  onToggleHumanMode,
  onOpenVault,
  onOpenBadge,
  onOpenInjector,
  onExportReport,
  isScanning,
}) => {
  return (
    <header className="sticky top-0 z-40 obsidian-glass border-b border-white/[0.08] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Left */}
        <div 
          onClick={() => onTabChange('harness')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-violet-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-950/40">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            {isScanning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-white text-base font-sans">
                LYAXIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">HARNESS</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                v4.2 SOBERANO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Casa Central de Agentes · LYAXIS Architect &amp; Aegis Engine
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs">
          <button
            onClick={() => onTabChange('harness')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'harness'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Casa Central</span>
          </button>

          <button
            onClick={() => onTabChange('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Catálogo (34/274)</span>
          </button>

          <button
            onClick={() => onTabChange('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Terminal</span>
          </button>

          <button
            onClick={() => onTabChange('scanner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'scanner'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Escáner Aegis</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Diagnóstico</span>
          </button>

          <button
            onClick={() => onTabChange('remediation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'remediation'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Parches</span>
          </button>

          <button
            onClick={() => onTabChange('architect')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'architect'
                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span>LYAXIS Architect</span>
          </button>

          <button
            onClick={() => onTabChange('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'pipeline'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-cyan-400" />
            <span>CI/CD</span>
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Architect</span>
          </button>
        </nav>

        {/* Right Action Switchers & Modals */}
        <div className="flex items-center gap-2">
          {/* Quick Inject Button */}
          {onOpenInjector && (
            <button
              onClick={onOpenInjector}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shadow-sm"
              title="Inyectar Harness en Repositorio"
            >
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Inyectar</span>
            </button>
          )}

          {/* THE SWITCH: Modo Humano vs Modo Hacker/Dev */}
          <button
            onClick={onToggleHumanMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 shadow-sm ${
              isHumanMode
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-500/40 glow-emerald'
                : 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/40 glow-cyan'
            }`}
            title="Cambiar perspectiva de análisis"
          >
            {isHumanMode ? (
              <>
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Modo Humano</span>
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="hidden md:inline">Modo Hacker / Dev</span>
              </>
            )}
          </button>

          {/* Bóveda de Credenciales */}
          <button
            onClick={onOpenVault}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-cyan-300 border border-white/[0.08] transition-all"
            title="Bóveda de Credenciales Sanitizada"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Sello de Certificación */}
          <button
            onClick={onOpenBadge}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-emerald-300 border border-white/[0.08] transition-all hidden md:flex"
            title="Generar Sello de Certificación Web"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Exportar Reporte PDF */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.1] text-xs font-medium transition-all"
            title="Descargar o Imprimir Reporte Ejecutivo Editorial"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Reporte</span>
          </button>
        </div>
      </div>

      {/* Responsive Sub-Navigation Bar for smaller screens */}
      <div className="xl:hidden flex items-center justify-between overflow-x-auto px-4 py-2 border-t border-white/[0.05] text-xs gap-1">
        <button
          onClick={() => onTabChange('harness')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'harness' ? 'text-cyan-300 font-semibold bg-cyan-950/40' : 'text-slate-400'}`}
        >
          Casa Central
        </button>
        <button
          onClick={() => onTabChange('catalog')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'catalog' ? 'text-emerald-300 font-semibold bg-emerald-950/40' : 'text-slate-400'}`}
        >
          Catálogo
        </button>
        <button
          onClick={() => onTabChange('simulator')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'simulator' ? 'text-amber-300 font-semibold bg-amber-950/40' : 'text-slate-400'}`}
        >
          Live Terminal
        </button>
        <button
          onClick={() => onTabChange('scanner')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'scanner' ? 'text-cyan-300 font-semibold bg-cyan-950/40' : 'text-slate-400'}`}
        >
          Escaneo
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'analytics' ? 'text-cyan-300 font-semibold bg-cyan-950/40' : 'text-slate-400'}`}
        >
          Diagnóstico
        </button>
        <button
          onClick={() => onTabChange('remediation')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'remediation' ? 'text-cyan-300 font-semibold bg-cyan-950/40' : 'text-slate-400'}`}
        >
          Parches
        </button>
        <button
          onClick={() => onTabChange('architect')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'architect' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'text-slate-400'}`}
        >
          Plan Maestro
        </button>
        <button
          onClick={() => onTabChange('pipeline')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'pipeline' ? 'text-cyan-300 font-semibold bg-cyan-950/40' : 'text-slate-400'}`}
        >
          CI/CD
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'chat' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'text-slate-400'}`}
        >
          Architect
        </button>
      </div>
    </header>
  );
};
