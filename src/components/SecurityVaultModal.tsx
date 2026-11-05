import React, { useState } from 'react';
import { 
  Lock, 
  X, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Check, 
  Key, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { scrubSecretsLocally, saveVaultKey, getVaultKey } from '../lib/sanitization.ts';

interface SecurityVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityVaultModal: React.FC<SecurityVaultModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [testSnippet, setTestSnippet] = useState(
    `const dbUrl = "postgres://admin:SuperSecretPass123@db.prod.internal:5432/finance";\nconst apiKey = "sk_live_981240981240918240918";\nconst jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignature";`
  );
  const [sanitizedResult, setSanitizedResult] = useState<{
    cleanCode: string;
    foundCount: number;
    tokensRedacted: string[];
  } | null>(null);

  const handleTestScrub = () => {
    const res = scrubSecretsLocally(testSnippet);
    setSanitizedResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="obsidian-glass border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Bóveda Hermética &amp; Sanitización de Credenciales</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVA
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Protocolo Zero-Knowledge de LYAXIS LABS: tus secretos nunca salen al exterior sin enmascarar.
            </p>
          </div>
        </div>

        {/* Security Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Enmascaramiento en Cliente</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cualquier clave de API, contraseña o cadena de conexión se sustituye por <code className="text-cyan-200 font-mono">[PROTECTED_BY_VAULT]</code> antes de viajar al motor.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Almacenamiento Efímero Seguro</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Las claves no persisten en bases de datos ni se incluyen en los informes ejecutivos exportados ni en el código compartido.
            </p>
          </div>
        </div>

        {/* Live Sanitization Sandbox */}
        <div className="space-y-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Simulador de Desinfección en Vivo:
            </span>
            <button
              onClick={handleTestScrub}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desinfectar Código</span>
            </button>
          </div>

          <textarea
            value={testSnippet}
            onChange={(e) => setTestSnippet(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
            placeholder="Pega aquí código con claves para probar..."
          />

          {sanitizedResult && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px]">
                <span>✅ {sanitizedResult.foundCount} secreto(s) detectado(s) y neutralizado(s):</span>
                <span className="font-mono text-slate-400">{sanitizedResult.tokensRedacted.join(', ')}</span>
              </div>
              <pre className="text-slate-200 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto bg-slate-950 p-2.5 rounded-lg border border-white/[0.06]">
                {sanitizedResult.cleanCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold transition-colors"
          >
            Entendido, Cerrar Bóveda
          </button>
        </div>
      </div>
    </div>
  );
};
