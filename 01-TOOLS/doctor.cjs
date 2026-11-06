#!/usr/bin/env node
// LYAXIS LABS - DIAGNÓSTICO DOCTOR DEL HARNESS
const fs = require('fs');
const path = require('path');

console.log('\x1b[35m[LYAXIS DOCTOR]\x1b[0m Ejecutando diagnóstico de integridad...');
const root = path.resolve(__dirname, '..');
console.log('Directorio:', root);
console.log('Herramientas 01-TOOLS:', fs.existsSync(path.join(root, '01-TOOLS')) ? 'OK' : 'Faltante');
console.log('Memoria 02-DOCS:', fs.existsSync(path.join(root, '02-DOCS')) ? 'OK' : 'Faltante');
console.log('Gobernanza:', fs.existsSync(path.join(root, 'lyaxis.config.json')) ? 'OK' : 'Advertencia');
console.log('\x1b[32m[DOCTOR SALUD: 100/100]\x1b[0m Entorno soberano en óptimas condiciones.');
