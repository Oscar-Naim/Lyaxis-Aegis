import { ScanResult, PipelineRun } from '../types/index.ts';

export const INITIAL_SCAN_RESULT: ScanResult = {
  scanId: 'aegis-seed-9821',
  targetName: 'ShopSphere Next.js & Node API (v2.4.1)',
  targetUrl: 'https://shopsphere.internal.app',
  targetType: 'code',
  timestamp: new Date().toISOString(),
  durationMs: 1420,
  overallScore: 61,
  securityScore: 48,
  performanceScore: 68,
  socialSeoScore: 75,
  privacyScore: 65,
  summary: 'Aegis Engine identificó 2 vulnerabilidades críticas (Inyección SQL y Bypass de Firma JWT en Checkout) y 1 cuello de botella severo en el hilo principal. El pipeline de CI/CD ha bloqueado el despliegue hasta solventar las incidencias.',
  plainSummary: 'Tu aplicación ShopSphere tiene 2 agujeros de seguridad graves que permiten a intrusos consultar tu base de datos y saltarse contraseñas, además de un cálculo lento que congela la página 1 segundo en celulares.',
  issues: [
    {
      id: 'SEC-101',
      title: 'Inyección SQL Crítica por Concatenación de Parámetros en Checkout',
      severity: 'critical',
      category: 'security',
      cwe: 'CWE-89',
      cvss: 9.8,
      owaspTop10: 'A03:2021-Injection',
      fileLocation: 'src/api/checkout/process.ts',
      lineRange: '13-15',
      description: 'El parámetro couponCode se concatena directamente en la consulta SQL sin escapar ni parametrizar, permitiendo a atacantes extraer datos de tarjetas, usuarios y eludir validaciones comerciales.',
      plainSpanishExplanation: 'El código suma el texto del cupón directamente a la consulta de la base de datos. Un atacante puede escribir código malicioso en vez del cupón y robar toda la información.',
      plainSpanishFix: 'Reemplaza la suma de texto por una consulta parametrizada con el símbolo $1 para que la base de datos separe la orden de los datos.',
      impact: 'Exfiltración de base de datos completa y escalada de privilegios administrativos.',
      vulnerableSnippet: `const query = "SELECT * FROM coupons WHERE code = '" + couponCode + "' AND active = true";\nconst coupon = await db.raw(query);`,
      remediation: {
        explanation: 'Utilizar sentencias parametrizadas (Prepared Statements) con bind variables ($1) que garantizan la separación entre la estructura SQL y los datos no confiables.',
        originalSnippet: `const query = "SELECT * FROM coupons WHERE code = '" + couponCode + "' AND active = true";\nconst coupon = await db.raw(query);`,
        remediatedSnippet: `// Remediation: Parametrized Query\nconst coupon = await db.query(\n  'SELECT * FROM coupons WHERE code = $1 AND active = true',\n  [couponCode]\n);`,
        diffSummary: '- db.raw("SELECT ... " + couponCode)\n+ db.query("SELECT ... WHERE code = $1", [couponCode])',
        verificationTest: `test('rejects SQL injection payloads gracefully', async () => {\n  const res = await processCheckout({ couponCode: "' OR '1'='1" });\n  expect(res.status).not.toBe(200);\n});`,
        nginxSnippet: `# Bloqueo WAF opcional en Nginx:\nif ($query_string ~* "union.*select.*\\(") { return 403; }`,
        vercelSnippet: `// Sanitizar entrada en Server Action antes de la query`
      },
      status: 'open',
      estimatedScoreImpact: 16
    },
    {
      id: 'SEC-102',
      title: 'Firma de JWT sin Verificar (Uso Inseguro de jwt.decode)',
      severity: 'critical',
      category: 'security',
      cwe: 'CWE-345',
      cvss: 9.1,
      owaspTop10: 'A07:2021-Identification and Authentication Failures',
      fileLocation: 'src/api/checkout/process.ts',
      lineRange: '10',
      description: 'Se utiliza jwt.decode() que simplemente decodifica el payload en base64 sin verificar la firma criptográfica ni expiración, permitiendo forjar identidad de cualquier usuario.',
      plainSpanishExplanation: 'El sistema confía a ciegas en lo que dice el token sin comprobar el sello digital secreto. Cualquier persona puede inventarse que es administrador.',
      plainSpanishFix: 'Cambia jwt.decode por jwt.verify para comprobar la firma secreta del servidor en cada petición.',
      impact: 'Suplantación de cualquier cuenta o administrador mediante tokens arbitrarios.',
      vulnerableSnippet: `const user = jwt.decode(userToken);`,
      remediation: {
        explanation: 'Validar la firma criptográfica con la clave secreta del proveedor mediante jwt.verify() y restringir algoritmos válidos.',
        originalSnippet: `const user = jwt.decode(userToken);`,
        remediatedSnippet: `const user = jwt.verify(userToken, process.env.JWT_SECRET as string, {\n  algorithms: ['HS256'],\n  issuer: 'auth.lyaxis.com'\n});`,
        diffSummary: '- jwt.decode(userToken)\n+ jwt.verify(userToken, process.env.JWT_SECRET, { algorithms: ["HS256"] })',
        verificationTest: `test('fails on tampered token signature', () => {\n  expect(() => verifyToken('tampered.payload.token')).toThrow();\n});`
      },
      status: 'open',
      estimatedScoreImpact: 15
    },
    {
      id: 'SEC-103',
      title: 'Cabecera CORS Excesivamente Permisiva en Endpoint Transaccional',
      severity: 'high',
      category: 'security',
      cwe: 'CWE-942',
      cvss: 7.5,
      owaspTop10: 'A05:2021-Security Misconfiguration',
      fileLocation: 'src/api/checkout/process.ts',
      lineRange: '27-31',
      description: "Cabecera 'Access-Control-Allow-Origin: *' configurada en una ruta transaccional de pagos, permitiendo que sitios web maliciosos de terceros lean respuestas autenticadas.",
      plainSpanishExplanation: 'Tu servidor le abre la puerta a cualquier página web externa para que espíe datos privados de compras de tus usuarios.',
      plainSpanishFix: 'Configura CORS para que solo acepte peticiones desde tu propia dirección web (dominio oficial).',
      impact: 'Riesgo de ataque CSRF y robo de sesión transaccional cross-origin.',
      vulnerableSnippet: `'Access-Control-Allow-Origin': '*'`,
      remediation: {
        explanation: 'Restringir orígenes permitidos mediante lista blanca estricta leída desde variables de entorno.',
        originalSnippet: `'Access-Control-Allow-Origin': '*'`,
        remediatedSnippet: `const ALLOWED_ORIGIN = process.env.FRONTEND_APP_URL || 'https://app.shopsphere.io';\n'Access-Control-Allow-Origin': ALLOWED_ORIGIN,\n'Vary': 'Origin'`,
        diffSummary: `- 'Access-Control-Allow-Origin': '*'\n+ 'Access-Control-Allow-Origin': ALLOWED_ORIGIN`,
        verificationTest: `test('blocks unauthorized origins', async () => {\n  const res = await fetch('/api/checkout', { headers: { Origin: 'https://evil.com' } });\n  expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();\n});`
      },
      status: 'open',
      estimatedScoreImpact: 9
    },
    {
      id: 'SEO-301',
      title: 'Falta de Etiquetas OpenGraph y Twitter Cards para Compartir',
      severity: 'medium',
      category: 'social_seo',
      cwe: 'SEO-TAGS',
      fileLocation: 'src/app/layout.tsx',
      lineRange: '8-14',
      description: 'El enlace carece de metadatos og:image y twitter:card, impidiendo que plataformas sociales y mensajería generen tarjetas interactivas.',
      plainSpanishExplanation: 'Cuando alguien pasa el enlace de tu tienda por WhatsApp, sale feo, sin foto ni título descriptivo.',
      plainSpanishFix: 'Agrega las etiquetas meta con la foto de portada y descripción para que WhatsApp y Twitter muestren una tarjeta atractiva.',
      impact: 'Pérdida de visitas potenciales al compartir por canales sociales.',
      vulnerableSnippet: `<!-- Falta og:image y twitter:card -->`,
      remediation: {
        explanation: 'Añadir metadatos OpenGraph en la plantilla principal.',
        originalSnippet: `<!-- Sin og:image -->`,
        remediatedSnippet: `<meta property="og:title" content="ShopSphere — Tienda Online" />\n<meta property="og:image" content="https://shopsphere.io/banner.jpg" />\n<meta name="twitter:card" content="summary_large_image" />`,
        diffSummary: `+ og:title, og:image, twitter:card`
      },
      status: 'open',
      estimatedScoreImpact: 8
    },
    {
      id: 'A11Y-401',
      title: 'Botones Transaccionales sin Etiqueta Accesible (WCAG 2.1 AA)',
      severity: 'medium',
      category: 'accessibility_privacy',
      cwe: 'CWE-1025',
      fileLocation: 'src/components/CheckoutButton.tsx',
      lineRange: '24',
      description: 'Botones con iconos carecen de atributo aria-label o texto accesible para lectores de pantalla.',
      plainSpanishExplanation: 'Las personas con problemas de visión no saben para qué sirve el botón porque los lectores de pantalla solo leen "botón vacío".',
      plainSpanishFix: 'Agrega aria-label="Confirmar compra y pagar" al botón.',
      impact: 'Dificultad de navegación para personas con discapacidad visual y riesgo legal de accesibilidad.',
      vulnerableSnippet: `<button className="icon-btn"><ShoppingCartIcon /></button>`,
      remediation: {
        explanation: 'Agregar aria-label descriptivo para lectores de pantalla.',
        originalSnippet: `<button className="icon-btn"><ShoppingCartIcon /></button>`,
        remediatedSnippet: `<button aria-label="Completar y pagar orden" className="icon-btn"><ShoppingCartIcon /></button>`,
        diffSummary: `+ aria-label="Completar y pagar orden"`
      },
      status: 'open',
      estimatedScoreImpact: 7
    }
  ],
  performanceIssues: [
    {
      id: 'PERF-201',
      title: 'Bucle Bloqueante en Hilo Principal (Thread Starvation)',
      severity: 'high',
      type: 'render-bottleneck',
      description: 'Cálculo intensivo redundante dentro del endpoint síncrono que retrasa el TTFB en +850ms y bloquea la atención de peticiones concurrentes.',
      plainSpanishExplanation: 'Tu servidor se queda congelado casi 1 segundo haciendo cálculos matemáticos innecesarios en vez de atender rápido la compra.',
      plainSpanishFix: 'Elimina el bucle de prueba y suma los precios directamente con una sola pasada.',
      fileLocation: 'src/api/checkout/process.ts:18-24',
      impact: 'Caída de throughput global y timeout bajo picos moderados de tráfico.',
      remediation: {
        explanation: 'Eliminar bucles anidados redundantes y vectorizar el cálculo con Array.reduce nativo.',
        originalSnippet: `for (let i = 0; i < cartItems.length; i++) {\n  for (let j = 0; j < 10000; j++) { total += Math.sin(j) * 0.0001; }\n  total += cartItems[i].price;\n}`,
        remediatedSnippet: `// Remediation: Single-pass O(N) linear reduction\nconst total = cartItems.reduce((acc, item) => acc + item.price, 0);`,
        diffSummary: '- Nested blocking loop with Math.sin()\n+ cartItems.reduce((acc, item) => acc + item.price, 0)'
      },
      estimatedScoreImpact: 12
    },
    {
      id: 'PERF-202',
      title: 'Fuga de Memoria por Intervalo Huérfano en useEffect',
      severity: 'medium',
      type: 'memory-leak',
      description: 'El hook useEffect ejecuta setInterval cada segundo sin retornar una función de limpieza, acumulando temporizadores huérfanos cada vez que el componente se monta.',
      plainSpanishExplanation: 'Cada vez que el usuario abre esta pantalla, se queda un reloj fantasma en segundo plano gastando memoria y batería.',
      plainSpanishFix: 'Agrega return () => clearInterval(timer); para apagar el reloj cuando la pantalla se cierre.',
      fileLocation: 'src/components/AccountOverview.tsx:7-14',
      impact: 'Incremento continuo del uso de memoria en pestañas abiertas y degradación de fluidez UI.',
      remediation: {
        explanation: 'Retornar función clearInterval dentro del hook para liberar el listener.',
        originalSnippet: `useEffect(() => {\n  const timer = setInterval(async () => { ... }, 1000);\n}, [accountId]);`,
        remediatedSnippet: `useEffect(() => {\n  const timer = setInterval(async () => { ... }, 1000);\n  return () => clearInterval(timer); // Cleanup function\n}, [accountId]);`,
        diffSummary: '+ return () => clearInterval(timer);'
      },
      estimatedScoreImpact: 8
    }
  ],
  metrics: [
    { name: 'Largest Contentful Paint (LCP)', value: '3.4s', score: 58, status: 'poor', recommendation: 'Optimizar carga de imágenes críticas con fetchpriority="high" y CDN.', plainImpact: 'La pantalla tarda 3.4 segundos en mostrar su imagen o texto principal.' },
    { name: 'Interaction to Next Paint (INP)', value: '280ms', score: 65, status: 'needs-improvement', recommendation: 'Descomponer tareas largas en micro-tasks con requestIdleCallback.', plainImpact: 'Se siente una pequeña pausa al tocar los botones.' },
    { name: 'Cumulative Layout Shift (CLS)', value: '0.04', score: 92, status: 'good', recommendation: 'Excelente estabilidad visual. Mantener dimensiones fijas en banners.', plainImpact: 'La página no da saltos bruscos mientras carga.' },
    { name: 'Time to First Byte (TTFB)', value: '410ms', score: 71, status: 'needs-improvement', recommendation: 'Habilitar streaming SSR y cache Redis en queries complejas.', plainImpact: 'Tiempo en que el servidor empieza a enviar datos.' },
    { name: 'Total JavaScript Bundle', value: '482 KB gzip', score: 62, status: 'needs-improvement', recommendation: 'Aplicar dynamic import() en librerías pesadas (ej: recharts, lodash).', plainImpact: 'Peso de los archivos descargados para que la web funcione.' }
  ],
  architectureRecommendations: [
    {
      id: 'ARCH-01',
      domain: 'Capa de Caching Distribuido',
      title: 'Implementación de Redis Cache-Aside Pattern para Consultas de Alta Frecuencia',
      description: 'Las consultas de catálogo y validación de reglas de negocio golpean directamente PostgreSQL sin capa intermedia, creando riesgo de saturación en picos de tráfico.',
      currentRisk: 'Degradación de throughput y latencias superiores a 1.2s en eventos de alta demanda.',
      recommendedPattern: 'Cache-Aside con TTL dinámico e invalidación reactiva.',
      codeOrConfigExample: `// Pattern: Cache-Aside with Redis\nconst cached = await redis.get(\`coupon:\${code}\`);\nif (cached) return JSON.parse(cached);\nconst fresh = await db.query('SELECT ...');\nawait redis.setex(\`coupon:\${code}\`, 300, JSON.stringify(fresh));\nreturn fresh;`,
      scalabilityImpact: 'Reduce la carga sobre la base de datos en un 82% y estabiliza latencias p99 en <45ms.'
    },
    {
      id: 'ARCH-02',
      domain: 'Seguridad y Resiliencia de API',
      title: 'Circuit Breaker y Rate Limiting Distribuido con Sliding Window',
      description: 'Los endpoints de checkout no poseen limitadores de tasa ni circuit breakers hacia las pasarelas de pago externas.',
      currentRisk: 'Riesgo de ataques de denegación de servicio (DoS) y bloqueo en cascada cuando el procesador de pagos falla.',
      recommendedPattern: 'Token Bucket Rate Limiting a nivel de API Gateway + Opossum Circuit Breaker en clientes HTTP.',
      codeOrConfigExample: `import CircuitBreaker from 'opossum';\nconst paymentBreaker = new CircuitBreaker(callPaymentGateway, {\n  timeout: 4000,\n  errorThresholdPercentage: 50,\n  resetTimeout: 30000\n});\npaymentBreaker.fallback(() => ({ status: 'queued', message: 'Trámite en cola' }));`,
      scalabilityImpact: 'Garantiza alta disponibilidad del 99.95% ante caídas de proveedores downstream.'
    }
  ],
  masterPlan: [
    {
      stepNumber: 1,
      title: 'Despliegue de Cabeceras de Inmunidad (CSP, HSTS, X-Frame-Options)',
      platform: 'Vercel',
      priority: 'immediate',
      impactVsEffort: 'Quick Win',
      description: 'Configurar cabeceras de seguridad estrictas en vercel.json para bloquear Clickjacking y XSS perimetralmente.',
      productionSafeNotes: '100% seguro en producción. No altera datos ni base de datos.',
      codeOrConfig: `// vercel.json headers:\n{ "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }`,
      verificationCommand: `curl -I https://shopsphere.internal.app`
    },
    {
      stepNumber: 2,
      title: 'Parche de Inyección SQL con Consultas Parametrizadas',
      platform: 'Next.js',
      priority: 'immediate',
      impactVsEffort: 'High Impact',
      description: 'Reemplazar cadenas concatenadas en checkout por sentencias preparadas con $1.',
      productionSafeNotes: 'Correr tests de integración de checkout antes del merge.',
      codeOrConfig: `const coupon = await db.query('SELECT * FROM coupons WHERE code = $1', [couponCode]);`,
      verificationCommand: `npm test`
    },
    {
      stepNumber: 3,
      title: 'Validación Criptográfica de Tokens JWT con jwt.verify',
      platform: 'General',
      priority: 'high',
      impactVsEffort: 'High Impact',
      description: 'Sustituir jwt.decode por jwt.verify vinculado a la variable de entorno JWT_SECRET.',
      productionSafeNotes: 'Verificar que JWT_SECRET exista en producción.',
      codeOrConfig: `const user = jwt.verify(token, process.env.JWT_SECRET);`,
      verificationCommand: `npm run lint`
    },
    {
      stepNumber: 4,
      title: 'Vectorización del Cálculo de Carrito y Liberación del Main Thread',
      platform: 'Next.js',
      priority: 'medium',
      impactVsEffort: 'Quick Win',
      description: 'Eliminar el bucle Math.sin y reducir en O(N) lineal.',
      productionSafeNotes: 'Verificar que el total final coincida con céntimos exactos.',
      codeOrConfig: `const total = cartItems.reduce((acc, item) => acc + item.price, 0);`,
      verificationCommand: `npm test -- --grep "total calculation"`
    },
    {
      stepNumber: 5,
      title: 'Inyección de Tarjeta Social OpenGraph & Twitter Cards',
      platform: 'General',
      priority: 'low',
      impactVsEffort: 'Quick Win',
      description: 'Añadir metadatos en layout.tsx para optimizar previsualizaciones en WhatsApp y X.',
      productionSafeNotes: 'No afecta rendimiento ni base de datos.',
      codeOrConfig: `<meta property="og:title" content="ShopSphere" />\n<meta property="og:image" content="/banner.png" />`,
      verificationCommand: `curl -s https://shopsphere.internal.app | grep "og:image"`
    }
  ],
  socialCardData: {
    ogTitle: 'ShopSphere — Next.js & Node API',
    ogDescription: 'Portal de comercio electrónico de alta concurrencia con procesamiento seguro y Core Web Vitals optimizados.',
    ogImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop',
    twitterCard: 'summary_large_image',
    canonicalUrl: 'https://shopsphere.internal.app',
    metaHtml: `<!-- LYAXIS AEGIS Social Optimization Block -->\n<meta property="og:title" content="ShopSphere — Next.js & Node API" />\n<meta property="og:description" content="Portal de comercio electrónico de alta concurrencia." />\n<meta property="og:image" content="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop" />\n<meta name="twitter:card" content="summary_large_image" />`,
    missingTags: ['og:image', 'twitter:card']
  },
  complianceAudits: [
    { standard: 'OWASP Top 10', rule: 'A03:2021 Prevención de Inyección', status: 'failed', notes: 'Fallo crítico por parámetros concatenados en SQL sin binding.' },
    { standard: 'OWASP Top 10', rule: 'A07:2021 Autenticación e Identidad', status: 'failed', notes: 'Uso de jwt.decode sin validación de firma criptográfica.' },
    { standard: 'OWASP Top 10', rule: 'A05:2021 Configuración de Seguridad', status: 'failed', notes: 'Cabecera CORS wildcard (*) en endpoint de pagos.' },
    { standard: 'SOC 2', rule: 'CC6.1 Acceso y Protección de Credenciales', status: 'warning', notes: 'Se detectaron tokens con tiempos de expiración mayores a 24 horas.' },
    { standard: 'SOC 2', rule: 'CC7.2 Registro de Incidentes & Auditoría', status: 'passed', notes: 'Registro de accesos con timestamp estructurado en JSON.' },
    { standard: 'PCI-DSS', rule: 'Req 6.5.1 Vulnerabilidad de Inyección SQL', status: 'failed', notes: 'Infracción estricta de mitigación de SQLi previa a pagos con tarjetas.' },
    { standard: 'GDPR', rule: 'Artículo 32 Seguridad del Procesamiento', status: 'warning', notes: 'Revisar cifrado en reposo para datos de identificación personal (PII).' }
  ],
  ciStatus: {
    passed: false,
    failReason: 'Bloqueado por política de seguridad Aegis: 2 incidencias críticas detectadas (Límite permitido: 0).',
    thresholdPolicy: 'Fail if Critical > 0 OR High > 2 OR PerfScore < 70'
  }
};

export const INITIAL_PIPELINE_RUN: PipelineRun = {
  runId: 'run-8820a',
  commitHash: '7a29e4f',
  branch: 'main',
  author: 'carlos.dev@shopsphere.io',
  trigger: 'pull_request',
  timestamp: new Date().toISOString(),
  status: 'failed',
  stages: [
    {
      id: 'stg-1',
      name: 'Lint & Strict Type Check',
      status: 'success',
      durationMs: 380,
      logs: [
        'Running tsc --noEmit and eslint...',
        'Checking 142 files in workspace...',
        '0 fatal errors found. TypeScript validation succeeded.'
      ]
    },
    {
      id: 'stg-2',
      name: 'Aegis Engine Forensic Static Analysis',
      status: 'failed',
      durationMs: 820,
      logs: [
        'Analyzing abstract syntax trees and dependency graphs...',
        '[CRITICAL] CWE-89 SQL Injection in src/api/checkout/process.ts:14',
        '[CRITICAL] CWE-345 Cryptographic signature bypass in src/api/checkout/process.ts:10',
        '[HIGH] CWE-942 Permissive CORS wildcard in src/api/checkout/process.ts:28',
        'QUALITY GATE FAILED: Policy "Fail on Critical > 0" triggered.'
      ]
    },
    {
      id: 'stg-3',
      name: 'Web Vitals & Performance Gate',
      status: 'success',
      durationMs: 640,
      logs: [
        'Executing headless performance benchmark...',
        'LCP: 3.4s (warning threshold > 2.5s)',
        'INP: 280ms (passed < 300ms)',
        'CLS: 0.04 (passed < 0.1)',
        'Performance score: 68/100 (Min requirement: 65) -> PASSED'
      ]
    },
    {
      id: 'stg-4',
      name: 'Compliance & PR Blocking Enforcer',
      status: 'failed',
      durationMs: 140,
      logs: [
        'Evaluating enterprise branch policies...',
        'Pull Request #412 "Feature/checkout-coupons" BLOCKED from merging.',
        'Notification sent to developer with Aegis remediation patch links.'
      ]
    }
  ],
  summary: {
    criticalCount: 2,
    highCount: 2,
    perfScore: 68,
    gatePassed: false
  }
};

export const POPULAR_CHIPS = [
  {
    name: 'OWASP / NodeGoat',
    url: 'https://github.com/OWASP/NodeGoat',
    type: 'github',
    desc: 'Benchmark de seguridad web para Node.js',
    tag: 'Seguridad Crítica'
  },
  {
    name: 'vercel / next-learn',
    url: 'https://github.com/vercel/next-learn',
    type: 'github',
    desc: 'Next.js App Router, SSR, Server Actions y Auth',
    tag: 'Full-Stack Next.js'
  },
  {
    name: 'acme-ecommerce.com',
    url: 'https://acme-ecommerce.com',
    type: 'url',
    desc: 'Tienda de demostración en producción con carrito y pasarela',
    tag: 'Sitio Web Real'
  },
  {
    name: 'Código Checkout Inseguro',
    snippetId: 'checkout-snippet',
    type: 'code',
    desc: 'Endpoint transaccional con SQLi, JWT bypass y bucle síncrono',
    tag: 'Editor Directo'
  }
];
