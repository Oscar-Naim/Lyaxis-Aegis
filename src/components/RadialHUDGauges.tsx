import React from 'react';
import { Shield, Zap, Eye, ArrowUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScanResult } from '../types/index.ts';

interface RadialHUDGaugesProps {
  currentScan: ScanResult;
  simulatedGains: {
    security: number;
    performance: number;
    privacySeo: number;
  };
  appliedIssuesCount: number;
  onResetSimulation?: () => void;
}

interface GaugeProps {
  label: string;
  sublabel: string;
  score: number;
  gain: number;
  color: string;
  icon: React.ReactNode;
}

const RadialGauge: React.FC<GaugeProps> = ({
  label,
  sublabel,
  score,
  gain,
  color,
  icon,
}) => {
  const currentTotal = Math.min(100, score + gain);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentTotal / 100) * circumference;
  const baseDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative obsidian-card p-5 border border-white/[0.08] flex flex-col items-center justify-center text-center overflow-hidden group">
      {/* Subtle background glow */}
      <div 
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: color }}
      />

      {/* SVG Radial Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
          {/* Background Track */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="9"
            fill="transparent"
          />

          {/* Base Score Arc */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke={color}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {currentTotal}
            </span>
            <span className="text-xs font-mono text-slate-400">/100</span>
          </div>

          {gain > 0 && (
            <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 animate-bounce">
              <ArrowUp className="w-2.5 h-2.5" />
              <span>+{gain} pts</span>
            </div>
          )}

          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
            {icon}
          </div>
        </div>
      </div>

      {/* Label and Sublabel */}
      <div className="mt-1">
        <div className="text-sm font-bold text-slate-200 tracking-wide font-sans">{label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-sans">{sublabel}</div>
      </div>
    </div>
  );
};

export const RadialHUDGauges: React.FC<RadialHUDGaugesProps> = ({
  currentScan,
  simulatedGains,
  appliedIssuesCount,
  onResetSimulation,
}) => {
  const combinedPrivacySeoScore = Math.round((currentScan.socialSeoScore + currentScan.privacyScore) / 2);
  const overallProjected = Math.min(
    100,
    Math.round(
      (currentScan.securityScore + simulatedGains.security) * 0.35 +
      (currentScan.performanceScore + simulatedGains.performance) * 0.30 +
      (combinedPrivacySeoScore + simulatedGains.privacySeo) * 0.35
    )
  );

  const totalGain = simulatedGains.security + simulatedGains.performance + simulatedGains.privacySeo;

  return (
    <div className="space-y-4 mb-8">
      {/* What-If Live Simulator Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl obsidian-glass border border-cyan-500/30 shadow-lg shadow-cyan-950/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Simulador Interactivo "What-If" en Vivo</span>
              {totalGain > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
                  +{totalGain} pts ganados
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Al marcar o aplicar parches abajo, los velocímetros HUD recalculan la mejora estimada en tiempo real.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Score Proyectado</div>
            <div className="text-lg font-black font-mono text-cyan-300">{overallProjected}/100</div>
          </div>

          {appliedIssuesCount > 0 && onResetSimulation && (
            <button
              onClick={onResetSimulation}
              className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* 3 Radial HUD Speedometers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gauge 1: Seguridad 🛡️ */}
        <RadialGauge
          label="Seguridad &amp; Red"
          sublabel="Inmunidad perimetral &amp; CWE/OWASP"
          score={currentScan.securityScore}
          gain={simulatedGains.security}
          color="#06b6d4" // Cyan
          icon={<Shield className="w-3.5 h-3.5 text-cyan-400" />}
        />

        {/* Gauge 2: Velocidad ⚡ */}
        <RadialGauge
          label="Rendimiento Extremo"
          sublabel="Core Web Vitals &amp; TTFB/LCP"
          score={currentScan.performanceScore}
          gain={simulatedGains.performance}
          color="#10b981" // Emerald
          icon={<Zap className="w-3.5 h-3.5 text-emerald-400" />}
        />

        {/* Gauge 3: Privacidad & SEO 👁️ */}
        <RadialGauge
          label="Privacidad &amp; SEO"
          sublabel="OpenGraph, Cookies &amp; Accesibilidad"
          score={combinedPrivacySeoScore}
          gain={simulatedGains.privacySeo}
          color="#8b5cf6" // Violet
          icon={<Eye className="w-3.5 h-3.5 text-violet-400" />}
        />
      </div>
    </div>
  );
};
