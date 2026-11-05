export interface UrlAuditFindings {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  headers: Record<string, string>;
  missingSecurityHeaders: string[];
  presentSecurityHeaders: string[];
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    card?: string;
  };
  missingSocialTags: string[];
  scriptsAnalysis: {
    totalScripts: number;
    blockingScripts: string[];
  };
  imagesAnalysis: {
    totalImages: number;
    missingAltCount: number;
    missingLazyCount: number;
  };
  cookiesAnalysis: {
    hasInsecureCookies: boolean;
    cookieDetails: string[];
  };
}

function isPrivateAddress(address: string): boolean {
  if (net.isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168;
  }
  const normalized = address.toLowerCase();
  return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:') || normalized.startsWith('::ffff:127.');
}

export async function validateExternalTarget(rawUrl: string): Promise<URL> {
  const normalized = /^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : `https://${rawUrl.trim()}`;
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error('La URL no es válida.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Solo se permiten URLs HTTP(S) públicas sin credenciales.');
  }
  if (url.hostname === 'localhost' || net.isIP(url.hostname) && isPrivateAddress(url.hostname)) {
    throw new Error('No se permiten destinos locales o privados.');
  }
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(entry => isPrivateAddress(entry.address))) {
    throw new Error('La URL resuelve a una dirección no pública.');
  }
  return url;
}

export async function auditLiveUrl(targetUrl: string): Promise<UrlAuditFindings> {
  const startTime = Date.now();
  let activeUrl = await validateExternalTarget(targetUrl);
  let normalizedUrl = activeUrl.toString();

  const missingSecurityHeaders: string[] = [];
  const presentSecurityHeaders: string[] = [];
  const headersMap: Record<string, string> = {};
  const missingSocialTags: string[] = [];

  let statusCode = 200;
  let html = '';
  let responseTimeMs = 150;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let res: Response | undefined;
    for (let redirects = 0; redirects <= 3; redirects++) {
      res = await fetch(activeUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'LYAXIS-Aegis/3.0 passive-auditor',
          'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      if (![301, 302, 303, 307, 308].includes(res.status)) break;
      const location = res.headers.get('location');
      if (!location) break;
      activeUrl = await validateExternalTarget(new URL(location, activeUrl).toString());
      normalizedUrl = activeUrl.toString();
    }
    clearTimeout(timeout);
    if (!res) throw new Error('No se recibió respuesta del destino.');

    responseTimeMs = Date.now() - startTime;
    statusCode = res.status;

    res.headers.forEach((val, key) => {
      headersMap[key.toLowerCase()] = val;
    });

    html = await res.text();
  } catch (err: any) {
    responseTimeMs = Date.now() - startTime;
    statusCode = 502;
    html = '';
  }

  // 1. Audit HTTP Security Headers
  const EXPECTED_SECURITY_HEADERS = [
    { name: 'content-security-policy', label: 'Content-Security-Policy (CSP)' },
    { name: 'strict-transport-security', label: 'Strict-Transport-Security (HSTS)' },
    { name: 'x-frame-options', label: 'X-Frame-Options (Clickjacking)' },
    { name: 'x-content-type-options', label: 'X-Content-Type-Options (MIME Sniffing)' },
    { name: 'permissions-policy', label: 'Permissions-Policy' },
    { name: 'referrer-policy', label: 'Referrer-Policy' },
  ];

  for (const h of EXPECTED_SECURITY_HEADERS) {
    if (headersMap[h.name]) {
      presentSecurityHeaders.push(h.label);
    } else {
      missingSecurityHeaders.push(h.label);
    }
  }

  // 2. OpenGraph & SEO tags audit
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
                       html.match(/<title>(.*?)<\/title>/i);
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
                      html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
  const twitterCardMatch = html.match(/<meta\s+name=["']twitter:card["']\s+content=["'](.*?)["']/i);

  const openGraph = {
    title: ogTitleMatch ? ogTitleMatch[1] : undefined,
    description: ogDescMatch ? ogDescMatch[1] : undefined,
    image: ogImageMatch ? ogImageMatch[1] : undefined,
    card: twitterCardMatch ? twitterCardMatch[1] : undefined,
  };

  if (!openGraph.title) missingSocialTags.push('og:title');
  if (!openGraph.description) missingSocialTags.push('og:description');
  if (!openGraph.image) missingSocialTags.push('og:image');
  if (!openGraph.card) missingSocialTags.push('twitter:card');

  // 3. Scripts blocking analysis
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let totalScripts = 0;
  const blockingScripts: string[] = [];

  while ((match = scriptRegex.exec(html)) !== null) {
    totalScripts++;
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["'](.*?)["']/i);
    const hasAsync = /async\b/i.test(attrs);
    const hasDefer = /defer\b/i.test(attrs);
    const isModule = /type=["']module["']/i.test(attrs);

    if (srcMatch && !hasAsync && !hasDefer && !isModule) {
      blockingScripts.push(srcMatch[1]);
    }
  }

  // 4. Images analysis (lazy loading & alt)
  const imgRegex = /<img\b([^>]*)>/gi;
  let totalImages = 0;
  let missingAltCount = 0;
  let missingLazyCount = 0;

  while ((match = imgRegex.exec(html)) !== null) {
    totalImages++;
    const attrs = match[1];
    if (!/alt=["'][^"']*["']/i.test(attrs)) {
      missingAltCount++;
    }
    if (!/loading=["']lazy["']/i.test(attrs)) {
      missingLazyCount++;
    }
  }

  // 5. Cookie Analysis
  const setCookie = headersMap['set-cookie'] || '';
  const hasInsecureCookies = Boolean(
    setCookie && (!/secure/i.test(setCookie) || !/samesite/i.test(setCookie) || !/httponly/i.test(setCookie))
  );

  return {
    url: normalizedUrl,
    statusCode,
    responseTimeMs,
    headers: headersMap,
    missingSecurityHeaders,
    presentSecurityHeaders,
    openGraph,
    missingSocialTags,
    scriptsAnalysis: {
      totalScripts,
      blockingScripts: blockingScripts.slice(0, 5),
    },
    imagesAnalysis: {
      totalImages,
      missingAltCount,
      missingLazyCount,
    },
    cookiesAnalysis: {
      hasInsecureCookies,
      cookieDetails: setCookie ? [setCookie.slice(0, 80)] : [],
    },
  };
}
import { lookup } from 'node:dns/promises';
import net from 'node:net';

