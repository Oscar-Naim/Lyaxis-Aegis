import { describe, it, expect } from 'vitest';
import { 
  SOVEREIGN_AGENTS, 
  SOVEREIGN_SKILLS, 
  SQUADS, 
  HARNESS_METRICS 
} from '../src/data/sovereignHarnessData.ts';
import { 
  SOVEREIGN_AGENTS as BACKEND_AGENTS, 
  SOVEREIGN_SKILLS as BACKEND_SKILLS, 
  SQUADS as BACKEND_SQUADS, 
  HARNESS_METRICS as BACKEND_METRICS 
} from '../api-src/_shared/sovereignHarnessData.ts';
import { simulateSwarmExecution } from '../api-src/_shared/sovereignHarnessEngine.ts';

describe('M1 Challenger 2: Catalog Data & Engine Stress Harness', () => {

  // =========================================================================
  // 1. EXACT ARRAY COUNTS
  // =========================================================================
  describe('1. Catalog Array Length Verification', () => {
    it('Frontend catalog contains exactly 34 agents and 274 skills', () => {
      expect(SOVEREIGN_AGENTS.length).toBe(34);
      expect(SOVEREIGN_SKILLS.length).toBe(274);
      expect(SQUADS.length).toBe(6);
    });

    it('Backend catalog contains exactly 34 agents and 274 skills', () => {
      expect(BACKEND_AGENTS.length).toBe(34);
      expect(BACKEND_SKILLS.length).toBe(274);
      expect(BACKEND_SQUADS.length).toBe(6);
    });

    it('Frontend and Backend catalogs are identical in length and content', () => {
      expect(SOVEREIGN_AGENTS).toEqual(BACKEND_AGENTS);
      expect(SOVEREIGN_SKILLS).toEqual(BACKEND_SKILLS);
      expect(SQUADS).toEqual(BACKEND_SQUADS);
    });

    it('HARNESS_METRICS matches the catalog counts in both modules', () => {
      expect(HARNESS_METRICS.totalAgents).toBe(34);
      expect(HARNESS_METRICS.totalSkills).toBe(274);
      expect(HARNESS_METRICS.totalSquads).toBe(6);
      expect(BACKEND_METRICS.totalAgents).toBe(34);
      expect(BACKEND_METRICS.totalSkills).toBe(274);
      expect(BACKEND_METRICS.totalSquads).toBe(6);
    });
  });

  // =========================================================================
  // 2. UNIQUENESS & COLLISION RESISTANCE
  // =========================================================================
  describe('2. ID Uniqueness & Collision Resistance', () => {
    it('verifies zero duplicate agent IDs', () => {
      const agentIds = SOVEREIGN_AGENTS.map(a => a.id);
      const uniqueIds = new Set(agentIds);
      expect(uniqueIds.size).toBe(34);
      expect(agentIds.length).toBe(34);
    });

    it('verifies zero duplicate skill IDs', () => {
      const skillIds = SOVEREIGN_SKILLS.map(s => s.id);
      const uniqueIds = new Set(skillIds);
      expect(uniqueIds.size).toBe(274);
      expect(skillIds.length).toBe(274);
    });

    it('verifies zero duplicate squad IDs', () => {
      const squadIds = SQUADS.map(s => s.id);
      const uniqueIds = new Set(squadIds);
      expect(uniqueIds.size).toBe(6);
      expect(squadIds.length).toBe(6);
    });

    it('verifies no case-insensitive or whitespace-padded ID collisions', () => {
      const normalizedAgentIds = new Set(SOVEREIGN_AGENTS.map(a => a.id.trim().toLowerCase()));
      expect(normalizedAgentIds.size).toBe(34);

      const normalizedSkillIds = new Set(SOVEREIGN_SKILLS.map(s => s.id.trim().toLowerCase()));
      expect(normalizedSkillIds.size).toBe(274);
    });
  });

  // =========================================================================
  // 3. RECOGNIZED SQUAD MEMBERSHIP
  // =========================================================================
  describe('3. Recognized Squad Membership & Distribution', () => {
    const recognizedSquadIds = new Set(SQUADS.map(s => s.id));

    it('every agent belongs to a recognized squad ID', () => {
      for (const agent of SOVEREIGN_AGENTS) {
        expect(
          recognizedSquadIds.has(agent.squadId),
          `Agent ${agent.id} references unrecognized squadId: ${agent.squadId}`
        ).toBe(true);
      }
    });

    it('every skill belongs to a recognized squad ID', () => {
      for (const skill of SOVEREIGN_SKILLS) {
        expect(
          recognizedSquadIds.has(skill.squadId),
          `Skill ${skill.id} references unrecognized squadId: ${skill.squadId}`
        ).toBe(true);
      }
    });

    it('partition sum across all squads equals exactly 34 agents and 274 skills', () => {
      let agentSum = 0;
      let skillSum = 0;

      for (const squad of SQUADS) {
        const agCount = SOVEREIGN_AGENTS.filter(a => a.squadId === squad.id).length;
        const skCount = SOVEREIGN_SKILLS.filter(s => s.squadId === squad.id).length;
        agentSum += agCount;
        skillSum += skCount;
      }

      expect(agentSum).toBe(34);
      expect(skillSum).toBe(274);
    });
  });

  // =========================================================================
  // 4. ENGINE SIMULATION INTEROPERABILITY & STRESS TESTING
  // =========================================================================
  describe('4. Sovereign Engine Simulation Interoperability & Corner Cases', () => {
    it('simulates standard swarm task successfully with 5 coordinated steps', async () => {
      const result = await simulateSwarmExecution('Refactorizar autenticación con TDD');
      expect(result.status).toBe('success');
      expect(result.steps.length).toBe(5);
      expect(result.verificationPassed).toBe(true);
      expect(result.totalDurationMs).toBeGreaterThan(0);
      expect(result.steps[0].pillar).toBe('LYAXIS Architect');
      expect(result.steps[1].pillar).toBe('Aegis Engine');
    });

    it('handles empty task prompt ("") without fatal process crash', async () => {
      const result = await simulateSwarmExecution('');
      expect(result.status).toBe('success');
      expect(result.steps.length).toBe(5);
      expect(result.taskPrompt).toBe('');
    });

    it('handles whitespace-only task prompt ("   ") cleanly', async () => {
      const result = await simulateSwarmExecution('     ');
      expect(result.status).toBe('success');
      expect(result.steps.length).toBe(5);
    });

    it('handles oversized task prompt (100k chars) without memory overflow or unbounded output', async () => {
      const hugePrompt = 'B'.repeat(100000);
      const result = await simulateSwarmExecution(hugePrompt);
      expect(result.status).toBe('success');
      // Step 0 truncates output prompt display to 80 chars
      expect(result.steps[0].output.length).toBeLessThan(500);
    });

    it('handles adversarial injection characters (XSS, SQLi, null bytes) safely', async () => {
      const adversarial = `<script>alert('pwned')</script>'; DROP TABLE sessions; -- \x00\r\n`;
      const result = await simulateSwarmExecution(adversarial);
      expect(result.status).toBe('success');
      expect(result.verificationPassed).toBe(true);
    });

    it('documents engine behavior when called with corner case agent IDs or extra arguments', async () => {
      // Testing signature behavior: simulateSwarmExecution('non-existent-agent-id', 'task prompt')
      // Worker M1 passed ('developer', 'Test sovereign catalog') thinking it simulated 'developer'.
      const result = await (simulateSwarmExecution as any)('non-existent-agent-id', 'Task prompt');
      expect(result).toBeDefined();
      expect(result.taskPrompt).toBe('non-existent-agent-id'); // Demonstrates 1st arg is treated as taskPrompt
      expect(result.steps.map(s => s.agentId)).toEqual([
        'lyaxis-architect',
        'aegis-forensic-engine',
        'developer',
        'refuter-security',
        'asdd-gate'
      ]);
    });

    it('tests engine vulnerability to null/undefined task prompt', async () => {
      // Notice: If called with null or undefined, does simulateSwarmExecution throw TypeError?
      // An adversarial challenger checks this boundary condition.
      let threwNull = false;
      let nullErrorMessage = '';
      try {
        await (simulateSwarmExecution as any)(null);
      } catch (err: any) {
        threwNull = true;
        nullErrorMessage = err.message;
      }
      expect(threwNull).toBe(true);
      expect(nullErrorMessage).toContain('Cannot read properties of null');
    });
  });

  // =========================================================================
  // 5. COMMERCIAL BRAND PURITY AUDIT
  // =========================================================================
  describe('5. White-Label Catalog Purity Check', () => {
    it('ensures zero occurrences of commercial AI vendors in both catalogs', () => {
      const forbiddenBrands = ['openai', 'anthropic', 'gemini', 'claude', 'copilot', 'chatgpt', 'mistral', 'llama'];
      const serialized = JSON.stringify({ SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, SQUADS });

      for (const brand of forbiddenBrands) {
        const regex = new RegExp(`\\b${brand}\\b`, 'gi');
        const matches = serialized.match(regex);
        expect(matches, `Forbidden commercial brand leak: "${brand}"`).toBeNull();
      }
    });
  });
});
