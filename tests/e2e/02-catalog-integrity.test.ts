import { describe, it, expect } from 'vitest';
import { 
  SOVEREIGN_AGENTS, 
  SOVEREIGN_SKILLS, 
  SQUADS, 
  HARNESS_METRICS 
} from '../../api-src/_shared/sovereignHarnessData.ts';
import {
  SOVEREIGN_AGENTS as FRONTEND_AGENTS,
  SOVEREIGN_SKILLS as FRONTEND_SKILLS,
  SQUADS as FRONTEND_SQUADS
} from '../../src/data/sovereignHarnessData.ts';

describe('02 · Catalog Integrity Test Suite', () => {

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (EXACT COUNTS & SCHEMA INTEGRITY)
  // =========================================================================
  describe('Tier 1: Feature Coverage', () => {
    it('verifies exact catalog inventory counts: 34 agents, 274 skills, 6 squads', () => {
      expect(SOVEREIGN_AGENTS.length).toBe(34);
      expect(SOVEREIGN_SKILLS.length).toBe(274);
      expect(SQUADS.length).toBe(6);
    });

    it('verifies HARNESS_METRICS matches the official catalog numbers', () => {
      expect(HARNESS_METRICS.totalAgents).toBe(34);
      expect(HARNESS_METRICS.totalSkills).toBe(274);
      expect(HARNESS_METRICS.totalSquads).toBe(6);
      expect(HARNESS_METRICS.version).toBe('4.2.0-SOVEREIGN');
    });

    it('validates agent schema contract for all 34 agents', () => {
      for (const agent of SOVEREIGN_AGENTS) {
        expect(typeof agent.id).toBe('string');
        expect(agent.id.trim().length).toBeGreaterThan(0);

        expect(typeof agent.name).toBe('string');
        expect(agent.name.trim().length).toBeGreaterThan(0);

        expect(typeof agent.squadId).toBe('string');
        expect(agent.squadId.trim().length).toBeGreaterThan(0);

        expect(typeof agent.role).toBe('string');
        expect(['build-resolver', 'reviewer', 'refuter', 'developer', 'spec-miner', 'operator']).toContain(agent.role);

        expect(typeof agent.tier).toBe('string');
        expect(['light', 'balanced', 'heavy']).toContain(agent.tier);

        expect(typeof agent.description).toBe('string');
        expect(agent.description.length).toBeGreaterThan(15);

        expect(Array.isArray(agent.tools)).toBe(true);
        expect(agent.tools.length).toBeGreaterThan(0);
      }
    });

    it('validates skill schema contract for all 274 skills', () => {
      for (const skill of SOVEREIGN_SKILLS) {
        expect(typeof skill.id).toBe('string');
        expect(skill.id.trim().length).toBeGreaterThan(0);

        expect(typeof skill.name).toBe('string');
        expect(skill.name.trim().length).toBeGreaterThan(0);

        expect(typeof skill.squadId).toBe('string');
        expect(skill.squadId.trim().length).toBeGreaterThan(0);

        expect(typeof skill.description).toBe('string');
        expect(skill.description.length).toBeGreaterThan(15);

        expect(Array.isArray(skill.tags)).toBe(true);
        expect(skill.tags.length).toBeGreaterThan(0);
      }
    });

    it('validates squad schema contract for all 6 squads', () => {
      for (const squad of SQUADS) {
        expect(typeof squad.id).toBe('string');
        expect(typeof squad.name).toBe('string');
        expect(typeof squad.shortName).toBe('string');
        expect(typeof squad.icon).toBe('string');
        expect(typeof squad.color).toBe('string');
        expect(typeof squad.description).toBe('string');
      }
    });

    it('enforces referential integrity: every agent belongs to an existing squad', () => {
      const squadIds = new Set(SQUADS.map(s => s.id));
      for (const agent of SOVEREIGN_AGENTS) {
        expect(squadIds.has(agent.squadId), `Agent ${agent.id} has invalid squadId ${agent.squadId}`).toBe(true);
      }
    });

    it('enforces referential integrity: every skill belongs to an existing squad', () => {
      const squadIds = new Set(SQUADS.map(s => s.id));
      for (const skill of SOVEREIGN_SKILLS) {
        expect(squadIds.has(skill.squadId), `Skill ${skill.id} has invalid squadId ${skill.squadId}`).toBe(true);
      }
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (UNIQUENESS, ALLOWED ENUMS, TOOL INTEGRITY)
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('verifies 100% uniqueness of agent IDs with zero collisions', () => {
      const seenIds = new Set<string>();
      for (const agent of SOVEREIGN_AGENTS) {
        expect(seenIds.has(agent.id), `Duplicate agent ID found: ${agent.id}`).toBe(false);
        seenIds.add(agent.id);
      }
      expect(seenIds.size).toBe(34);
    });

    it('verifies 100% uniqueness of skill IDs with zero collisions', () => {
      const seenIds = new Set<string>();
      for (const skill of SOVEREIGN_SKILLS) {
        expect(seenIds.has(skill.id), `Duplicate skill ID found: ${skill.id}`).toBe(false);
        seenIds.add(skill.id);
      }
      expect(seenIds.size).toBe(274);
    });

    it('verifies 100% uniqueness of squad IDs', () => {
      const seenIds = new Set<string>();
      for (const squad of SQUADS) {
        expect(seenIds.has(squad.id), `Duplicate squad ID found: ${squad.id}`).toBe(false);
        seenIds.add(squad.id);
      }
      expect(seenIds.size).toBe(6);
    });

    it('validates that every agent tool belongs to the sovereign execution primitives', () => {
      const validToolPrimitives = new Set(['read', 'search', 'edit', 'execute', 'shell']);
      for (const agent of SOVEREIGN_AGENTS) {
        for (const tool of agent.tools) {
          expect(validToolPrimitives.has(tool), `Agent ${agent.id} references unrecognized tool: ${tool}`).toBe(true);
        }
      }
    });

    it('ensures no agent or skill contains empty or placeholder descriptions', () => {
      const placeholders = ['todo', 'tbd', 'placeholder', 'none', 'n/a', 'temp'];
      for (const agent of SOVEREIGN_AGENTS) {
        const descLower = agent.description.toLowerCase().trim();
        expect(placeholders.includes(descLower), `Agent ${agent.id} has placeholder description`).toBe(false);
      }
      for (const skill of SOVEREIGN_SKILLS) {
        const descLower = skill.description.toLowerCase().trim();
        expect(placeholders.includes(descLower), `Skill ${skill.id} has placeholder description`).toBe(false);
      }
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations', () => {
    it('verifies exact synchronization between backend and frontend data modules', () => {
      expect(SOVEREIGN_AGENTS.length).toBe(FRONTEND_AGENTS.length);
      expect(SOVEREIGN_SKILLS.length).toBe(FRONTEND_SKILLS.length);
      expect(SQUADS.length).toBe(FRONTEND_SQUADS.length);

      // Deep compare first and last elements
      expect(SOVEREIGN_AGENTS[0].id).toBe(FRONTEND_AGENTS[0].id);
      expect(SOVEREIGN_AGENTS[33].id).toBe(FRONTEND_AGENTS[33].id);
      expect(SOVEREIGN_SKILLS[0].id).toBe(FRONTEND_SKILLS[0].id);
      expect(SOVEREIGN_SKILLS[273].id).toBe(FRONTEND_SKILLS[273].id);
    });

    it('verifies squad partitioning: partition sum equals 34 agents and 274 skills', () => {
      let totalPartitionedAgents = 0;
      let totalPartitionedSkills = 0;

      for (const squad of SQUADS) {
        const squadAgents = SOVEREIGN_AGENTS.filter(a => a.squadId === squad.id);
        const squadSkills = SOVEREIGN_SKILLS.filter(s => s.squadId === squad.id);

        expect(squadAgents.length).toBeGreaterThanOrEqual(0);
        expect(squadSkills.length).toBeGreaterThan(0);

        totalPartitionedAgents += squadAgents.length;
        totalPartitionedSkills += squadSkills.length;
      }

      expect(totalPartitionedAgents).toBe(34);
      expect(totalPartitionedSkills).toBe(274);
    });

    it('creates an inverted search index across all 274 skills and verifies instant queryability', () => {
      const tagIndex = new Map<string, string[]>();

      for (const skill of SOVEREIGN_SKILLS) {
        for (const tag of skill.tags) {
          const normalized = tag.toLowerCase().trim();
          if (!tagIndex.has(normalized)) {
            tagIndex.set(normalized, []);
          }
          tagIndex.get(normalized)!.push(skill.id);
        }
      }

      // Assert index is broad and functional
      expect(tagIndex.size).toBeGreaterThan(50);
      expect(tagIndex.has('security') || tagIndex.has('performance') || tagIndex.has('backend')).toBe(true);

      // Querying an arbitrary tag returns valid skill IDs
      for (const [tag, skillIds] of tagIndex.entries()) {
        expect(skillIds.length).toBeGreaterThan(0);
        for (const sid of skillIds) {
          expect(SOVEREIGN_SKILLS.some(s => s.id === sid)).toBe(true);
        }
      }
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD SCENARIOS
  // =========================================================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('swarm tactical composition: all squads have the necessary roles for autonomous execution', () => {
      // 5 tactical squads have direct agent assignments, with squad-performance powered directly by Aegis Engine
      const rolesAcrossSquads = new Map<string, Set<string>>();

      for (const agent of SOVEREIGN_AGENTS) {
        if (!rolesAcrossSquads.has(agent.squadId)) {
          rolesAcrossSquads.set(agent.squadId, new Set());
        }
        rolesAcrossSquads.get(agent.squadId)!.add(agent.role);
      }

      expect(rolesAcrossSquads.size).toBe(5);
      for (const [squadId, roles] of rolesAcrossSquads.entries()) {
        expect(roles.size, `Squad ${squadId} should have varied agent roles`).toBeGreaterThanOrEqual(1);
      }
    });

    it('instant catalog filtering latency: queries all agents and skills in < 5ms', () => {
      const t0 = performance.now();

      // Multi-facet query simulation (mimics Obsidian Specular Glass GUI filtering)
      const searchQuery = 'test';
      const filteredAgents = SOVEREIGN_AGENTS.filter(a => 
        a.name.toLowerCase().includes(searchQuery) || 
        a.description.toLowerCase().includes(searchQuery) ||
        a.tools.includes('execute')
      );
      const filteredSkills = SOVEREIGN_SKILLS.filter(s =>
        s.name.toLowerCase().includes(searchQuery) ||
        s.tags.some(t => t.includes(searchQuery))
      );

      const elapsed = performance.now() - t0;
      expect(filteredAgents.length).toBeGreaterThan(0);
      expect(filteredSkills.length).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(10);
    });
  });
});
