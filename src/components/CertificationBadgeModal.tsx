import React, { useState } from 'react';
import { Award, X, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { 
  generateCertificationSvg, 
  generateCertificationHtml, 
  generateCertificationMarkdown 
} from '../lib/badgeGenerator.ts';

interface CertificationBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  overallScore: number;
  targetName: string;
}

export const CertificationBadgeModal: React.FC<CertificationBadgeModalProps> = ({
  isOpen,
  onClose,
  overallScore,
  targetName,
}) => {
  if (!isOpen) return null;

  const [snippetType, setSnippetType] = useState<'html' | 'svg' | 'markdown'>('html');
  const [copied, setCopied] = useState(false);

  const badgeOptions = {
    overallScore,
    targetName,
    theme: 'obsidian' as const,
  };

  const svgContent = generateCertificationSvg(badgeOptions);
  const htmlContent = generateCertificationHtml(badgeOptions);
  const markdownContent = generateCertificationMarkdown(badgeOptions);

  const activeSnippet = snippetType === 'html' ? htmlContent : snippetType === 'svg' ? svgContent : markdownContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="obsidian-glass border border-emerald-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Sello Oficial de Certificación Web LYAXIS AEGIS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                VERIFIED
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Insignia interactiva "Audited &amp; Shielded by LYAXIS Aegis" para el footer de tu sitio web o README.
            </p>
          </div>
        </div>

        {/* Live Visual Preview */}
        <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] flex flex-col items-center justify-center space-y-2">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            Previsualización en Pantalla (340 x 76 px):
          </div>
          <div 
            className="transform hover:scale-105 transition-transform duration-300 drop-shadow-xl"
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
        </div>

        {/* Snippet format selector & copy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
              {(['html', 'svg', 'markdown'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSnippetType(type)}
                  className={`px-3 py-1 rounded-lg text-xs uppercase font-bold transition-all ${
                    snippetType === type
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all glow-emerald"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código de Sello'}</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-36">
            {activeSnippet}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold transition-colors"
          >
            Listo, Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
