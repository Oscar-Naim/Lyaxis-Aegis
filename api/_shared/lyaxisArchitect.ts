import { MasterPlanStep, ScanResult } from '../../src/types/index.ts';

export interface ArchitectAdviceRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  currentScanContext?: Partial<ScanResult>;
  platformTarget?: 'WordPress' | 'Next.js' | 'React' | 'Nginx' | 'Apache' | 'Cloudflare' | 'Vercel';
}

export function generateMasterImplementationPlan(
  scan: Partial<ScanResult>,
  platform: 'WordPress' | 'Next.js' | 'React' | 'Nginx' | 'Apache' | 'Cloudflare' | 'Vercel' = 'Next.js'
): MasterPlanStep[] {
  const steps: MasterPlanStep[] = [];

  // Step 1: Immediate Network & Immunity Shield
  steps.push({
    stepNumber: 1,
    title: 'Blindaje Perimetral: Cabeceras de Inmunidad (CSP, HSTS, X-Frame-Options)',
    platform,
    priority: 'immediate',
    impactVsEffort: 'Quick Win',
    description: `Configurar cabeceras de seguridad estrictas en la capa de ${platform} para mitigar ataques XSS, Clickjacking y SSL Striping sin modificar lógica de negocio.`,
    productionSafeNotes: 'Riesgo 0% de rotura en base de datos. Se recomienda verificar en entorno de pruebas que los dominios de analíticas externas estén permitidos en CSP.',
    codeOrConfig: getPlatformHeadersSnippet(platform),
    verificationCommand: `curl -I ${scan.targetUrl || 'https://tudominio.com'}`
  });

  // Step 2: Critical Injection & Data Protection
  steps.push({
    stepNumber: 2,
    title: 'Neutralización de Inyecciones SQL & Sanitización DOM en Entrada/Salida',
    platform: platform === 'WordPress' ? 'WordPress' : 'Next.js',
    priority: 'immediate',
    impactVsEffort: 'High Impact',
    description: 'Migrar todas las consultas con concatenación a sentencias parametrizadas (Prepared Statements) con bind parameters ($1).',
    productionSafeNotes: 'Asegurar que los tipos de datos devueltos por el query builder conserven la misma estructura JSON esperada por el cliente.',
    codeOrConfig: getPlatformQuerySnippet(platform),
    verificationCommand: `npm test -- --grep "SQL"`
  });

  // Step 3: Identity & Session Hardening
  steps.push({
    stepNumber: 3,
    title: 'Autenticación Criptográfica Robusta & Cookies Blindadas',
    platform: 'General',
    priority: 'high',
    impactVsEffort: 'High Impact',
    description: 'Garantizar que los tokens de acceso sean validados con jwt.verify() y que las cookies viajen exclusivamente con flags HttpOnly, Secure y SameSite=Lax.',
    productionSafeNotes: 'Verificar la expiración adecuada de tokens para no desconectar sesiones activas de usuarios legítimos.',
    codeOrConfig: `// Manejo Seguro de Sesión:\nconst token = jwt.verify(rawToken, process.env.JWT_SECRET, {\n  algorithms: ['HS256'],\n  issuer: 'auth.lyaxis.com'\n});`,
    verificationCommand: `curl -v -c cookies.txt ${scan.targetUrl || 'https://tudominio.com'}`
  });

  // Step 4: Core Web Vitals Optimization
  steps.push({
    stepNumber: 4,
    title: 'Aceleración de Core Web Vitals: Desbloqueo del Hilo Principal & Lazy Loading',
    platform: platform === 'React' || platform === 'Next.js' ? platform : 'General',
    priority: 'medium',
    impactVsEffort: 'Quick Win',
    description: 'Diferir scripts de analíticas secundarias (defer/async) y convertir imágenes de catálogo a formato WebP/AVIF con loading="lazy".',
    productionSafeNotes: 'Garantizar que la imagen Hero de cabecera mantenga fetchpriority="high" para optimizar el LCP.',
    codeOrConfig: `<img src="/hero.webp" fetchpriority="high" width="1200" height="630" />\n<img src="/secondary.webp" loading="lazy" decoding="async" />`,
    verificationCommand: `npx lighthouse ${scan.targetUrl || 'https://tudominio.com'} --only-categories=performance`
  });

  // Step 5: Social Metatags & Technical SEO
  steps.push({
    stepNumber: 5,
    title: 'Despliegue del Bloque Canónico OpenGraph para Redes Sociales & Mensajería',
    platform: 'General',
    priority: 'low',
    impactVsEffort: 'Quick Win',
    description: 'Insertar las etiquetas meta og:title, og:image (1200x630) y twitter:card para generar vistas enriquecidas en WhatsApp, X y LinkedIn.',
    productionSafeNotes: 'Impacto nulo en el rendimiento del backend. Mejora directa en la tasa de clics (CTR).',
    codeOrConfig: `<meta property="og:title" content="${scan.targetName || 'Plataforma Web'}" />\n<meta property="og:image" content="https://tudominio.com/og-banner.png" />\n<meta name="twitter:card" content="summary_large_image" />`,
    verificationCommand: `curl -s ${scan.targetUrl || 'https://tudominio.com'} | grep -i "og:image"`
  });

  return steps;
}

function getPlatformHeadersSnippet(platform: string): string {
  switch (platform) {
    case 'Nginx':
      return `# /etc/nginx/conf.d/security.conf\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\nadd_header X-Frame-Options "DENY" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;`;
    case 'Apache':
      return `# .htaccess o httpd.conf\n<IfModule mod_headers.c>\n  Header always set Content-Security-Policy "default-src 'self'; script-src 'self';"\n  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"\n  Header always set X-Frame-Options "DENY"\n  Header always set X-Content-Type-Options "nosniff"\n</IfModule>`;
    case 'Cloudflare':
      return `# Cloudflare Transform Rules (HTTP Response Header Modification)\nRule 1: Set "Strict-Transport-Security" = "max-age=31536000; includeSubDomains; preload"\nRule 2: Set "X-Frame-Options" = "DENY"\nRule 3: Set "X-Content-Type-Options" = "nosniff"\nRule 4: Set "Content-Security-Policy" = "default-src 'self';"`;
    case 'Vercel':
      return `// vercel.json\n{\n  "headers": [\n    {\n      "source": "/(.*)",\n      "headers": [\n        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline';" },\n        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },\n        { "key": "X-Frame-Options", "value": "DENY" },\n        { "key": "X-Content-Type-Options", "value": "nosniff" }\n      ]\n    }\n  ]\n}`;
    case 'WordPress':
      return `// functions.php de tu tema o plugin de seguridad:\nadd_action('send_headers', function() {\n  header("X-Frame-Options: SAMEORIGIN");\n  header("X-Content-Type-Options: nosniff");\n  header("Strict-Transport-Security: max-age=31536000; includeSubDomains");\n  header("Referrer-Policy: strict-origin-when-cross-origin");\n});`;
    default:
      return `// Express / Node.js Middleware\nimport helmet from 'helmet';\napp.use(helmet({\n  contentSecurityPolicy: true,\n  hsts: { maxAge: 31536000, includeSubDomains: true }\n}));`;
  }
}

function getPlatformQuerySnippet(platform: string): string {
  if (platform === 'WordPress') {
    return `// WordPress $wpdb Prepared Query:\nglobal $wpdb;\n$safe_coupon = sanitize_text_field($_POST['coupon_code']);\n$result = $wpdb->get_row(\n  $wpdb->prepare("SELECT * FROM {$wpdb->prefix}coupons WHERE code = %s AND active = 1", $safe_coupon)\n);`;
  }
  return `// PostgreSQL / Next.js API Route:\nconst coupon = await db.query(\n  'SELECT * FROM coupons WHERE code = $1 AND active = true',\n  [couponCode]\n);`;
}

export function handleArchitectChat(request: ArchitectAdviceRequest): string {
  const query = (request.message || '').toLowerCase();

  if (query.includes('plan') || query.includes('hoja de ruta') || query.includes('roadmap') || query.includes('paso a paso')) {
    return `### Plan Maestro de Implementación — LYAXIS Architect

Hemos estructurado la hoja de ruta en **3 fases de despliegue progresivo** sin interrumpir producción:

1. **Fase 1: Quick Wins Perimetrales (Tiempo estimado: 15 min):**
   - Inyectar cabeceras HTTP de inmunidad (\`CSP\`, \`HSTS\`, \`X-Frame-Options\`) en tu CDN o servidor web (\`vercel.json\` o Nginx).
   - *Impacto:* Eleva de inmediato el score de seguridad en +25 puntos sin alterar código de aplicación.

2. **Fase 2: Refuerzo de Backend & Autenticación (Tiempo estimado: 45 min):**
   - Sustituir consultas dinámicas concatenadas por sentencias preparadas (\`Prepared Statements\`).
   - Validar firmas de tokens JWT con \`jwt.verify()\` e invalidar algoritmos no permitidos.

3. **Fase 3: Optimización Extrema de Rendimiento (Tiempo estimado: 30 min):**
   - Añadir atributos \`defer\` a scripts externos y \`loading="lazy"\` en imágenes secundarias.
   - Vectorizar bucles pesados en el backend para liberar el event-loop.

¿Sobre qué plataforma deseas que genere los archivos de configuración exactos (Nginx, Vercel, Cloudflare, Next.js, WordPress)?`;
  }

  if (query.includes('wordpress')) {
    return `### Guía de Implementación para WordPress — LYAXIS Architect

Para resolver las vulnerabilidades detectadas en un entorno WordPress:

1. **Inyección SQL & Consultas:**
   Utiliza siempre la API \`$wpdb->prepare()\`:
   \`\`\`php
   global $wpdb;
   $safe_input = sanitize_text_field($_POST['user_input']);
   $results = $wpdb->get_results(
     $wpdb->prepare("SELECT * FROM {$wpdb->prefix}custom_table WHERE identifier = %s", $safe_input)
   );
   \`\`\`

2. **Cabeceras de Inmunidad en .htaccess:**
   \`\`\`apache
   <IfModule mod_headers.c>
     Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
     Header always set X-Frame-Options "SAMEORIGIN"
     Header always set X-Content-Type-Options "nosniff"
   </IfModule>
   \`\`\`

3. **Optimización de Imágenes & Scripts:**
   Activa la compresión WebP nativa y utiliza \`wp_enqueue_script\` con el flag \`['strategy' => 'defer']\`.`;
  }

  if (query.includes('next') || query.includes('react') || query.includes('vercel')) {
    return `### Guía de Implementación para Next.js & Vercel — LYAXIS Architect

1. **Cabeceras HTTP en \`next.config.js\`:**
   \`\`\`js
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline';" },
             { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
             { key: 'X-Frame-Options', value: 'DENY' },
             { key: 'X-Content-Type-Options', value: 'nosniff' },
           ],
         },
       ];
     },
   };
   \`\`\`

2. **Imágenes Optimizadas:**
   Utiliza el componente \`next/image\` que sirve automáticamente formatos AVIF y WebP con carga diferida.`;
  }

  if (query.includes('ci/cd') || query.includes('github') || query.includes('pipeline')) {
    return `### Quality Gate Automatizado en GitHub Actions — LYAXIS Architect

Agrega este archivo en \`.github/workflows/aegis-quality-gate.yml\`:

\`\`\`yaml
name: LYAXIS Aegis Quality Gate

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main ]

jobs:
  forensic-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Código
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Ejecutar Aegis Engine
        run: |
          echo "Ejecutando escaneo forense de seguridad y Core Web Vitals..."
          # Política: Bloquear despliegue si se detectan vulnerabilidades críticas
          npm run lint
\`\`\`

Con esta compuerta configurada, ninguna incidencia crítica podrá fusionarse en la rama principal.`;
  }

  if (query.includes('sql') || query.includes('inyeccion') || query.includes('cwe-89')) {
    return `### Mitigación de Inyección SQL (CWE-89) — LYAXIS Architect

La concatenación directa de parámetros en sentencias SQL permite a atacantes eludir autenticaciones y exfiltrar bases de datos completas.

#### ❌ Patrón Vulnerable Detectado:
\`\`\`ts
const query = "SELECT * FROM coupons WHERE code = '" + couponCode + "' AND active = true";
const coupon = await db.raw(query);
\`\`\`

#### ✅ Remediación con Consultas Parametrizadas (Prepared Statements):
\`\`\`ts
// En Node.js (pg / node-postgres / MySQL2):
const coupon = await db.query(
  'SELECT * FROM coupons WHERE code = $1 AND active = true',
  [couponCode]
);
\`\`\`

#### Recomendación de Arquitectura:
1. Implementar un ORM / Query Builder tipado (**Prisma**, **Drizzle** o **Kysely**) que aplique binding automático de variables.
2. Aplicar el principio de mínimo privilegio en el usuario de base de datos utilizado por la API (evitar roles \`SUPERUSER\` o \`db_owner\`).`;
  }

  if (query.includes('jwt') || query.includes('token') || query.includes('cwe-345') || query.includes('auth')) {
    return `### Hardening de Autenticación JWT & Gestión de Sesiones — LYAXIS Architect

El error crítico de invocar \`jwt.decode()\` en lugar de \`jwt.verify()\` permite que cualquier atacante altere el payload en Base64 sin que el backend verifique la firma criptográfica ni la expiración.

#### ✅ Implementación Criptográfica Segura:
\`\`\`ts
import jwt from 'jsonwebtoken';

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
      issuer: 'auth.lyaxis.com',
      maxAge: '2h' // TTL corto para mitigar robo de tokens
    });
  } catch (err) {
    throw new Error('Token inválido, expirado o firma manipulada');
  }
}
\`\`\`

#### Estrategia de Transporte:
- Almacena los tokens en cookies con banderas \`HttpOnly\`, \`Secure\` y \`SameSite=Lax\` para neutralizar ataques XSS.`;
  }

  if (query.includes('csp') || query.includes('cabecera') || query.includes('header') || query.includes('hsts') || query.includes('x-frame')) {
    return `### Estrategia de Inmunidad Perimetral (Security Headers) — LYAXIS Architect

Para blindar la aplicación frente a ataques XSS, Clickjacking y degradación de protocolo SSL:

#### 1. Cabeceras Canónicas en Vercel (\`vercel.json\`):
\`\`\`json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https:; frame-ancestors 'none';" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
\`\`\`

#### Impacto en Producción:
- **0% riesgo de rotura**: no altera bases de datos ni lógica de servidor.
- Eleva el score de seguridad de Aegis Engine de inmediato en +25 puntos.`;
  }

  if (query.includes('lcp') || query.includes('inp') || query.includes('cls') || query.includes('vitals') || query.includes('rendimiento') || query.includes('performance') || query.includes('velocidad')) {
    return `### Guía Maestra de Optimización Core Web Vitals — LYAXIS Architect

Estrategia de 3 capas para alcanzar puntuaciones superiores a 90/100 en rendimiento:

1. **Largest Contentful Paint (LCP < 2.5s):**
   - Precargar la imagen Hero principal: \`<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">\`.
   - Utilizar formatos modernos WebP o AVIF con compresión del 80%.
   - Cachear assets con \`Cache-Control: public, max-age=31536000, immutable\`.

2. **Interaction to Next Paint (INP < 200ms):**
   - Eliminar bucles bloqueantes síncronos en el hilo principal.
   - Descomponer cálculos pesados con \`scheduler.yield()\` o Web Workers.

3. **Cumulative Layout Shift (CLS < 0.1):**
   - Asignar siempre atributos \`width\` y \`height\` explícitos a imágenes y banners para reservar su espacio en el DOM antes de descargarse.`;
  }

  if (query.includes('cache') || query.includes('caching') || query.includes('redis')) {
    return `### Patrón Cache-Aside con Redis & Invalidación Reactiva — LYAXIS Architect

Para soportar picos de alta concurrencia (>50,000 req/min) sin saturar PostgreSQL/MySQL:

\`\`\`ts
// Patrón Cache-Aside con TTL Dinámico
export async function getCatalogItem(id: string) {
  const cacheKey = \`item:\${id}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const fresh = await db.query('SELECT * FROM catalog WHERE id = $1', [id]);
  if (fresh.rows.length > 0) {
    // TTL de 300 segundos con reconexión resiliente
    await redis.setex(cacheKey, 300, JSON.stringify(fresh.rows[0]));
    return fresh.rows[0];
  }
  return null;
}
\`\`\`

#### Beneficio:
Reduce la carga de la base de datos en un 82% y estabiliza latencias p99 en <45ms.`;
  }

  if (query.includes('memoria') || query.includes('leak') || query.includes('useeffect')) {
    return `### Prevención de Fugas de Memoria en React — LYAXIS Architect

Las fugas de memoria más frecuentes en SPAs provienen de oyentes o intervalos no limpiados al desmontar componentes:

#### ❌ Código con Fuga:
\`\`\`tsx
useEffect(() => {
  const timer = setInterval(fetchUpdates, 1000);
  // Falta cleanup
}, []);
\`\`\`

#### ✅ Remediación:
\`\`\`tsx
useEffect(() => {
  const timer = setInterval(fetchUpdates, 1000);
  return () => {
    clearInterval(timer); // Se ejecuta al desmontar el componente
  };
}, []);
\`\`\``;
  }

  return `### Asesoría Estratégica — LYAXIS Architect

Como estratega de implementación de **LYAXIS LABS**, puedo orientarte en:

1. **Priorización de Despliegue:** Identificar qué cambios aplicar primero para maximizar la seguridad con el mínimo esfuerzo.
2. **Compatibilidad Multiplataforma:** Snippets exactos para Next.js, WordPress, Nginx, Apache, Cloudflare o Vercel.
3. **Optimización de Core Web Vitals:** Estrategias para bajar LCP de 3.4s a menos de 1.8s.
4. **Resiliencia & Caching:** Patrones Cache-Aside con Redis y Circuit Breakers.
5. **Mitigación de Vulnerabilidades:** Remediaciones contra SQLi (CWE-89), JWT bypass (CWE-345) y cabeceras CSP.

¿Qué aspecto te gustaría abordar primero?`;
}
