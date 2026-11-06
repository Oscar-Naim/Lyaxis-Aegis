import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { SQUADS, SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, HARNESS_METRICS } from '../src/data/sovereignHarnessData.ts';
import { detectProject, injectSovereignHarness, runDoctor, simulateSwarmExecution } from '../api-src/_shared/sovereignHarnessEngine.ts';
import { runAegisForensicScan } from '../api-src/_shared/aegisEngine.ts';

describe('LYAXIS LABS Sovereign Harness - Master Catalog', () => {
  it('should have 6 tactical squads with valid pillars and colors', () => {
    expect(SQUADS).toHaveLength(6);
    const pillars = SQUADS.map(s => s.pillar);
    expect(pillars).toContain('LYAXIS Architect');
    expect(pillars).toContain('Aegis Engine');

    SQUADS.forEach(s => {
      expect(s.id).toBeDefined();
      expect(s.name).toBeDefined();
      expect(s.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(s.description.length).toBeGreaterThan(15);
    });
  });

  it('should contain exactly 34 specialized sovereign agents', () => {
    expect(SOVEREIGN_AGENTS).toHaveLength(34);
    expect(HARNESS_METRICS.totalAgents).toBe(34);

    SOVEREIGN_AGENTS.forEach(agent => {
      expect(agent.id).toBeDefined();
      expect(agent.name).toBeDefined();
      expect(agent.role).toBeDefined();
      expect(agent.tools).toBeInstanceOf(Array);
      expect(agent.tools.length).toBeGreaterThan(0);
      expect(agent.systemDirective).toContain('LYAXIS LABS');
      // Ensure zero external brand leakages
      expect(agent.systemDirective.toLowerCase()).not.toContain('ericrisco');
    });
  });

  it('should contain exactly 274 sovereign skills categorized by squad', () => {
    expect(SOVEREIGN_SKILLS).toHaveLength(274);
    expect(HARNESS_METRICS.totalSkills).toBe(274);

    const squadIds = SQUADS.map(s => s.id);
    SOVEREIGN_SKILLS.forEach(skill => {
      expect(skill.id).toBeDefined();
      expect(skill.name).toBeDefined();
      expect(skill.description.length).toBeGreaterThan(10);
      expect(squadIds).toContain(skill.squadId);
      // Ensure zero external brand leakages
      expect(skill.description.toLowerCase()).not.toContain('@ericrisco');
    });
  });
});

describe('LYAXIS LABS Sovereign Harness - Core Engine & Tooling', () => {
  it('should correctly detect project repository parameters', () => {
    const projectInfo = detectProject(process.cwd());
    expect(projectInfo.path).toBeDefined();
    expect(projectInfo.detectedLanguages).toContain('TypeScript/JavaScript');
    expect(projectInfo.detectedFrameworks).toContain('React');
  });

  it('should inject complete sovereign harness into a target directory', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lyaxis-test-'));
    try {
      const result = injectSovereignHarness(tempDir, 'full');
      expect(result.success).toBe(true);
      expect(result.filesCreated).toContain('02-DOCS/01-CONSTITUTION.md');
      expect(result.filesCreated).toContain('02-DOCS/02-SESSION-MEMORY.md');
      expect(result.filesCreated).toContain('02-DOCS/03-AGENTS-LEDGER.md');
      expect(result.filesCreated).toContain('01-TOOLS/lyaxis-verify.cjs');
      expect(result.filesCreated).toContain('01-TOOLS/doctor.cjs');
      expect(result.filesCreated).toContain('lyaxis.config.json');

      expect(fs.existsSync(path.join(tempDir, '02-DOCS/01-CONSTITUTION.md'))).toBe(true);
      const constitution = fs.readFileSync(path.join(tempDir, '02-DOCS/01-CONSTITUTION.md'), 'utf8');
      expect(constitution).toContain('LYAXIS LABS');
      expect(constitution).toContain('LYAXIS Architect & Aegis Engine');
      expect(constitution).toContain('TEST-DRIVEN INTEGRITY');

      const infoAfter = detectProject(tempDir);
      expect(infoAfter.hasHarness).toBe(true);
      expect(infoAfter.hasConstitution).toBe(true);
      expect(infoAfter.hasMemory).toBe(true);
      expect(infoAfter.hasTools).toBe(true);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should run doctor diagnostic report', () => {
    const doctorReport = runDoctor(process.cwd());
    expect(doctorReport.score).toBeGreaterThanOrEqual(0);
    expect(doctorReport.status).toBeDefined();
    expect(doctorReport.recommendations).toBeInstanceOf(Array);
  });

  it('should simulate multi-agent swarm execution end-to-end', async () => {
    const sim = await simulateSwarmExecution('Refactorizar autenticación JWT aplicando RS256 asimétrico y TDD');
    expect(sim.status).toBe('success');
    expect(sim.steps.length).toBe(5);
    expect(sim.steps[0].pillar).toBe('LYAXIS Architect');
    expect(sim.steps[1].pillar).toBe('Aegis Engine');
    expect(sim.verificationPassed).toBe(true);
    expect(sim.totalDurationMs).toBeGreaterThan(0);
  });
});

describe('Aegis Forensic Scan Engine', () => {
  it('should detect SQL injection vulnerability and generate remediation', async () => {
    const vulnerableSqlCode = `
      function getUser(req, res) {
        const userId = req.body.userId;
        const query = "SELECT * FROM users WHERE id = '" + userId + "'";
        return db.query(query);
      }
    `;

    const result = await runAegisForensicScan({
      targetInput: 'user-service',
      sourceCodeInput: vulnerableSqlCode,
      targetTypeHint: 'code'
    });

    expect(result.overallScore).toBeDefined();
    expect(result.issues.length).toBeGreaterThan(0);
    const sqlIssue = result.issues.find(i => i.cwe === 'CWE-89' || i.title.toLowerCase().includes('sql'));
    expect(sqlIssue).toBeDefined();
    expect(sqlIssue?.remediation).toBeDefined();
    expect(sqlIssue?.remediation.remediatedSnippet).toBeDefined();
  });
});
