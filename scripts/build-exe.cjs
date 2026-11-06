const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const esbuild = require('esbuild');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.ico': return 'image/x-icon';
    case '.woff2': return 'font/woff2';
    case '.woff': return 'font/woff';
    default: return 'application/octet-stream';
  }
}

async function build() {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');

  console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════');
  console.log('\x1b[36m%s\x1b[0m', '  LYAXIS HARNESS · COMPILADOR DE EJECUTABLE AUTÓNOMO (.EXE)');
  console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════\n');

  // 1. Build Vite UI
  console.log('[1/7] Compilando frontend Obsidian Specular Glass con Vite...');
  cp.execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

  // 2. Read dist files into embedded asset map
  console.log('\n[2/7] Embebiendo assets estáticos en memoria...');
  const assets = {};
  function walkDir(currentDir, baseDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, baseDir);
      } else if (entry.isFile()) {
        const relPath = '/' + path.relative(baseDir, fullPath).replace(/\\/g, '/');
        // Do not embed previous exe or blob
        if (relPath.endsWith('.exe') || relPath.endsWith('.blob') || relPath.endsWith('.cjs')) continue;
        const buf = fs.readFileSync(fullPath);
        assets[relPath] = {
          content: buf.toString('base64'),
          mime: getMimeType(fullPath)
        };
      }
    }
  }
  walkDir(distDir, distDir);
  console.log(`      Embebidos ${Object.keys(assets).length} archivos estáticos.`);

  // 3. Bundle CLI + Server + Embedded Assets with esbuild
  console.log('\n[3/7] Empaquetando motor CLI y servidor con esbuild...');
  const bundlePath = path.join(distDir, 'bundle.cjs');

  await esbuild.build({
    entryPoints: [path.join(rootDir, 'cli/main.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: bundlePath,
    define: {
      '__EMBEDDED_ASSETS__': JSON.stringify(assets),
      'process.env.NODE_ENV': '"production"'
    },
    external: [],
    banner: {
      js: '/* LYAXIS HARNESS STANDALONE DESKTOP CORE */\n'
    }
  });

  const bundleSizeMb = (fs.statSync(bundlePath).size / (1024 * 1024)).toFixed(2);
  console.log(`      Bundle generado: dist/bundle.cjs (${bundleSizeMb} MB)`);

  // 4. Generate SEA Blob
  console.log('\n[4/7] Generando Node SEA Blob...');
  const seaConfigPath = path.join(distDir, 'sea-config.json');
  const blobPath = path.join(distDir, 'sea-prep.blob');
  fs.writeFileSync(seaConfigPath, JSON.stringify({
    main: bundlePath,
    output: blobPath,
    disableExperimentalSEAWarning: true
  }, null, 2));

  cp.execSync(`node --experimental-sea-config "${seaConfigPath}"`, { cwd: rootDir, stdio: 'inherit' });

  // 5. Copy node.exe to target exe
  console.log('\n[5/7] Preparando binario de Windows...');
  const targetExe = path.join(distDir, 'lyaxis-harness.exe');
  fs.copyFileSync(process.execPath, targetExe);

  // 6. Remove Authenticode signature
  console.log('\n[6/7] Removiendo firma digital PE...');
  const removeSigPy = path.join(rootDir, 'scripts/remove-sig.py');
  cp.execSync(`python "${removeSigPy}" "${targetExe}"`, { cwd: rootDir, stdio: 'inherit' });

  // 7. Inject blob with postject
  console.log('\n[7/7] Inyectando blob SEA con postject...');
  cp.execSync(
    `npx --yes postject "${targetExe}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
    { cwd: rootDir, stdio: 'inherit', shell: true }
  );

  // Copy to root as well
  const rootExe = path.join(rootDir, 'lyaxis-harness.exe');
  fs.copyFileSync(targetExe, rootExe);

  const exeSizeMb = (fs.statSync(rootExe).size / (1024 * 1024)).toFixed(2);
  console.log('\n\x1b[32m%s\x1b[0m', '════════════════════════════════════════════════════════════════');
  console.log('\x1b[32m%s\x1b[0m', `  ✓ COMPILACIÓN EXITOSA: lyaxis-harness.exe (${exeSizeMb} MB)`);
  console.log('\x1b[32m%s\x1b[0m', '  Ubicaciones: ./lyaxis-harness.exe y ./dist/lyaxis-harness.exe');
  console.log('\x1b[32m%s\x1b[0m', '════════════════════════════════════════════════════════════════\n');
}

build().catch((err) => {
  console.error('\x1b[31m[ERROR EN COMPILACIÓN]\x1b[0m', err);
  process.exit(1);
});
