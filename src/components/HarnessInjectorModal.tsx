import React, { useState } from 'react';
import { 
  FolderPlus, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Code2, 
  FileText, 
  Wrench, 
  Play, 
  RefreshCw,
  FolderArchive,
  ArrowRight
} from 'lucide-react';

interface HarnessInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

const PRESETS = [
  {
    id: 'full' as const,
    title: 'Full Sovereign Stack',
    squads: '6 Escuadrones (34 Agentes / 274 Skills)',
    description: 'Arquitectura completa de máxima potencia: Seguridad, Rendimiento, Frontend, Backend, TDD y AI Soberana.',
    badge: 'RECOMENDADO'
  },
  {
    id: 'secops' as const,
    title: 'DevSecOps Fortress',
    squads: 'Seguridad + Rendimiento + TDD',
    description: 'Enfoque estricto en blindaje de código, mitigación de vulnerabilidades OWASP y compuertas CI/CD.',
    badge: 'ESTRICTO'
  },
  {
    id: 'frontend' as const,
    title: 'Frontend Ultra & Web Vitals',
    squads: 'React 19 + Specular Glass + Rendimiento',
    description: 'Especializado en interfaces Obsidian Glass, Core Web Vitals (LCP < 800ms) y accesibilidad WCAG AA.',
    badge: 'UI/UX'
  },
  {
    id: 'backend' as const,
    title: 'Backend Soberano & APIs',
    squads: 'Go + Rust + Python + SQL Transaccional',
    description: 'Microservicios de alta concurrencia, APIs REST/gRPC y garantías transaccionales ACID.',
    badge: 'SISTEMAS'
  }
];

export const HarnessInjectorModal: React.FC<HarnessInjectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [targetPath, setTargetPath] = useState<string>('.');
  const [selectedPreset, setSelectedPreset] = useState<'full' | 'secops' | 'frontend' | 'backend'>('full');
  const [previewTab, setPreviewTab] = useState<'constitution' | 'memory' | 'verify'>('constitution');
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; filesCreated: string[]; message: string } | null>(null);

  if (!isOpen) return null;

  const handleInject = async () => {
    setIsInjecting(true);
    setResult(null);

    try {
      const res = await fetch('/api/harness/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPath,
          preset: selectedPreset
        })
      });

      if (!res.ok) throw new Error('Error al inyectar el arnés');
      const data = await res.json();
      setResult(data);
      onSuccess?.(data.message || 'Harness Soberano inyectado correctamente.');
    } catch (err: any) {
      setResult({
        success: false,
        filesCreated: [],
        message: err.message || 'Error de conexión con el motor de inyección.'
      });
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-3xl w-full p-6 sm:p-8 rounded-2xl obsidian-glass border border-cyan-500/40 bg-slate-950 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Inyector de Harness Soberano
            </h2>
            <p className="text-xs text-slate-400">
              Instala la arquitectura de memoria (02-DOCS/), herramientas (01-TOOLS/) y gobernanza de agentes con 1 clic.
            </p>
          </div>
        </div>

        {/* Directory Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
            Directorio Destino del Repositorio
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder="Ruta local (ej. . o C:\Proyectos\MiApp)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/[0.12] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
            <button
              type="button"
              onClick={() => setTargetPath('.')}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300"
            >
              Raíz Actual (.)
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
            Selecciona el Preset de Escuadrones
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`p-4 rounded-xl cursor-pointer transition border text-left flex flex-col justify-between ${
                  selectedPreset === preset.id
                    ? 'border-cyan-500/60 bg-cyan-950/20 shadow-md shadow-cyan-950/40'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm font-bold text-white">{preset.title}</strong>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                      {preset.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400/90 mt-1">
                    {preset.squads}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview of Generated Files */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
              Vista Previa de Artefactos Soberanos
            </span>
            <div className="flex gap-1 text-[11px] font-mono">
              <button
                onClick={() => setPreviewTab('constitution')}
                className={`px-2.5 py-1 rounded-lg transition ${previewTab === 'constitution' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
              >
                01-CONSTITUTION.md
              </button>
              <button
                onClick={() => setPreviewTab('memory')}
                className={`px-2.5 py-1 rounded-lg transition ${previewTab === 'memory' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
              >
                02-SESSION-MEMORY.md
              </button>
              <button
                onClick={() => setPreviewTab('verify')}
                className={`px-2.5 py-1 rounded-lg transition ${previewTab === 'verify' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
              >
                01-TOOLS/lyaxis-verify.cjs
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#02050A] border border-white/[0.08] font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto leading-relaxed">
            {previewTab === 'constitution' && (
              <pre className="whitespace-pre-wrap">
{`# CONSTITUCIÓN ARQUITECTÓNICA SOBERANA - LYAXIS LABS
**Gobernanza:** 4.2.0-SOVEREIGN · Motores: LYAXIS Architect & Aegis Engine
1. AUTONOMÍA Y SOBERANÍA 100%: Cero dependencias opacas no declaradas.
2. TDD ESTRICTO: Red -> Green -> Refactor. Prohibido mergear sin tests.
3. VERIFICACIÓN ADVERSARIAL OBLIGATORIA: asdd-gate y danger-guard obligatorios.
4. TOLERANCIA CERO A HALLAZGOS CRÍTICOS: Fallo de compuerta si CWE-89, CWE-345 o CWE-79.`}
              </pre>
            )}

            {previewTab === 'memory' && (
              <pre className="whitespace-pre-wrap">
{`# MEMORIA DE SESIÓN CONTINUA - LYAXIS HARNESS
## Registro Cronológico de Decisiones
### Sesión 001 · Inicialización del Harness
- Agente Coordinador: LYAXIS Architect
- Motor Forense: Aegis Engine
- Veredicto: Repositorio protegido bajo el estándar 4.2.0-SOVEREIGN.`}
              </pre>
            )}

            {previewTab === 'verify' && (
              <pre className="whitespace-pre-wrap">
{`#!/usr/bin/env node
// LYAXIS LABS - HERRAMIENTA DE VERIFICACIÓN SOBERANA
// Valida 02-DOCS/01-CONSTITUTION.md y 02-DOCS/02-SESSION-MEMORY.md
console.log('[LYAXIS HARNESS] Verificando compuertas de gobernanza...');`}
              </pre>
            )}
          </div>
        </div>

        {/* Injection Execution Result */}
        {result && (
          <div className={`p-4 rounded-xl border ${result.success ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-rose-950/30 border-rose-500/40'} space-y-2 animate-in fade-in`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <X className="w-5 h-5 text-rose-400" />
              )}
              <strong className="text-sm font-bold text-white">{result.message}</strong>
            </div>

            {result.filesCreated.length > 0 && (
              <div className="mt-2 text-xs font-mono text-slate-300">
                <span className="text-slate-400 block mb-1 font-semibold">Archivos generados:</span>
                <div className="flex flex-wrap gap-2">
                  {result.filesCreated.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.1] text-emerald-300">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <span className="text-[11px] font-mono text-slate-500">
            LYAXIS HARNESS v4.2.0
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="secondary-button text-xs"
            >
              Cerrar
            </button>
            <button
              onClick={handleInject}
              disabled={isInjecting}
              className="primary-button text-xs font-semibold disabled:opacity-50"
            >
              {isInjecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Inyectando...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Inyectar Harness Soberano
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
