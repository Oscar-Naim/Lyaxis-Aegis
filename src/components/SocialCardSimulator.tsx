import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Twitter, 
  Linkedin, 
  Sparkles, 
  ExternalLink,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { SocialCardData } from '../types/index.ts';

interface SocialCardSimulatorProps {
  initialData: SocialCardData;
  targetName: string;
}

export const SocialCardSimulator: React.FC<SocialCardSimulatorProps> = ({
  initialData,
  targetName,
}) => {
  const [platform, setPlatform] = useState<'whatsapp' | 'twitter' | 'linkedin'>('whatsapp');
  const [title, setTitle] = useState(initialData.ogTitle || `${targetName} — Plataforma Digital`);
  const [description, setDescription] = useState(initialData.ogDescription || 'Solución web de alto rendimiento y arquitectura moderna.');
  const [imageUrl, setImageUrl] = useState(initialData.ogImage || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop');
  const [copied, setCopied] = useState(false);

  const generatedHtml = `<!-- LYAXIS AEGIS Optimized Social Meta Tags -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:url" content="${initialData.canonicalUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl}" />`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const domain = (() => {
    try {
      return new URL(initialData.canonicalUrl).hostname;
    } catch {
      return 'tudominio.com';
    }
  })();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="obsidian-glass p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>Simulador Interactivo de Tarjeta Social (WhatsApp / X / LinkedIn)</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Previsualización &amp; Corrector de Enlace Compartido en Vivo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Edita los metadatos en tiempo real para ver cómo lucirá tu web cuando tus usuarios compartan el enlace.
          </p>
        </div>

        {/* Platform Selector Buttons */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setPlatform('whatsapp')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platform === 'whatsapp'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setPlatform('twitter')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platform === 'twitter'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Twitter className="w-3.5 h-3.5 text-cyan-400" />
            <span>X (Twitter)</span>
          </button>

          <button
            onClick={() => setPlatform('linkedin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platform === 'linkedin'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Live Preview vs Meta Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Live Interactive Card Preview */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>PREVISUALIZACIÓN REAL EN PANTALLA:</span>
            <span className="text-cyan-400 lowercase">{platform} preview</span>
          </div>

          {/* WhatsApp Card Simulator */}
          {platform === 'whatsapp' && (
            <div className="p-4 rounded-2xl bg-[#0b141a] border border-[#1f2c34] max-w-md mx-auto shadow-2xl">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1f2c34] text-xs text-[#8696a0]">
                <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white text-xs font-bold">
                  WA
                </div>
                <div>
                  <div className="text-[#e9edef] font-semibold text-xs">Mensajería WhatsApp</div>
                  <div className="text-[10px]">Previsualización de burbuja de chat</div>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#202c33] rounded-xl overflow-hidden border border-[#2a3942]">
                <div className="aspect-[1.91/1] w-full bg-slate-900 relative overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop';
                    }}
                  />
                </div>
                <div className="p-3 bg-[#111b21]">
                  <div className="text-xs font-bold text-[#e9edef] line-clamp-1">{title}</div>
                  <div className="text-[11px] text-[#8696a0] line-clamp-2 mt-1">{description}</div>
                  <div className="text-[10px] text-[#00a884] font-mono mt-1.5 flex items-center gap-1">
                    <span>{domain}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* X (Twitter) Card Simulator */}
          {platform === 'twitter' && (
            <div className="p-4 rounded-2xl bg-black border border-white/[0.1] max-w-md mx-auto shadow-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="text-xs">
                  <div className="font-bold text-white">Usuario X</div>
                  <div className="text-slate-500 text-[11px]">@developer &middot; ahora</div>
                </div>
              </div>
              <div className="text-xs text-slate-200 mb-2">
                Echa un vistazo a nuestra nueva plataforma web protegida:
              </div>
              {/* Card Large Image */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.15] bg-slate-950">
                <div className="aspect-[1.91/1] w-full bg-slate-900">
                  <img src={imageUrl} alt="X Preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-black">
                  <div className="text-[11px] text-slate-500 font-mono">{domain}</div>
                  <div className="text-xs font-bold text-white line-clamp-1 mt-0.5">{title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{description}</div>
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn Card Simulator */}
          {platform === 'linkedin' && (
            <div className="p-4 rounded-2xl bg-[#1b1f23] border border-white/[0.1] max-w-md mx-auto shadow-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  in
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Perfil Profesional</div>
                  <div className="text-slate-400 text-[10px]">1er grado &middot; Publicación</div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/[0.1] bg-[#282d33]">
                <div className="aspect-[1.91/1] w-full bg-slate-900">
                  <img src={imageUrl} alt="LinkedIn Preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-white line-clamp-1">{title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">{domain}</div>
                </div>
              </div>
            </div>
          )}

          {/* Missing Tags Warning if any */}
          {initialData.missingTags.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Atención:</strong> En la auditoría faltaban las etiquetas:{' '}
                {initialData.missingTags.join(', ')}.
              </span>
            </div>
          )}
        </div>

        {/* Column 2: Meta Tag Live Editor & Copyable HTML */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            EDITOR DE METADATOS EN TIEMPO REAL:
          </div>

          <div className="obsidian-card p-5 border border-white/[0.08] rounded-2xl space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Título Social (og:title / twitter:title)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-cyan-500/60"
                placeholder="Título atractivo de menos de 60 caracteres"
              />
              <div className="text-[10px] text-slate-500 text-right mt-0.5">{title.length} / 60 car.</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Descripción (og:description / twitter:description)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
                placeholder="Resumen claro que motive a hacer clic..."
              />
              <div className="text-[10px] text-slate-500 text-right mt-0.5">{description.length} / 155 car.</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                URL de Imagen de Portada (og:image — Recomendado 1200x630px)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-cyan-500/60 font-mono"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Copy HTML Snippet */}
          <div className="obsidian-card p-4 border border-white/[0.08] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bloque HTML &lt;head&gt; Corregido Listo para Copiar</span>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar HTML'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-white/[0.06] text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {generatedHtml}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
