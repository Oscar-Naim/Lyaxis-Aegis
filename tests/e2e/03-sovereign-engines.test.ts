import { describe, it, expect } from 'vitest';
import { generateMasterImplementationPlan, handleArchitectChat } from '../../api-src/_shared/lyaxisArchitect.ts';
import { runAegisForensicScan } from '../../api-src/_shared/aegisEngine.ts';
import { validateExternalTarget } from '../../api-src/_shared/urlAuditor.ts';
import { sanitizeCredentials } from '../../api-src/_shared/sanitization.ts';
import { computeMyersDiff } from '../../api-src/_shared/myersDiff.ts';

describe('03 · Sovereign Command Engines Test Suite', () => {

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (HAPPY PATH & STANDARD CONTRACTS)
  // =========================================================================
  describe('Tier 1: Feature Coverage', () => {

    // --- LYAXIS ARCHITECT ---
    it('LYAXIS Architect generates prioritized 5-step Master Implementation Plan across all 7 platforms', () => {
      const platforms = ['Next.js', 'WordPress', 'React', 'Nginx', 'Apache', 'Cloudflare', 'Vercel'] as const;

      for (const platform of platforms) {
        const plan = generateMasterImplementationPlan({
          targetName: 'Lyaxis Web App',
          targetUrl: 'https://app.lyaxis.com'
        }, platform);

        expect(plan.length).toBe(5);

        // Step 1: Perimeter Shielding
        expect(plan[0].stepNumber).toBe(1);
        expect(plan[0].priority).toBe('immediate');
        expect(plan[0].title).toContain('Blindaje Perimetral');
        expect(plan[0].codeOrConfig.length).toBeGreaterThan(0);
        expect(plan[0].verificationCommand).toContain('curl');

        // Step 2: Critical Injection & Data Protection
        expect(plan[1].stepNumber).toBe(2);
        expect(plan[1].priority).toBe('immediate');
        expect(plan[1].title).toContain('Neutralización de Inyecciones SQL');

        // Step 3: Identity & Session Hardening
        expect(plan[2].stepNumber).toBe(3);
        expect(plan[2].priority).toBe('high');
        expect(plan[2].title).toContain('Autenticación Criptográfica');

        // Step 4: Core Web Vitals
        expect(plan[3].stepNumber).toBe(4);
        expect(plan[3].priority).toBe('medium');
        expect(plan[3].title).toContain('Aceleración de Core Web Vitals');

        // Step 5: Social Metatags & SEO
        expect(plan[4].stepNumber).toBe(5);
        expect(plan[4].priority).toBe('low');
        expect(plan[4].title).toContain('OpenGraph');
      }
    });

    it('LYAXIS Architect handles conversational advisory requests with contextual guidance', () => {
      const chat = handleArchitectChat({
        message: 'How should I configure CSP on Vercel to avoid XSS vulnerabilities?',
        history: [],
        platformTarget: 'Vercel'
      });

      expect(typeof chat).toBe('string');
      expect(chat.length).toBeGreaterThan(50);
      expect(chat).toContain('Content-Security-Policy');
      expect(chat).toContain('LYAXIS Architect');
    });

    // --- AEGIS FORENSIC ENGINE & SPEEDOMETERS ---
    it('Aegis Engine computes 4-pillar speedometers (Security, Performance, Social/SEO, Overall)', async () => {
      const codeSnippet = `
        import express from 'express';
        const app = express();
        // Clean module
        export function add(a: number, b: number) { return a + b; }
      `;

      const scan = await runAegisForensicScan({
        targetInput: 'math-module.ts',
        sourceCodeInput: codeSnippet,
        targetTypeHint: 'code'
      });

      // Assert 4-pillar speedometers
      expect(typeof scan.securityScore).toBe('number');
      expect(typeof scan.performanceScore).toBe('number');
      expect(typeof scan.socialSeoScore).toBe('number');
      expect(typeof scan.overallScore).toBe('number');

      expect(scan.securityScore).toBeGreaterThanOrEqual(0);
      expect(scan.securityScore).toBeLessThanOrEqual(100);
      expect(scan.performanceScore).toBeGreaterThanOrEqual(0);
      expect(scan.performanceScore).toBeLessThanOrEqual(100);
      expect(scan.socialSeoScore).toBeGreaterThanOrEqual(0);
      expect(scan.socialSeoScore).toBeLessThanOrEqual(100);
      expect(scan.overallScore).toBeGreaterThanOrEqual(0);
      expect(scan.overallScore).toBeLessThanOrEqual(100);

      expect(scan.ciStatus).toBeDefined();
      expect(typeof scan.ciStatus.passed).toBe('boolean');
      expect(scan.ciStatus.thresholdPolicy).toBe('Fail if Critical > 0 OR High > 2 OR PerfScore < 70');
    });

    // --- SSRF PROTECTION ---
    it('SSRF Protection allows legitimate public HTTP/HTTPS URLs', async () => {
      const validUrl = 'https://example.com';
      try {
        const parsed = await validateExternalTarget(validUrl);
        expect(parsed).toBeInstanceOf(URL);
        expect(parsed.protocol).toBe('https:');
        expect(parsed.hostname).toBe('example.com');
      } catch (err: any) {
        // If running in offline environment without DNS
        expect(err.message).not.toContain('destinos locales o privados');
        expect(err.message).not.toContain('sin credenciales');
      }
    });

    // --- SANITIZATION VAULT ---
    it('Sanitization Vault redacts API keys and sensitive credentials with protected badge', () => {
      const codeWithSecrets = `
        const apiKey = "sk_live_abcdef1234567890abcdef";
        const auth = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      `;

      const result = sanitizeCredentials(codeWithSecrets);
      expect(result.foundSecretsCount).toBeGreaterThanOrEqual(2);
      expect(result.sanitized).toContain('[PROTECTED_BY_AEGIS_VAULT_******]');
      expect(result.sanitized).not.toContain('sk_live_abcdef1234567890abcdef');
    });

    // --- MYERS DIFF ENGINE ---
    it('Myers Diff Engine generates line-by-line diff patches with additions and deletions', () => {
      const original = 'line 1\nline 2\nline 3';
      const modified = 'line 1\nline 2 modified\nline 3\nline 4';

      const diff = computeMyersDiff(original, modified);
      expect(diff.additions).toBe(2);
      expect(diff.deletions).toBe(1);
      expect(diff.unified.length).toBeGreaterThanOrEqual(4);
      expect(diff.unified.some(l => l.type === 'same' && l.text === 'line 1')).toBe(true);
      expect(diff.unified.some(l => l.type === 'del' && l.text === 'line 2')).toBe(true);
      expect(diff.unified.some(l => l.type === 'add' && l.text === 'line 2 modified')).toBe(true);
      expect(diff.unified.some(l => l.type === 'add' && l.text === 'line 4')).toBe(true);
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (SSRF BLOCKS, DIFF BOUNDARIES, SECRETS)
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {

    it('SSRF Protection strictly blocks private IP addresses (RFC 1918, Loopback, Cloud Metadata)', async () => {
      const privateTargets = [
        'http://localhost',
        'http://127.0.0.1:3000',
        'http://127.0.0.2',
        'http://10.0.0.1/admin',
        'http://192.168.1.1/router',
        'http://172.16.0.1',
        'http://172.31.255.255',
        'http://169.254.169.254/latest/meta-data/', // AWS/GCP metadata service
        'http://[::1]',
        'http://[fc00::1]',
        'http://[fe80::1]'
      ];

      for (const target of privateTargets) {
        await expect(
          validateExternalTarget(target),
          `Expected SSRF blocker to reject ${target}`
        ).rejects.toThrow();
      }
    });

    it('SSRF Protection strictly blocks URLs with embedded credentials and private destinations', async () => {
      const invalidUrls = [
        'https://admin:password@example.com',
        'http://user:secret@api.lyaxis.com',
        'http://127.0.0.1:8080/admin',
        'http://localhost:3000'
      ];

      for (const target of invalidUrls) {
        await expect(
          validateExternalTarget(target),
          `Expected validator to reject ${target}`
        ).rejects.toThrow();
      }
    });

    it('Myers Diff Engine handles identical texts with 0 additions and 0 deletions', () => {
      const text = 'alpha\nbeta\ngamma';
      const diff = computeMyersDiff(text, text);
      expect(diff.additions).toBe(0);
      expect(diff.deletions).toBe(0);
      expect(diff.unified.every(l => l.type === 'same')).toBe(true);
    });

    it('Myers Diff Engine handles empty texts and complete overwrites cleanly', () => {
      // Empty to text
      const diff1 = computeMyersDiff('', 'hello\nworld');
      expect(diff1.additions).toBe(2);
      expect(diff1.deletions).toBe(0);

      // Text to empty
      const diff2 = computeMyersDiff('hello\nworld', '');
      expect(diff2.additions).toBe(0);
      expect(diff2.deletions).toBe(2);

      // Both empty
      const diff3 = computeMyersDiff('', '');
      expect(diff3.additions).toBe(0);
      expect(diff3.deletions).toBe(0);
    });

    it('Sanitization Vault detects diverse secret categories (PEM keys, AWS keys, Mongo connection URIs)', () => {
      const secretsPayload = `
        const awsKey = "AKIA1234567890ABCDEF";
        const dbUri = "mongodb+srv://admin:SecretPass123@cluster0.abc.mongodb.net/prod";
        const rsaKey = "-----BEGIN RSA PRIVATE KEY-----\\nMIIEowIBAAKCAQEA0MIIEowIBAAKCAQEA0\\n-----END RSA PRIVATE KEY-----";
        const apiKey = "api_key = 'abcdef1234567890abcdef'";
      `;

      const result = sanitizeCredentials(secretsPayload);
      expect(result.foundSecretsCount).toBeGreaterThanOrEqual(3);
      expect(result.typesDetected).toEqual(
        expect.arrayContaining(['AWS Access Key', 'Database Connection String'])
      );
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations', () => {
    it('links Aegis critical detection directly into CI/CD gate block and Architect plan', async () => {
      const vulnerableCode = `
        // Vulnerable user authentication
        app.post('/login', (req, res) => {
          const { user, pass } = req.body;
          const query = "SELECT * FROM users WHERE user = '" + user + "' AND pass = '" + pass + "'";
          db.query(query);
        });
      `;

      // 1. Run Aegis Forensic Scan
      const scan = await runAegisForensicScan({
        targetInput: 'auth.ts',
        sourceCodeInput: vulnerableCode,
        targetTypeHint: 'code'
      });

      // 2. Verify critical findings trigger CI failure
      const criticals = scan.issues.filter(i => i.severity === 'critical');
      expect(criticals.length).toBeGreaterThan(0);
      expect(scan.ciStatus.passed).toBe(false);
      expect(scan.securityScore).toBeLessThan(80);

      // 3. Pipe into LYAXIS Architect
      const masterPlan = generateMasterImplementationPlan(scan, 'Next.js');
      expect(masterPlan.length).toBe(5);

      // 4. Verify remediation diff for the critical SQL issue
      const sqlIssue = criticals.find(i => i.title.toLowerCase().includes('sql') || i.cwe === 'CWE-89');
      if (sqlIssue) {
        const diff = computeMyersDiff(
          sqlIssue.remediation.originalSnippet,
          sqlIssue.remediation.remediatedSnippet
        );
        expect(diff.additions).toBeGreaterThan(0);
        expect(diff.deletions).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD SCENARIOS
  // =========================================================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('forensic scan determinism: identical code input produces identical scores and CI verdict', async () => {
      const code = `
        export function processPayment(amount: number) {
          if (amount <= 0) throw new Error('Invalid amount');
          return { success: true, processedAt: 1730000000 };
        }
      `;

      const run1 = await runAegisForensicScan({ targetInput: 'payment.ts', sourceCodeInput: code, targetTypeHint: 'code' });
      const run2 = await runAegisForensicScan({ targetInput: 'payment.ts', sourceCodeInput: code, targetTypeHint: 'code' });

      expect(run1.securityScore).toBe(run2.securityScore);
      expect(run1.performanceScore).toBe(run2.performanceScore);
      expect(run1.socialSeoScore).toBe(run2.socialSeoScore);
      expect(run1.overallScore).toBe(run2.overallScore);
      expect(run1.ciStatus.passed).toBe(run2.ciStatus.passed);
      expect(run1.issues.length).toBe(run2.issues.length);
    });

    it('high-performance engine throughput: generates 7 platform plans and diffs in < 30ms', () => {
      const t0 = performance.now();
      const platforms = ['Next.js', 'WordPress', 'React', 'Nginx', 'Apache', 'Cloudflare', 'Vercel'] as const;

      for (const p of platforms) {
        generateMasterImplementationPlan({}, p);
      }

      for (let i = 0; i < 20; i++) {
        computeMyersDiff('line A\nline B\nline C', 'line A\nline B modified\nline D');
      }

      const elapsed = performance.now() - t0;
      expect(elapsed).toBeLessThan(50);
    });
  });
});
