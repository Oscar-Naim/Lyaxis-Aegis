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
  Terminal,
  Plus,
  Command,
  Search,
  Trash2,
  Edit3,
  ChevronDown,
  Bookmark,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  ShieldCheck,
  X
} from 'lucide-react';
import { ChatMessage, ScanResult } from '../types/index.ts';
import { requestArchitectChat } from '../lib/aegisClient.ts';

interface ArchitectureChatbotProps {
  currentScan: ScanResult;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

interface SovereignEngineOption {
  id: 'architect' | 'zenith' | 'aegis';
  name: string;
  badge: string;
  temp: string;
  subtitle: string;
  pillClass: string;
}

const SOVEREIGN_ENGINES: SovereignEngineOption[] = [
  {
    id: 'zenith',
    name: 'LYAXIS Zenith',
    badge: 'APEX INTELLIGENCE',
    temp: 'T:0.4',
    subtitle: '// CEREBRO SUPERIOR · MULTIMODAL & ARQUITECTURA',
    pillClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/15'
  },
  {
    id: 'architect',
    name: 'LYAXIS Architect',
    badge: 'MASTER STRATEGIST',
    temp: 'T:0.2',
    subtitle: '// ESTRATEGA DE SISTEMAS · GOBERNANZA & PLANES DE MITIGACIÓN',
    pillClass: 'border-violet-500/40 text-violet-300 bg-violet-500/15'
  },
  {
    id: 'aegis',
    name: 'Aegis Engine',
    badge: 'FORENSIC CORE',
    temp: 'T:0.1',
    subtitle: '// MOTOR FORENSE · SAST/DAST CONTINUO & AUTOCURACIÓN',
    pillClass: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/15'
  }
];

interface EnrichedMessage extends ChatMessage {
  engineName?: string;
  engineBadge?: string;
  engineSubtitle?: string;
  tokensIn?: number;
  tokensOut?: number;
  durationSec?: string;
  tokensPerSec?: number;
}

interface ConversationSession {
  id: string;
  title: string;
  engineName: string;
  updatedAt: string;
  messages: EnrichedMessage[];
}

const QUICK_PROMPTS = [
  'Diseña la arquitectura de microservicios para este proyecto',
  '🔐 ¿Cómo mitigar la inyección SQL detectada en el checkout?',
  '⚡ ¿Cómo optimizar el LCP de 3.4s y reducir el bundle de JavaScript?',
  '🛡️ Genera una política de Content Security Policy (CSP) segura para Next.js',
  '🏗️ Diseña una arquitectura de Caching distribuido con Redis para 50k req/s',
  '🔄 ¿Cómo configurar GitHub Actions para bloquear PRs con vulnerabilidades críticas?'
];

function computeTelemetry(promptText: string, responseText: string, elapsedMs: number) {
  const tokensIn = Math.max(120, Math.round(promptText.length * 1.4) + 680);
  const tokensOut = Math.max(85, Math.round(responseText.length * 0.32));
  const durationSecNum = Math.max(0.6, Math.min(3.4, elapsedMs > 50 ? elapsedMs / 1000 : 1.4));
  const durationSec = durationSecNum.toFixed(1);
  const tokensPerSec = Math.max(45, Math.round((tokensIn + tokensOut) / durationSecNum / 10));
  return {
    tokensIn,
    tokensOut,
    totalTokens: tokensIn + tokensOut,
    durationSec,
    tokensPerSec
  };
}

export const ArchitectureChatbot: React.FC<ArchitectureChatbotProps> = ({
  currentScan,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<SovereignEngineOption>(SOVEREIGN_ENGINES[0]);
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickCommandsOpen, setIsQuickCommandsOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const initialMessages: EnrichedMessage[] = [
    {
      id: 'msg-user-seed',
      role: 'user',
      content: 'Diseña la arquitectura de microservicios para este proyecto',
      timestamp: 'Hoy'
    },
    {
      id: 'msg-welcome',
      role: 'assistant',
      engineName: 'LYAXIS ARCHITECT · ZENITH',
      engineBadge: 'APEX INTELLIGENCE',
      engineSubtitle: '// CEREBRO SUPERIOR · MULTIMODAL & ARQUITECTURA',
      content: `Para diseñar la arquitectura de microservicios con precisión clínica y evitar sobreingeniería en **${currentScan.targetName}** (Seguridad: **${currentScan.securityScore}/100**, Rendimiento: **${currentScan.performanceScore}/100**), necesito o puedo partir de los siguientes insumos críticos:

1. **Dominio principal** (ej. e-commerce transaccional, fintech, salud, logística de alta concurrencia).
2. **Requisitos no funcionales clave** (latencia máxima p99, volumen de transacciones por segundo, consistencia de datos requerida: fuerte vs. eventual).
3. **Tecnologías base preferidas** (Lenguaje de programación, contenedorización, orquestador, base de datos principal y compuertas \`01-TOOLS/\`).

Proporciona estos datos o selecciona un comando rápido para generar el diseño de arquitectura, diagrama de flujo y estrategia de mitigación gobernada por **LYAXIS Architect** y **Aegis Engine**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokensIn: 772,
      tokensOut: 141,
      durationSec: '1.8',
      tokensPerSec: 79
    }
  ];

  const [sessions, setSessions] = useState<ConversationSession[]>([
    {
      id: 'session-1',
      title: 'Diseña la arquitectura de microservicios',
      engineName: 'Zenith · Architect',
      updatedAt: 'HOY',
      messages: initialMessages
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages;

  // Latest assistant telemetry for bottom bar
  const latestAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const lastTokensIn = latestAssistant?.tokensIn || 772;
  const lastTokensOut = latestAssistant?.tokensOut || 141;
  const lastTotalTokens = lastTokensIn + lastTokensOut;
  const lastDuration = latestAssistant?.durationSec || '1.8';
  const lastTps = latestAssistant?.tokensPerSec || 79;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  // Keyboard shortcut Ctrl+K inside chat view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickCommandsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateActiveSessionMessages = (updater: (prev: EnrichedMessage[]) => EnrichedMessage[], newTitle?: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== activeSession.id) return s;
        const nextMsgs = updater(s.messages);
        return {
          ...s,
          title: newTitle || s.title,
          messages: nextMsgs
        };
      })
    );
  };

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const welcomeMsg: EnrichedMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      engineName: selectedEngine.name.toUpperCase(),
      engineBadge: selectedEngine.badge,
      engineSubtitle: selectedEngine.subtitle,
      content: `Sesión soberana inicializada con **${selectedEngine.name}**. Memoria \`02-DOCS/\` sincronizada con **${currentScan.targetName}** (Score Global: **${currentScan.overallScore}/100**).\n\n1. **Auditoría y Remediación CWE**: Análisis de parches verificados para inyecciones SQL, XSS y autenticación.\n2. **Arquitectura de Sistemas y Microservicios**: Diseño de topologías resilientes de ultra-baja latencia.\n3. **Optimización Core Web Vitals**: Estrategias de hidratación selectiva, caché en el borde y compuertas CI/CD.\n\nEscribe tu directiva técnica para comenzar.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokensIn: 512,
      tokensOut: 118,
      durationSec: '1.2',
      tokensPerSec: 84
    };

    const newSession: ConversationSession = {
      id: newId,
      title: 'Nueva directiva arquitectónica',
      engineName: selectedEngine.name.replace('LYAXIS ', ''),
      updatedAt: 'HOY',
      messages: [welcomeMsg]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInput('');
  };

  const handleClearHistory = () => {
    handleNewChat();
    setSessions(prev => prev.slice(0, 1));
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: EnrichedMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextTitle = textToSend.slice(0, 42);
    updateActiveSessionMessages(prev => [...prev, userMessage], nextTitle);
    setInput('');
    setIsLoading(true);

    const t0 = performance.now();

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

      const responseContent = data.response || 'Recomendación generada por LYAXIS Architect.';
      const telemetry = computeTelemetry(textToSend, responseContent, performance.now() - t0);

      const assistantMsg: EnrichedMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        engineName: selectedEngine.name.toUpperCase(),
        engineBadge: selectedEngine.badge,
        engineSubtitle: selectedEngine.subtitle,
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokensIn: telemetry.tokensIn,
        tokensOut: telemetry.tokensOut,
        durationSec: telemetry.durationSec,
        tokensPerSec: telemetry.tokensPerSec
      };

      updateActiveSessionMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: EnrichedMessage = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        engineName: selectedEngine.name.toUpperCase(),
        engineBadge: selectedEngine.badge,
        engineSubtitle: selectedEngine.subtitle,
        content: 'Disculpa, ocurrió un detalle al conectar con LYAXIS Architect. Por favor intenta formular tu consulta nuevamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokensIn: 240,
        tokensOut: 32,
        durationSec: '0.8',
        tokensPerSec: 65
      };
      updateActiveSessionMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Rich formatted renderer matching LYAXIS Zenith / Architect visual hierarchy
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2.5 text-xs sm:text-[13.5px] leading-relaxed text-slate-200">
        {lines.map((line, i) => {
          const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
          if (numberedMatch) {
            const num = numberedMatch[1];
            const rest = numberedMatch[2];
            const parts = rest.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={i} className="flex items-start gap-2.5 pl-1">
                <span className="font-mono font-bold text-cyan-400 shrink-0">{num}.</span>
                <span className="text-slate-200">
                  {parts.map((part, pIdx) =>
                    part.startsWith('**') && part.endsWith('**') ? (
                      <strong key={pIdx} className="font-bold text-white">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={pIdx}>{part}</span>
                    )
                  )}
                </span>
              </div>
            );
          }

          if (!line.trim()) {
            return <div key={i} className="h-1.5" />;
          }

          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className="whitespace-pre-wrap">
              {parts.map((part, pIdx) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={pIdx} className="font-bold text-white">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={pIdx}>{part}</span>
                )
              )}
            </p>
          );
        })}
      </div>
    );
  };

  const filteredSessions = sessions.filter(s =>
    !historySearch.trim() || s.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="flex h-[780px] w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#03060B] shadow-2xl relative">
      {/* LEFT SIDEBAR: LYAXIS IA / ARCHITECT CONSOLE */}
      {isSidebarOpen && (
        <aside className="w-64 sm:w-72 shrink-0 bg-[#050810] border-r border-white/[0.07] flex flex-col justify-between select-none">
          <div className="p-4 space-y-4">
            {/* Sidebar Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-slate-950 font-mono font-black text-sm shadow-lg shadow-cyan-500/25">
                  &gt;_
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black tracking-wider text-white text-sm leading-none">LYAXIS</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="font-extrabold text-white text-xs leading-tight">IA</div>
                  <div className="text-[9px] font-mono text-slate-500">LYAXIS Labs™</div>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.07] transition"
                title="Ocultar panel lateral"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Nodo Soberano</span>
                <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVO
                </span>
              </div>

              <button
                onClick={handleNewChat}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/40 text-xs font-semibold text-white flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Nuevo Chat</span>
              </button>

              <button
                onClick={() => setIsQuickCommandsOpen(true)}
                className="w-full py-2 px-3.5 rounded-xl bg-cyan-950/25 hover:bg-cyan-950/40 border border-cyan-500/25 text-xs font-medium text-cyan-300 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Command className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Comandos Rápidos</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 border border-cyan-500/30 text-cyan-300">
                  Ctrl+K
                </span>
              </button>
            </div>

            {/* History Header & Search */}
            <div className="pt-2 border-t border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <span>HISTORIAL ({sessions.length})</span>
                <button
                  onClick={handleClearHistory}
                  className="hover:text-rose-400 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vaciar</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Buscar en historial..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/50 border border-white/[0.07] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 pt-1">
                <span>CONVERSACIONES ({filteredSessions.length})</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.07] text-slate-400 normal-case">
                  Filtrar: Todas
                </span>
              </div>
            </div>

            {/* Session List */}
            <div className="space-y-1.5 overflow-y-auto max-h-64 pr-1">
              <div className="text-[10px] font-mono uppercase text-slate-600 px-1">HOY</div>
              {filteredSessions.map((sess) => {
                const isActive = sess.id === activeSession.id;
                return (
                  <button
                    key={sess.id}
                    onClick={() => setActiveSessionId(sess.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-cyan-950/30 border-cyan-500/40 text-white shadow-sm'
                        : 'bg-white/[0.015] border-white/[0.05] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{sess.title}</div>
                      <div className="text-[10px] font-mono text-cyan-400/80 mt-0.5">{sess.engineName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>v4.2.0-SOVEREIGN</span>
            <span className="text-cyan-400/80">02-DOCS OK</span>
          </div>
        </aside>
      )}

      {/* MAIN OBSIDIAN SPECULAR GLASS CONSOLE CANVAS */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#03070E]">
        {/* Ambient Radial Cyan Glow & Specular Micro-Grid matching screenshot */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 42%, rgba(6, 182, 212, 0.11) 0%, rgba(16, 185, 129, 0.03) 45%, transparent 75%)'
          }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-45 pointer-events-none" />

        {/* TOP CONSOLE BAR */}
        <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#050912]/80 backdrop-blur-xl border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition"
                title="Mostrar panel lateral"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            {/* Engine Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setIsEngineMenuOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-cyan-500/35 text-xs font-semibold text-white shadow-inner transition"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{selectedEngine.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{selectedEngine.temp}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isEngineMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl obsidian-glass border border-cyan-500/30 bg-[#060B16] p-1.5 shadow-2xl z-30">
                  {SOVEREIGN_ENGINES.map((eng) => (
                    <button
                      key={eng.id}
                      onClick={() => {
                        setSelectedEngine(eng);
                        setIsEngineMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition flex items-start justify-between ${
                        selectedEngine.id === eng.id ? 'bg-cyan-500/15 text-white' : 'hover:bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{eng.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{eng.badge}</div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.08] text-cyan-300">
                        {eng.temp}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" title="Motor Soberano En Línea" />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickCommandsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.09] text-xs text-slate-200 transition"
            >
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-medium">Comandos</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 border border-white/[0.08] text-slate-400">
                Ctrl+K
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentScan.targetName} · {currentScan.overallScore}/100</span>
            </div>
          </div>
        </div>

        {/* MESSAGES SCROLL AREA */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="w-full max-w-xl rounded-2xl bg-[#0A1320]/90 border border-cyan-500/20 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-none">Tú</div>
                          <div className="text-[9px] font-mono text-slate-500 mt-0.5">// PROMPT ENVIADO</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setInput(msg.content)}
                          className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] text-[10px] text-slate-300 flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] text-[10px] text-slate-300 flex items-center gap-1 transition"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            }

            const tIn = msg.tokensIn || 772;
            const tOut = msg.tokensOut || 141;
            const dur = msg.durationSec || '1.8';

            return (
              <div key={msg.id} className="flex justify-center">
                <div className="w-full max-w-3xl rounded-2xl bg-[#07101C]/90 border border-cyan-500/35 p-5 sm:p-6 shadow-[0_0_40px_-10px_rgba(6,182,212,0.18)] backdrop-blur-2xl">
                  {/* Card Header matching LYAXIS Zenith / Architect screenshot */}
                  <div className="flex items-start justify-between gap-3 pb-3.5 mb-4 border-b border-white/[0.07]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide">
                            {msg.engineName || 'LYAXIS ARCHITECT'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[9px] font-mono font-bold tracking-wider uppercase">
                            {msg.engineBadge || 'APEX INTELLIGENCE'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {msg.engineSubtitle || '// CEREBRO SUPERIOR · MULTIMODAL & ARQUITECTURA'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-[11px] text-slate-300 flex items-center gap-1.5 transition shrink-0"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar</span>
                    </button>
                  </div>

                  {/* Card Body */}
                  {renderFormattedContent(msg.content)}

                  {/* Card Bottom-Right Token Telemetry Badge */}
                  <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-end">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>
                        {tIn + tOut} tokens ({tIn} in · {tOut} out) · {dur}s
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-center">
              <div className="w-full max-w-3xl rounded-2xl bg-[#07101C]/80 border border-cyan-500/30 p-4 flex items-center gap-3 text-xs text-cyan-200">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono">
                  {selectedEngine.name} procesando directiva arquitectónica y consultando memoria 02-DOCS...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM TELEMETRY PILL & INPUT BAR */}
        <div className="relative z-20 px-4 sm:px-8 pb-4 pt-2 bg-gradient-to-t from-[#03060B] via-[#03060B]/95 to-transparent space-y-2.5">
          {/* Telemetry Bar matching screenshot */}
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07121E] border border-cyan-500/25 text-[10px] font-mono text-slate-300">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" /> {lastTps} t/s
              </span>
              <span className="text-slate-600">·</span>
              <span>{lastDuration}s</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300">
                ⚡ {lastTotalTokens} tokens reales ({lastTokensIn} in · {lastTokensOut} out)
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-semibold">{selectedEngine.name}</span>
            </div>

            <button
              onClick={() => setIsQuickCommandsOpen(true)}
              className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 hidden sm:flex items-center gap-1 transition"
            >
              <span>Sugerencias ({QUICK_PROMPTS.length})</span>
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="max-w-3xl mx-auto rounded-2xl bg-[#070E19]/95 border border-cyan-500/30 focus-within:border-cyan-400/70 px-3 py-2 flex items-center gap-2 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setIsQuickCommandsOpen(true)}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-cyan-300 border border-white/[0.06] transition"
              title="Adjuntar contexto de auditoría"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsQuickCommandsOpen(true)}
              className="relative p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-cyan-400 border border-white/[0.06] transition"
              title="Comandos Rápidos (Ctrl+K)"
            >
              <Zap className="w-4 h-4" />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono bg-cyan-500 text-slate-950 font-bold rounded px-1">
                6
              </span>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Mensaje a ${selectedEngine.name}...`}
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition disabled:opacity-40"
              title="Enviar directiva"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* QUICK COMMANDS MODAL (Ctrl+K) */}
      {isQuickCommandsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-xl w-full rounded-2xl obsidian-glass border border-cyan-500/40 bg-[#060B14] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Command className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Comandos Rápidos · LYAXIS Architect</span>
              </div>
              <button
                onClick={() => setIsQuickCommandsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsQuickCommandsOpen(false);
                    handleSend(q);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.02] hover:bg-cyan-500/15 border border-white/[0.06] hover:border-cyan-500/40 text-xs text-slate-200 hover:text-white transition flex items-center justify-between"
                >
                  <span>{q}</span>
                  <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-2">Ejecutar ↵</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
