import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Cpu, 
  User, 
  Copy, 
  Check, 
  Shield, 
  Zap, 
  HelpCircle,
  Terminal
} from 'lucide-react';
import { ChatMessage, ScanResult } from '../types/index.ts';
import { requestArchitectChat } from '../lib/aegisClient.ts';

interface ArchitectureChatbotProps {
  currentScan: ScanResult;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const QUICK_PROMPTS = [
  '🔐 ¿Cómo mitigar la inyección SQL detectada en el checkout?',
  '⚡ ¿Cómo optimizar el LCP de 3.4s y reducir el bundle de JavaScript?',
  '🛡️ Genera una política de Content Security Policy (CSP) segura para Next.js',
  '🏗️ Diseña una arquitectura de Caching distribuido con Redis para 50k req/s',
  '🔄 ¿Cómo configurar GitHub Actions para bloquear PRs con vulnerabilidades críticas?',
  '🧼 ¿Cómo detectar y prevenir fugas de memoria en React useEffect?'
];

export const ArchitectureChatbot: React.FC<ArchitectureChatbotProps> = ({
  currentScan,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hola, soy **LYAXIS Architect**, tu estratega de implementación y arquitectura de software DevSecOps.

Tengo acceso directo a los resultados de la auditoría en tiempo real de **${currentScan.targetName}** (Score de Seguridad: **${currentScan.securityScore}/100**, Rendimiento: **${currentScan.performanceScore}/100**).

¿En qué puedo orientarte hoy? Puedes consultarme sobre:
1. **Remediación de vulnerabilidades** (Inyecciones SQL, JWT, XSS, CORS, SSRF).
2. **Optimización de Core Web Vitals & Rendimiento** (LCP, INP, memory leaks, lazy-loading).
3. **Mejores prácticas de arquitectura de software** (Microservicios, Caching distribuido, Circuit Breakers).
4. **Automatización de pipelines CI/CD y políticas de seguridad**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await requestArchitectChat({
        message: textToSend,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        currentScanContext: {
          targetName: currentScan.targetName,
          securityScore: currentScan.securityScore,
          performanceScore: currentScan.performanceScore,
          overallScore: currentScan.overallScore,
          issues: currentScan.issues
        }
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.response || 'Recomendación generada por LYAXIS Architect.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: 'Disculpa, ocurrió un detalle al conectar con LYAXIS Architect. Por favor intenta formular tu consulta nuevamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[740px] max-w-5xl mx-auto obsidian-glass border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">LYAXIS Architect Copilot</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                EN VIVO
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Contexto activo: {currentScan.targetName} &middot; Score {currentScan.overallScore}/100
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-cyan-400 hidden sm:block">
          LYAXIS LABS ARCHITECT
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#05070B]/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                msg.role === 'user'
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-violet-500/20 border-violet-500/40 text-violet-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'obsidian-card border border-white/[0.08] text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              <div className="text-[10px] text-slate-400 mt-2 text-right font-mono">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div className="obsidian-card p-3 rounded-2xl border border-white/[0.08] flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>LYAXIS Architect analizando arquitectura y soluciones...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="p-3 bg-black/40 border-t border-white/[0.06] overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] text-slate-500 font-mono shrink-0 px-1">Sugerencias:</span>
        {QUICK_PROMPTS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] whitespace-nowrap transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale a LYAXIS Architect sobre arquitectura, parches o despliegues..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500/50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
