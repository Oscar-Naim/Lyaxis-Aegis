export interface SanitizationReport {
  cleanCode: string;
  foundCount: number;
  tokensRedacted: string[];
}

const PATTERNS = [
  { name: 'API Key / Secret', regex: /(?:api[_-]?key|apikey|secret[_-]?key|app[_-]?secret)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{16,})['"]/gi },
  { name: 'Bearer Token', regex: /bearer\s+([a-zA-Z0-9_\-\.]{20,})/gi },
  { name: 'JWT Token', regex: /ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
  { name: 'Private Key PEM', regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi },
  { name: 'Database Connection String', regex: /(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^:\s]+:[^@\s]+@[a-zA-Z0-9.-]+(?::\d+)?\/[^\s'"]+/gi },
  { name: 'AWS Credentials', regex: /(?:AKIA|ABIA|ACCA)[A-Z0-9]{16}/g }
];

export function scrubSecretsLocally(inputCode: string): SanitizationReport {
  if (!inputCode) return { cleanCode: '', foundCount: 0, tokensRedacted: [] };

  let clean = inputCode;
  let count = 0;
  const redactedList: string[] = [];

  for (const item of PATTERNS) {
    item.regex.lastIndex = 0;
    if (item.regex.test(clean)) {
      redactedList.push(item.name);
      item.regex.lastIndex = 0;
      clean = clean.replace(item.regex, (match) => {
        count++;
        if (match.includes(':') || match.includes('=')) {
          const parts = match.split(/([:=])/);
          return `${parts[0]}${parts[1]} "[VAULT_PROTECTED_KEY_******]"`;
        }
        return '[VAULT_PROTECTED_KEY_******]';
      });
      item.regex.lastIndex = 0;
    }
  }

  return {
    cleanCode: clean,
    foundCount: count,
    tokensRedacted: redactedList,
  };
}

export function saveVaultKey(keyName: string, val: string): void {
  try {
    sessionStorage.setItem(`lyaxis_vault_${keyName}`, val);
  } catch {}
}

export function getVaultKey(keyName: string): string | null {
  try {
    return sessionStorage.getItem(`lyaxis_vault_${keyName}`);
  } catch {
    return null;
  }
}
