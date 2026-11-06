import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Layers, 
  Bot, 
  Sparkles, 
  Tag, 
  Wrench, 
  ExternalLink, 
  Filter, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  ArrowUpRight,
  ChevronRight,
  X,
  Play
} from 'lucide-react';
import { SQUADS, SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, SovereignAgent, SovereignSkill } from '../data/sovereignHarnessData.ts';

interface CatalogExplorerProps {
  onSelectAgentForSimulation?: (agent: SovereignAgent) => void;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  onSelectAgentForSimulation
}) => {
  const [activeSquadId, setActiveSquadId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'agents' | 'skills'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<SovereignAgent | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SovereignSkill | null>(null);

  // Filter Agents
  const filteredAgents = useMemo(() => {
    return SOVEREIGN_AGENTS.filter((agent) => {
      const matchesSquad = activeSquadId === 'all' || agent.squadId === activeSquadId;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        agent.name.toLowerCase().includes(q) ||
        agent.id.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q);
      return matchesSquad && matchesQuery;
    });
  }, [activeSquadId, searchQuery]);

  // Filter Skills
  const filteredSkills = useMemo(() => {
    return SOVEREIGN_SKILLS.filter((skill) => {
      const matchesSquad = activeSquadId === 'all' || skill.squadId === activeSquadId;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        skill.name.toLowerCase().includes(q) ||
        skill.id.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some(t => t.toLowerCase().includes(q));
      return matchesSquad && matchesQuery;
    });
  }, [activeSquadId, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl obsidian-glass border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              CATÁLOGO SOBERANO
            </span>
            <span className="text-xs text-slate-400">LYAXIS LABS</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Explorador de Enjambre ({SOVEREIGN_AGENTS.length} Agentes · {SOVEREIGN_SKILLS.length} Skills)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Inspecciona roles, herramientas de ejecución, directivas de sistema y dependencias de habilidades sin terceros.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/[0.08] self-start md:self-auto">
          <button
            onClick={() => setViewMode('agents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'agents'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agentes ({SOVEREIGN_AGENTS.length})</span>
          </button>
          <button
            onClick={() => setViewMode('skills')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'skills'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skills ({SOVEREIGN_SKILLS.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Squads & Live Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Squad Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSquadId('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeSquadId === 'all'
                ? 'bg-white/[0.1] text-white font-bold border border-white/[0.2]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos los Escuadrones
          </button>
          {SQUADS.map((squad) => (
            <button
              key={squad.id}
              onClick={() => setActiveSquadId(squad.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeSquadId === squad.id
                  ? `${squad.bgBadge} font-bold shadow-sm`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: squad.color }}></span>
              <span>{squad.shortName}</span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={viewMode === 'agents' ? "Buscar agentes por rol o nombre..." : "Buscar skills por tag o palabra clave..."}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of AGENTS */}
      {viewMode === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAgents.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl obsidian-glass border border-white/[0.08]">
              <Bot className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No se encontraron agentes que coincidan con la búsqueda.</p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const squad = SQUADS.find(s => s.id === agent.squadId);
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="p-5 rounded-xl cursor-pointer obsidian-glass border border-white/[0.07] hover:border-cyan-500/40 hover:bg-white/[0.03] transition group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: `${squad?.color || '#06b6d4'}15`, color: squad?.color || '#06b6d4', border: `1px solid ${squad?.color || '#06b6d4'}40` }}
                        >
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition leading-tight">
                            {agent.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-500">ID: {agent.id}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${squad?.bgBadge || 'border-slate-700 text-slate-400'}`}>
                        {squad?.shortName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Tools badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500 mr-1 flex items-center gap-0.5">
                        <Wrench className="w-3 h-3" /> Tools:
                      </span>
                      {agent.tools.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-slate-400 border border-white/[0.06]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Rol: <strong className="text-slate-300">{agent.role}</strong>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAgentForSimulation?.(agent);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-xs transition"
                    >
                      <Play className="w-3 h-3" /> Simular
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Grid of SKILLS */}
      {viewMode === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSkills.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl obsidian-glass border border-white/[0.08]">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No se encontraron skills que coincidan con la búsqueda.</p>
            </div>
          ) : (
            filteredSkills.map((skill) => {
              const squad = SQUADS.find(s => s.id === skill.squadId);
              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className="p-5 rounded-xl cursor-pointer obsidian-glass border border-white/[0.07] hover:border-emerald-500/40 hover:bg-white/[0.03] transition group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition leading-tight">
                          {skill.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">skill:{skill.id}</span>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${squad?.bgBadge || 'border-slate-700 text-slate-400'}`}>
                        {squad?.shortName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                      {skill.description}
                    </p>

                    {/* Tags */}
                    {skill.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {skill.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400/90 text-[9px] font-mono border border-emerald-500/20">
                            #{tag}
                          </span>
                        ))}
                        {skill.tags.length > 4 && (
                          <span className="text-[9px] font-mono text-slate-500">+{skill.tags.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {skill.recommends.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-slate-500">
                      Recomienda: <span className="text-slate-300">{skill.recommends.slice(0, 3).join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* AGENT DETAIL MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl obsidian-glass border border-cyan-500/40 bg-slate-950 space-y-5 relative">
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                <span className="text-xs font-mono text-cyan-400">ID: {selectedAgent.id} · Tier: {selectedAgent.tier}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <strong className="text-white block mb-1">Descripción Operativa:</strong>
                <p>{selectedAgent.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <strong className="text-cyan-300 block mb-1">Directiva Constitucional:</strong>
                <p className="font-mono text-[11px] text-cyan-200/90">{selectedAgent.systemDirective}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <strong className="text-slate-400 text-[10px] uppercase font-mono block mb-1.5">Herramientas Autorizadas:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.tools.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-white">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <strong className="text-slate-400 text-[10px] uppercase font-mono block mb-1.5">Skills Vinculadas:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.skills.length ? selectedAgent.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-xs font-mono text-violet-300">
                        {s}
                      </span>
                    )) : <span className="text-slate-500 italic">Habilidades universales del arnés</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAgent(null)}
                className="secondary-button text-xs"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const ag = selectedAgent;
                  setSelectedAgent(null);
                  onSelectAgentForSimulation?.(ag);
                }}
                className="primary-button text-xs font-semibold"
              >
                <Play className="w-4 h-4" /> Ejecutar Tarea en Simulador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKILL DETAIL MODAL */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-2xl obsidian-glass border border-emerald-500/40 bg-slate-950 space-y-5 relative">
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
                <span className="text-xs font-mono text-emerald-400">skill:{selectedSkill.id}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <strong className="text-white block mb-1">Criterio de Uso y Alcance:</strong>
                <p>{selectedSkill.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <strong className="text-slate-400 text-[10px] uppercase font-mono block mb-1.5">Tags de Búsqueda:</strong>
                <div className="flex flex-wrap gap-1">
                  {selectedSkill.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {selectedSkill.recommends.length > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <strong className="text-slate-400 text-[10px] uppercase font-mono block mb-1.5">Skills Recomendadas para Encadenamiento:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkill.recommends.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSkill(null)}
                className="secondary-button text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
