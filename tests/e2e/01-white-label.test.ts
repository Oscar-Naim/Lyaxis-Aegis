import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, SQUADS } from '../../api-src/_shared/sovereignHarnessData.ts';
import { generateMasterImplementationPlan, handleArchitectChat } from '../../api-src/_shared/lyaxisArchitect.ts';
import { runAegisForensicScan } from '../../api-src/_shared/aegisEngine.ts';
import { simulateSwarmExecution, injectSovereignHarness } from '../../api-src/_shared/sovereignHarnessEngine.ts';

// Commercial AI vendor names strictly forbidden by LYAXIS LABS white-label mandate
export const FORBIDDEN_COMMERCIAL_BRANDS = [
  'openai',
  'anthropic',
  'gemini',
  'claude',
  'copilot',
  'chatgpt'
] as const;

/**
 * Robust white-label scanner with boundary and hyphen-aware regex.
 * Avoids false positives on substrings like 'open', 'gem', 'pilot', 'anthology'.
 */
export function scanTextForCommercialBrands(text: string): { matches: string[]; count: number } {
  if (!text) return { matches: [], count: 0 };
  const matches: string[] = [];

  for (const brand of FORBIDDEN_COMMERCIAL_BRANDS) {
    // Matches \bbrand\b or brand with hyphens/underscores/slashes (e.g., openai-compatible, chatgpt-4)
    const regex = new RegExp(`(?<![a-zA-Z0-9])${brand}(?![a-zA-Z0-9])|${brand}[-_/][a-zA-Z0-9]+|[a-zA-Z0-9]+[-_/]${brand}`, 'gi');
    const found = text.match(regex);
    if (found) {
      matches.push(...found);
    }
  }

  return {
    matches,
    count: matches.length
  };
}

describe('01 · White-Label Brand Compliance Test Suite', () => {

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (HAPPY PATH & STANDARD CONTRACTS)
  // =========================================================================
  describe('Tier 1: Feature Coverage', () => {
    it('white-label scanner correctly detects direct mentions of commercial AI vendors', () => {
      const sampleWithLeak = 'We integrated OpenAI models and Claude assistants with Copilot support.';
      const result = scanTextForCommercialBrands(sampleWithLeak);
      expect(result.count).toBeGreaterThanOrEqual(3);
      expect(result.matches.map(m => m.toLowerCase())).toEqual(
        expect.arrayContaining(['openai', 'claude', 'copilot'])
      );
    });

    it('official sovereign catalog (34 agents & 274 skills) has zero commercial brand leaks', () => {
      const agentsSerialized = JSON.stringify(SOVEREIGN_AGENTS);
      const skillsSerialized = JSON.stringify(SOVEREIGN_SKILLS);
      const squadsSerialized = JSON.stringify(SQUADS);

      const agentAudit = scanTextForCommercialBrands(agentsSerialized);
      const skillAudit = scanTextForCommercialBrands(skillsSerialized);
      const squadAudit = scanTextForCommercialBrands(squadsSerialized);

      expect(agentAudit.matches).toEqual([]);
      expect(skillAudit.matches).toEqual([]);
      expect(squadAudit.matches).toEqual([]);
    });

    it('LYAXIS Architect Master Plan across all 7 supported platforms is 100% white-label', () => {
      const platforms = ['Next.js', 'WordPress', 'React', 'Nginx', 'Apache', 'Cloudflare', 'Vercel'] as const;

      for (const platform of platforms) {
        const plan = generateMasterImplementationPlan({ targetUrl: 'https://demo.lyaxis.com', targetName: 'Lyaxis Store' }, platform);
        expect(plan.length).toBeGreaterThanOrEqual(5);

        const planSerialized = JSON.stringify(plan);
        const audit = scanTextForCommercialBrands(planSerialized);
        expect(audit.matches, `Brand leaks detected in platform ${platform}`).toEqual([]);
      }
    });

    it('LYAXIS Architect conversational chat response is 100% white-label', () => {
      const chatResponse = handleArchitectChat({
        message: 'How do I secure SQL injection and optimize Core Web Vitals on Next.js?',
        history: [],
        platformTarget: 'Next.js'
      });

      expect(chatResponse).toBeTruthy();
      const audit = scanTextForCommercialBrands(chatResponse);
      expect(audit.matches).toEqual([]);
    });

    it('Aegis Engine forensic scan summaries, issue titles, and remediations are 100% white-label', async () => {
      const codeSnippet = `
        import express from 'express';
        const app = express();
        app.get('/user', (req, res) => {
          const id = req.query.id;
          db.query("SELECT * FROM users WHERE id = " + id);
        });
      `;

      const scan = await runAegisForensicScan({
        targetInput: 'user-service.ts',
        sourceCodeInput: codeSnippet,
        targetTypeHint: 'code'
      });

      expect(scan.overallScore).toBeDefined();
      const scanSerialized = JSON.stringify(scan);
      const audit = scanTextForCommercialBrands(scanSerialized);
      expect(audit.matches).toEqual([]);
    });

    it('Sovereign Harness swarm simulation execution steps and reports are 100% white-label', async () => {
      const simulation = await simulateSwarmExecution('Audit codebase and generate mitigation plan');
      expect(simulation.simulationId).toBeTruthy();
      expect(simulation.steps.length).toBeGreaterThanOrEqual(4);

      const simSerialized = JSON.stringify(simulation);
      const audit = scanTextForCommercialBrands(simSerialized);
      expect(audit.matches).toEqual([]);
    });

    it('injected sovereign governance files have zero commercial brand leaks', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lyaxis-wl-test-'));
      try {
        const injection = injectSovereignHarness(tempDir, 'full');
        expect(injection.success).toBe(true);

        const constitution = fs.readFileSync(path.join(tempDir, '02-DOCS', '01-CONSTITUTION.md'), 'utf8');
        const sessionMemory = fs.readFileSync(path.join(tempDir, '02-DOCS', '02-SESSION-MEMORY.md'), 'utf8');
        const agentsLedger = fs.readFileSync(path.join(tempDir, '02-DOCS', '03-AGENTS-LEDGER.md'), 'utf8');
        const lyaxisConfig = fs.readFileSync(path.join(tempDir, 'lyaxis.config.json'), 'utf8');

        expect(scanTextForCommercialBrands(constitution).matches).toEqual([]);
        expect(scanTextForCommercialBrands(sessionMemory).matches).toEqual([]);
        expect(scanTextForCommercialBrands(agentsLedger).matches).toEqual([]);
        expect(scanTextForCommercialBrands(lyaxisConfig).matches).toEqual([]);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('sovereign brand identity pillars are explicitly asserted across responses', () => {
      const plan = generateMasterImplementationPlan({}, 'Next.js');
      expect(plan[0].productionSafeNotes).toBeDefined();

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lyaxis-brand-test-'));
      try {
        injectSovereignHarness(tempDir, 'full');
        const constitution = fs.readFileSync(path.join(tempDir, '02-DOCS', '01-CONSTITUTION.md'), 'utf8');
        expect(constitution).toContain('LYAXIS LABS');
        expect(constitution).toContain('LYAXIS Architect');
        expect(constitution).toContain('Aegis Engine');
        expect(constitution).toContain('4.2.0-SOVEREIGN');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (EVASION, CASING, FALSE POSITIVES)
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('detects case variations: uppercase, lowercase, mixed case, and punctuation', () => {
      const testCases = [
        'OPENAI API key found',
        'anthropic claude-3-haiku provider',
        'Gemini-Flash model deployed',
        'Run with ChatGPT 4o assistant',
        'Enable GitHub Copilot suggestions'
      ];

      for (const tc of testCases) {
        const audit = scanTextForCommercialBrands(tc);
        expect(audit.count).toBeGreaterThan(0);
      }
    });

    it('detects hyphenated and slash-separated tokens (e.g. openai-compatible, claude/opus)', () => {
      const testTokens = [
        'openai-compatible endpoint',
        'anthropic-v1 format',
        'gemini_pro_vision',
        'models/chatgpt-4',
        'tools/copilot-cli'
      ];

      for (const tok of testTokens) {
        const audit = scanTextForCommercialBrands(tok);
        expect(audit.count, `Failed to detect leak in token: ${tok}`).toBeGreaterThan(0);
      }
    });

    it('resists false positives on valid standard dictionary words', () => {
      const safeText = `
        The open source community created an opening for software developers.
        We observed a gemstone in the classical anthropology museum.
        The co-pilot in the aviation cockpit operated the airplane safely.
      `;

      const audit = scanTextForCommercialBrands(safeText);
      expect(audit.matches).toEqual([]);
    });

    it('handles empty inputs, pure whitespace, and extreme sizes without throwing', () => {
      expect(scanTextForCommercialBrands('').count).toBe(0);
      expect(scanTextForCommercialBrands('   \n\t  ').count).toBe(0);

      const massiveBuffer = 'const validVar = 1;\n'.repeat(5000);
      const audit = scanTextForCommercialBrands(massiveBuffer);
      expect(audit.count).toBe(0);
    });

    it('detects forbidden brands embedded inside markdown code fences and JSON blocks', () => {
      const markdown = `
        # Architecture Guide
        \`\`\`json
        {
          "provider": "openai",
          "defaultModel": "gpt-4o"
        }
        \`\`\`
      `;
      const audit = scanTextForCommercialBrands(markdown);
      expect(audit.matches.map(m => m.toLowerCase())).toContain('openai');
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations', () => {
    it('combines harness injection + architectural plan + forensic scan into single zero-leak pipeline', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lyaxis-pipe-wl-'));
      try {
        // 1. Injected harness
        const injectResult = injectSovereignHarness(tempDir, 'secops');
        expect(injectResult.success).toBe(true);

        // 2. Scan injected code
        const scanResult = await runAegisForensicScan({
          targetInput: path.join(tempDir, '01-TOOLS', 'lyaxis-verify.cjs'),
          targetTypeHint: 'code'
        });

        // 3. Generate architectural plan based on scan
        const masterPlan = generateMasterImplementationPlan(scanResult, 'Next.js');

        // 4. Serialize entire combined pipeline payload
        const pipelinePayload = JSON.stringify({
          injectResult,
          scanResult,
          masterPlan
        });

        const audit = scanTextForCommercialBrands(pipelinePayload);
        expect(audit.matches).toEqual([]);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('audits core backend modules and confirms zero commercial brand mentions', () => {
      const coreFiles = [
        'api-src/_shared/sovereignHarnessData.ts',
        'api-src/_shared/lyaxisArchitect.ts',
        'api-src/_shared/aegisEngine.ts',
        'api-src/_shared/sovereignHarnessEngine.ts',
        'src/data/sovereignHarnessData.ts'
      ];

      for (const relPath of coreFiles) {
        const fullPath = path.resolve(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const audit = scanTextForCommercialBrands(content);
          expect(audit.matches, `Core file ${relPath} contains commercial AI leaks: ${audit.matches.join(', ')}`).toEqual([]);
        }
      }
    });

    it('strictly verifies zero commercial brand mentions across all frontend components and CLI', () => {
      const candidateFiles = [
        'cli/main.ts',
        'src/components/ScannerView.tsx',
        'src/components/AnalyticsDashboard.tsx',
        'src/components/RemediationViewer.tsx',
        'src/components/Navbar.tsx',
        'src/components/ArchitectureChatbot.tsx',
        'src/App.tsx',
        'PROJECT.md'
      ];

      const foundEscalations: Array<{ file: string; matches: string[] }> = [];

      for (const f of candidateFiles) {
        const p = path.resolve(process.cwd(), f);
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8');
          const audit = scanTextForCommercialBrands(content);
          if (audit.count > 0) {
            foundEscalations.push({ file: f, matches: audit.matches });
          }
        }
      }

      expect(foundEscalations, `Forbidden commercial brand leaks detected in: ${JSON.stringify(foundEscalations)}`).toEqual([]);
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD SCENARIOS
  // =========================================================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('high-throughput compliance scanning: evaluates 1,000 log lines in < 100ms with 100% precision', () => {
      const logs: string[] = [];
      const leakIndices = new Set([17, 142, 580, 891]);

      for (let i = 0; i < 1000; i++) {
        if (leakIndices.has(i)) {
          logs.push(`[EVENT-${i}] Unauthorized commercial call to openai-endpoint routed through fallback proxy.`);
        } else {
          logs.push(`[EVENT-${i}] LYAXIS Architect validated AST invariant #42 for sovereign agent developer.`);
        }
      }

      const t0 = performance.now();
      const detectedIndices: number[] = [];

      logs.forEach((log, idx) => {
        const audit = scanTextForCommercialBrands(log);
        if (audit.count > 0) {
          detectedIndices.push(idx);
        }
      });
      const duration = performance.now() - t0;

      expect(detectedIndices).toEqual([17, 142, 580, 891]);
      expect(duration).toBeLessThan(100);
    });
  });
});
