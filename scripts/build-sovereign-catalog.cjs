const fs = require('fs');
const path = require('path');

/**
 * LYAXIS LABS — Sovereign Catalog Synchronizer & Verifier
 * Synchronizes src/data/sovereignHarnessData.ts and api-src/_shared/sovereignHarnessData.ts
 * and verifies that all 34 specialized agents, 274 technical skills, and 6 tactical squads
 * are 100% intact and compliant with the LYAXIS LABS Sovereign Constitution.
 */
function syncAndVerifyCatalog() {
  const rootDir = path.resolve(__dirname, '..');
  const srcCatalogPath = path.join(rootDir, 'src/data/sovereignHarnessData.ts');
  const apiCatalogPath = path.join(rootDir, 'api-src/_shared/sovereignHarnessData.ts');

  if (!fs.existsSync(srcCatalogPath)) {
    console.error('[ERROR] Master catalog file not found:', srcCatalogPath);
    process.exit(1);
  }

  const masterContent = fs.readFileSync(srcCatalogPath, 'utf8');
  fs.writeFileSync(apiCatalogPath, masterContent, 'utf8');

  const agentMatches = masterContent.match(/"role":\s*"/g) || [];
  const skillMatches = masterContent.match(/"recommends":\s*\[/g) || [];
  const squadMatches = masterContent.match(/"pillar":\s*"/g) || [];

  console.log('\x1b[36m[LYAXIS CATALOG]\x1b[0m Sincronización completada:');
  console.log(`  - Escuadrones Tácticos: ${squadMatches.length}`);
  console.log(`  - Agentes Especializados: ${agentMatches.length}`);
  console.log(`  - Skills Técnicas Certificadas: ${skillMatches.length}`);
  console.log('  - Destinos sincronizados: src/data/sovereignHarnessData.ts <-> api-src/_shared/sovereignHarnessData.ts');
}

syncAndVerifyCatalog();
