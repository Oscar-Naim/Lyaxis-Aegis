# LYAXIS HARNESS · CASA CENTRAL DE AGENTES
> **Plataforma Soberana de Gobernanza, Simulación y Ejecución Forense de Agentes Autónomos**  
> *LYAXIS LABS · Versión 4.2.0-SOVEREIGN · 100% Propietaria y Libre de Dependencias Externas*

![Obsidian Specular Glass](https://img.shields.io/badge/Theme-Obsidian_Specular_Glass-06b6d4?style=for-the-badge)
![Sovereign Architecture](https://img.shields.io/badge/Architecture-100%25_Sovereign-10b981?style=for-the-badge)
![Active Agents](https://img.shields.io/badge/Specialized_Agents-34-8b5cf6?style=for-the-badge)
![Certified Skills](https://img.shields.io/badge/Certified_Skills-274-f59e0b?style=for-the-badge)
![Desktop Standalone](https://img.shields.io/badge/Executable-Windows_.EXE-ec4899?style=for-the-badge)

---

## 🏛️ 1. IDENTIDAD Y FILOSOFÍA SOBERANA

**LYAXIS HARNESS** es la Casa Central oficial de agentes autónomos diseñada para elevar el desarrollo de software a estándares de élite. Fundada bajo la filosofía del **Harness Soberano**, el sistema gobierna la memoria persistente del repositorio (`02-DOCS/`), la orquestación de herramientas locales (`01-TOOLS/`) y la ejecución de compuertas de calidad innegociables.

### Los Dos Pilares Supremos de Mando

```
                                  ┌───────────────────────────────────────────────┐
                                  │      CONSEJO DE ARQUITECTURA LYAXIS LABS      │
                                  └──────────────────────┬────────────────────────┘
                                                         │
                        ┌────────────────────────────────┴────────────────────────────────┐
                        ▼                                                                 ▼
      ┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
      │         LYAXIS ARCHITECT          │                             │           AEGIS ENGINE            │
      │   Planificador Maestro de Sistemas │                             │  Motor Forense de Ejecución SAST  │
      │   Estrategia, Contratos y Memoria │                             │  Autocuración y Refutación Real   │
      └─────────────────┬─────────────────┘                             └─────────────────┬─────────────────┘
                        │                                                                 │
    ┌───────────────────┼───────────────────┐                         ┌───────────────────┼───────────────────┐
    ▼                   ▼                   ▼                         ▼                   ▼                   ▼
[Escuadrón Frontend] [Escuadrón Backend] [Escuadrón AI]         [Escuadrón Seguridad] [Escuadrón Vitals] [Escuadrón TDD]
```

1. **LYAXIS Architect**:
   - Planificador maestro de sistemas y arquitecto de software empresarial.
   - Deconstruye directivas complejas en especificaciones arquitectónicas desacopladas con contratos estrictos.
   - Preserva la memoria continua del proyecto en `02-DOCS/02-SESSION-MEMORY.md` y vigila la `02-DOCS/01-CONSTITUTION.md`.

2. **Aegis Engine**:
   - Motor forense de ejecución implacable y escaneo profundo en tiempo real.
   - Detección proactiva de vulnerabilidades (CWE-89 SQLi, CWE-79 XSS, CWE-345 JWT Bypass, Secrets Leaks).
   - Simulación adversarial y compuertas de autocuración de código con diffs descargables.

---

## 🛡️ 2. CATÁLOGO DE 34 AGENTES Y 274 SKILLS POR ESCUADRÓN

Los 34 agentes especializados y 274 skills están organizados en **6 Escuadrones Tácticos**:

| Escuadrón | Color | Pilar Rector | Misión Táctica | Agentes Clave |
|---|---|---|---|---|
| **Seguridad Ofensiva & Defensiva** | `#06b6d4` Cian | Aegis Engine | Detección SAST/DAST, refutación adversarial de afirmaciones de seguridad y mitigación OWASP. | `finding-verifier`, `refuter-security`, `refuter-correctness` |
| **Rendimiento Extremo & Web Vitals** | `#10b981` Esmeralda | Aegis Engine | Optimización Core Web Vitals (LCP < 800ms, CLS 0, INP bajo), compresión y edge caching. | `web-vitals-optimizer`, `bundle-minimizer`, `edge-cache-orchestrator` |
| **Frontend Ultra Moderno** | `#38bdf8` Cielo | LYAXIS Architect | Interfaces Obsidian Specular Glass, React 19, microfrontends y accesibilidad WCAG AA. | `react-reviewer`, `react-build-resolver`, `vue-reviewer`, `typescript-reviewer` |
| **Backend Soberano & APIs** | `#8b5cf6` Violeta | LYAXIS Architect | Concurrencia de alto rendimiento en Go, Rust, Python y Node; integridad transaccional ACID. | `go-reviewer`, `rust-reviewer`, `fastapi-reviewer`, `postgres-reviewer`, `cpp-reviewer` |
| **TDD, QA & Resiliencia Forense** | `#f59e0b` Ámbar | Aegis Engine | Ciclo estricto Red->Green->Refactor, pruebas de mutación y compuertas ASDD. | `developer`, `refuter-tests`, `spec-miner` |
| **Datos, AI Soberana & Neural Ops** | `#ec4899` Rosa | LYAXIS Architect | Gobernanza neural soberana, pipelines RAG contextuales y defensa anti-jailbreak. | `mle-reviewer`, `pytorch-build-resolver`, `rag-reviewer` |

---

## ⚡ 3. APLICACIÓN DE ESCRITORIO AUTÓNOMA (`lyaxis-harness.exe`)

El proyecto incluye un binario ejecutable único para Windows (`lyaxis-harness.exe`) con **cero dependencias externas** (no requiere tener Node.js ni Python preinstalados en la máquina final).

### Doble Modo de Operación

#### A) Modo Interfaz Visual (Doble clic o sin argumentos)
Al ejecutar `lyaxis-harness.exe`, se inicia un servidor HTTP embebido de alto rendimiento en el puerto local (por defecto `http://localhost:3800`) y se abre automáticamente el navegador en la interfaz **Obsidian Specular Glass**.

#### B) Modo Consola CLI (Con argumentos)
Permite gobernar e inyectar el arnés directamente desde cualquier terminal de comandos:

```bash
# Ayuda y lista de comandos
lyaxis-harness.exe help

# Estado del repositorio actual y verificación de gobernanza
lyaxis-harness.exe status [ruta]

# Diagnóstico de salud de herramientas, git y memoria
lyaxis-harness.exe doctor [ruta]

# Catálogo interactivo de agentes especializados
lyaxis-harness.exe catalog --agents

# Catálogo de las 274 skills certificadas
lyaxis-harness.exe catalog --skills

# Inyección con 1 comando del arnés soberano completo
lyaxis-harness.exe inject <ruta> --preset full

# Escaneo forense local con Aegis Engine
lyaxis-harness.exe audit [ruta]
```

---

## 🎨 4. INTERFAZ OBSIDIAN SPECULAR GLASS

- **Paleta Obsidian:** Fondo negro profundo `#05070B`, tarjetas translúcidas con desenfoque (`backdrop-blur-xl`), bordes specular con resplandor neón (`#06b6d4` cian, `#10b981` esmeralda, `#8b5cf6` violeta).
- **HUD Radial:** 4 velocímetros en tiempo real para Inmunidad Forense, Rendimiento Web Vitals, Gobernanza de Memoria y Disponibilidad del Enjambre.
- **Radar Táctico:** Visualización de los 6 escuadrones en sincronía.
- **Explorador Interactivo:** Filtros en vivo por escuadrón, búsqueda instantánea por palabras clave y modales con directivas constitucionales.
- **Live Terminal / Simulador:** Consola en tiempo real que ejecuta el pipeline coordinado multi-agente: *Architect ➔ Aegis ➔ Specialist ➔ Refuter ➔ ASDD Gate*.
- **Inyector 1-Clic:** Despliegue interactivo de `02-DOCS/` y `01-TOOLS/` hacia cualquier proyecto.

---

## 🛠️ 5. DESARROLLO Y COMPILACIÓN

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Ejecutar suite de pruebas verificables
npm test

# Compilar frontend
npm run build

# Compilar el ejecutable autónomo Windows (.EXE)
npm run build:exe
```

---
*LYAXIS LABS © 2026 · Arquitectura Soberana de Agentes Autónomos.*
#   L y a x i s A e g i s  
 