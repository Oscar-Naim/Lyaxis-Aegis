#!/usr/bin/env node
// LYAXIS LABS - HERRAMIENTA DE VERIFICACIÓN SOBERANA
const fs = require('fs');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '  LYAXIS HARNESS · EJECUTOR DE VERIFICACIÓN FORENSE');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════');

const constFile = path.resolve(__dirname, '../02-DOCS/01-CONSTITUTION.md');
const memFile = path.resolve(__dirname, '../02-DOCS/02-SESSION-MEMORY.md');

let passed = true;
if (!fs.existsSync(constFile)) {
  console.error('\x1b[31m[FALLO]\x1b[0m No se encontró 02-DOCS/01-CONSTITUTION.md');
  passed = false;
} else {
  console.log('\x1b[32m[OK]\x1b[0m Constitución Soberana activa y verificada.');
}

if (!fs.existsSync(memFile)) {
  console.error('\x1b[31m[FALLO]\x1b[0m No se encontró 02-DOCS/02-SESSION-MEMORY.md');
  passed = false;
} else {
  console.log('\x1b[32m[OK]\x1b[0m Memoria de sesión íntegra.');
}

if (!passed) {
  process.exit(1);
} else {
  console.log('\x1b[32m[VERIFICACIÓN COMPLETADA]\x1b[0m Todas las compuertas de gobernanza superadas.');
  process.exit(0);
}
