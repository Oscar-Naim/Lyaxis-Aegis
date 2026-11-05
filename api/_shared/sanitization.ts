export interface SanitizeResult {
  sanitized: string;
  foundSecretsCount: number;
  typesDetected: string[];
}

const SECRET_PATTERNS = [
  { name: 'API Key General', regex: /(?:api[_-]?key|apikey|secret[_-]?key)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{16,})['"]/gi },
  { name: 'Bearer Token', regex: /bearer\s+([a-zA-Z0-9_\-\.]{24,})/gi },
  { name: 'JWT Token', regex: /ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
  { name: 'Private Key PEM', regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi },
  { name: 'AWS Access Key', regex: /(?:AKIA|ABIA|ACCA)[A-Z0-9]{16}/g },
  { name: 'Database Connection String', regex: /(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^:\s]+:[^@\s]+@[a-zA-Z0-9.-]+(?::\d+)?\/[^\s'"]+/gi },
  { name: 'Generic Password / Secret in Code', regex: /(?:password|passwd|pwd|client_secret)\s*[:=]\s*['"][^'"]{6,}['"]/gi }
];

export function sanitizeCredentials(code: string): SanitizeResult {
  if (!code) return { sanitized: '', foundSecretsCount: 0, typesDetected: [] };

  let sanitized = code;
  let foundCount = 0;
  const typesDetected: Set<string> = new Set();

  for (const item of SECRET_PATTERNS) {
    if (item.regex.test(sanitized)) {
      typesDetected.add(item.name);
      sanitized = sanitized.replace(item.regex, (match) => {
        foundCount++;
        if (match.includes(':') || match.includes('=')) {
          const parts = match.split(/([:=])/);
          return `${parts[0]}${parts[1]} "[PROTECTED_BY_AEGIS_VAULT_******]"`;
        }
        return '[PROTECTED_BY_AEGIS_VAULT_******]';
      });
    }
  }

  return {
    sanitized,
    foundSecretsCount: foundCount,
    typesDetected: Array.from(typesDetected),
  };
}
