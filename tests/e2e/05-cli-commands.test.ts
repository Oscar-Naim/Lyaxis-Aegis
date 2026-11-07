import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import esbuild from 'esbuild';

describe('05 · CLI Commands Test Suite', () => {
  const cliEntry = path.resolve(process.cwd(), 'cli/main.ts');
  let compiledCliBundle: string;
  let bundleTempDir: string;
  let tempDir: string;

  beforeAll(() => {
    bundleTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lyaxis-cli-bundle-'));
    compiledCliBundle = path.join(bundleTempDir, 'lyaxis-cli.cjs');
    esbuild.buildSync({
      entryPoints: [cliEntry],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      outfile: compiledCliBundle,
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
  });

  afterAll(() => {
    if (bundleTempDir && fs.existsSync(bundleTempDir)) {
      fs.rmSync(bundleTempDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lyaxis-cli-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function runCli(args: string[], options: { cwd?: string } = {}) {
    return spawnSync(process.execPath, [compiledCliBundle, ...args], {
      cwd: options.cwd || process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });
  }

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (HAPPY PATHS & STANDARD SUBCOMMANDS)
  // =========================================================================
  describe('Tier 1: Feature Coverage', () => {

    it('lyaxis-harness status prints ASCII banner and project diagnostics (exit code 0)', () => {
      const result = runCli(['status', tempDir]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('ESTADO DEL HARNESS SOBERANO');
      expect(result.stdout).toContain('Proyecto:');
      expect(result.stdout).toContain('Arnés Instalado:');
      expect(result.stdout).toContain('Constitución Soberana:');
      expect(result.stdout).toContain('Memoria de Sesión:');
      expect(result.stdout).toContain('Herramientas de Mando:');
    });

    it('lyaxis-harness catalog --agents displays all 34 agents with roles and tools (exit code 0)', () => {
      const result = runCli(['catalog', '--agents']);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('CATÁLOGO DE AGENTES ESPECIALIZADOS (Total: 34)');
      expect(result.stdout).toContain('[1]');
      expect(result.stdout).toContain('Escuadrón:');
      expect(result.stdout).toContain('Rol:');
      expect(result.stdout).toContain('Tier:');
      expect(result.stdout).toContain('Tools:');
    });

    it('lyaxis-harness catalog --skills displays certified technical skills inventory (exit code 0)', () => {
      const result = runCli(['catalog', '--skills']);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('CATÁLOGO DE SKILLS CERTIFICADAS (Total: 274)');
      expect(result.stdout).toContain('Tags:');
      expect(result.stdout).toContain('Uso:');
    });

    it('lyaxis-harness inject <dir> injects full sovereign harness with success message (exit code 0)', () => {
      const result = runCli(['inject', tempDir]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('[LYAXIS INJECT]');
      expect(result.stdout).toContain('INYECCIÓN EXITOSA');
      expect(result.stdout).toContain('02-DOCS/01-CONSTITUTION.md');
      expect(result.stdout).toContain('02-DOCS/02-SESSION-MEMORY.md');
      expect(result.stdout).toContain('Gobernanza Activa');

      expect(fs.existsSync(path.join(tempDir, '02-DOCS', '01-CONSTITUTION.md'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '01-TOOLS', 'lyaxis-verify.cjs'))).toBe(true);
    });

    it('lyaxis-harness onboard <dir> prepares repository with sovereign governance (exit code 0)', () => {
      const result = runCli(['onboard', tempDir]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('[LYAXIS INJECT]');
      expect(result.stdout).toContain('INYECCIÓN EXITOSA');
      expect(result.stdout).toContain('Total de Agentes asignados:');
      expect(result.stdout).toContain('34 Agentes');
    });

    it('lyaxis-harness doctor <dir> runs health check and outputs diagnostic score (exit code 0)', () => {
      // First inject to make it healthy
      runCli(['inject', tempDir]);

      const result = runCli(['doctor', tempDir]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('[LYAXIS DOCTOR]');
      expect(result.stdout).toContain('Puntuación de Salud:');
      expect(result.stdout).toContain('Estado General:');
      expect(result.stdout).toContain('RECOMENDACIONES:');
    });

    it('lyaxis-harness audit <dir> executes Aegis forensic engine scan on local code (exit code 0/1)', () => {
      // Write sample benign file in tempDir
      fs.writeFileSync(path.join(tempDir, 'index.js'), 'console.log("Safe application");', 'utf8');

      const result = runCli(['audit', tempDir]);

      expect([0, 1]).toContain(result.status);
      expect(result.stdout).toContain('[AEGIS FORENSIC ENGINE]');
      expect(result.stdout).toContain('Puntuación General:');
      expect(result.stdout).toContain('Inmunidad de Seguridad:');
      expect(result.stdout).toContain('Rendimiento Extremo:');
      expect(result.stdout).toContain('Compuerta CI/CD:');
    });

    it('lyaxis-harness help outputs usage documentation and available flags (exit code 0)', () => {
      const result = runCli(['help']);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('USO:');
      expect(result.stdout).toContain('lyaxis-harness.exe status');
      expect(result.stdout).toContain('lyaxis-harness.exe catalog');
      expect(result.stdout).toContain('lyaxis-harness.exe inject');
      expect(result.stdout).toContain('lyaxis-harness.exe doctor');
      expect(result.stdout).toContain('lyaxis-harness.exe audit');
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (UNKNOWN COMMANDS, PRESET FLAGS, ERRORS)
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {

    it('rejects unknown command with error message and non-zero exit code (exit code 1)', () => {
      const result = runCli(['unrecognized-subcommand-xyz']);

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('Comando no reconocido: "unrecognized-subcommand-xyz"');
    });

    it('supports --squad filter flag on catalog subcommand', () => {
      const result = runCli(['catalog', '--agents', '--squad', 'security']);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Escuadrón Seguridad');
      expect(result.stdout).not.toContain('Escuadrón Frontend Ultra Moderno');
    });

    it('supports --preset flags on inject (secops, frontend, backend)', () => {
      const presets = ['secops', 'frontend', 'backend'] as const;

      for (const p of presets) {
        const sub = path.join(tempDir, `preset-${p}`);
        const result = runCli(['inject', sub, '--preset', p]);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(p.toUpperCase());
        expect(result.stdout).toContain('Preset seleccionado:');
        expect(fs.existsSync(path.join(sub, 'lyaxis.config.json'))).toBe(true);
      }
    });

    it('audit on critical vulnerability reports blocked CI gate and exits with code 1', () => {
      // Create code with critical SQL injection
      const srcDir = path.join(tempDir, 'src', 'api', 'checkout');
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'process.ts'), `
        app.post('/pay', (req, res) => {
          const id = req.body.id;
          db.query("SELECT * FROM cards WHERE id = " + id);
        });
      `, 'utf8');

      const result = runCli(['audit', tempDir]);

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('BLOQUEADA');
      expect(result.stdout).toContain('HALLAZGOS FORENSES DETECTADOS');
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (ONBOARD -> DOCTOR -> AUDIT FLOW)
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations', () => {
    it('executes full CLI lifecycle: onboard -> doctor check -> status inspect', () => {
      // Step 1: Onboard
      const onboardRes = runCli(['onboard', tempDir]);
      expect(onboardRes.status).toBe(0);

      // Step 2: Doctor confirms health
      const doctorRes = runCli(['doctor', tempDir]);
      expect(doctorRes.status).toBe(0);
      expect(doctorRes.stdout).toContain('HEALTHY');

      // Step 3: Status reflects active arnés
      const statusRes = runCli(['status', tempDir]);
      expect(statusRes.status).toBe(0);
      expect(statusRes.stdout).toContain('ACTIVO');
      expect(statusRes.stdout).toContain('02-DOCS/01-CONSTITUTION.md OK');
      expect(statusRes.stdout).toContain('02-DOCS/02-SESSION-MEMORY.md OK');
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD SCENARIOS
  // =========================================================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('headless execution performance: status command completes in < 2.5 seconds cold', () => {
      const t0 = performance.now();
      const result = runCli(['status', tempDir]);
      const elapsed = performance.now() - t0;

      expect(result.status).toBe(0);
      expect(elapsed).toBeLessThan(2500);
    });
  });
});
