# Proyecto: LYAXIS HARNESS / CASA DE AGENTES SOBERANOS

## Arquitectura General
**LYAXIS HARNESS** es la Casa Central oficial de agentes autónomos y suite de gobernanza soberana de **LYAXIS LABS**.
- **Motores Pilares:**
  - **LYAXIS Architect**: Planificador maestro de sistemas, diseño de soluciones desacopladas y gobernanza de memoria.
  - **Aegis Engine**: Motor forense de ejecución implacable, escaneo SAST/DAST y autocuración con diffs en tiempo real.
- **Catálogo Soberano:**
  - 34 Agentes Especializados con roles y herramientas de ejecución estrictas.
  - 274 Skills Certificadas organizadas en 6 Escuadrones Tácticos.
  - Memoria de Sesión continua en `02-DOCS/` (`01-CONSTITUTION.md`, `02-SESSION-MEMORY.md`, `03-AGENTS-LEDGER.md`).
  - Herramientas y compuertas de gobernanza en `01-TOOLS/` (`lyaxis-verify.cjs`, `doctor.cjs`, `asdd-gate.cjs`).
- **Aplicación de Escritorio Autónoma:**
  - `lyaxis-harness.exe` (Windows x64): Compilado como Single Executable Application (SEA) con Node 24 runtime embebido y assets web en memoria.
  - Doble modo: Servidor local embebido + auto-lanzamiento de navegador Obsidian Glass en ejecución sin argumentos; CLI interactiva con argumentos.
- **Stack Tecnológico:**
  - Frontend: React 19, TypeScript 5.6.3, Vite 6, Tailwind CSS 4, Lucide React.
  - Backend Embebido: Node.js 24 SEA, Express 4.21.2, esbuild 0.28.2.
  - Testing: Vitest 3.2.7.

## Inventario de Componentes y Vistas
| Vista / Módulo | Componente | Descripción |
|---|---|---|
| **Casa Central HUD** | `HarnessHUD.tsx` | Velocímetros radiales, radar de los 6 escuadrones y disparadores de simulación. |
| **Catálogo Interactivo** | `CatalogExplorer.tsx` | Filtros dinámicos de los 34 agentes y 274 skills con directivas constitucionales. |
| **Simulador de Enjambre** | `AgentSwarmSimulator.tsx` | Consola interactiva para ver el flujo coordinado entre Architect, Aegis y escuadrones. |
| **Inyector de Harness** | `HarnessInjectorModal.tsx` | Módulo para inyectar `02-DOCS/` y `01-TOOLS/` en cualquier proyecto con 1 clic. |
| **Escáner Forense** | `ScannerView.tsx` | Análisis SAST/DAST en tiempo real de repositorios, código pegado o URLs. |
| **Diagnóstico del Sistema** | `AnalyticsDashboard.tsx` | Desglose pormenorizado de métricas y vectores de seguridad. |
| **Parches & Diffs** | `RemediationViewer.tsx` | Visualizador Myers-diff y aplicación de remediaciones verificables. |
| **Plan Maestro** | `ImplementationPlan.tsx` | Hoja de ruta arquitectónica guiada por LYAXIS Architect. |
| **CI/CD Quality Gates** | `PipelineIntegration.tsx` | Simulación y exportación de workflows de integración continua. |
| **Copilot Chatbot** | `ArchitectureChatbot.tsx` | Asistente conversacional especializado en arquitectura y mitigación. |

## Escuadrones Tácticos
1. **Seguridad Ofensiva & Defensiva** (Aegis Engine): `finding-verifier`, `refuter-security`, `refuter-correctness`.
2. **Rendimiento Extremo & Web Vitals** (Aegis Engine): `web-vitals-optimizer`, `bundle-minimizer`, `edge-cache-orchestrator`.
3. **Frontend Ultra Moderno** (LYAXIS Architect): `react-reviewer`, `react-build-resolver`, `vue-reviewer`, `typescript-reviewer`.
4. **Backend Soberano & APIs** (LYAXIS Architect): `go-reviewer`, `rust-reviewer`, `fastapi-reviewer`, `postgres-reviewer`, etc.
5. **TDD, QA & Resiliencia Forense** (Aegis Engine): `developer`, `refuter-tests`, `spec-miner`.
6. **Datos, AI Soberana & Neural Ops** (LYAXIS Architect): `mle-reviewer`, `pytorch-build-resolver`, `rag-reviewer`.
