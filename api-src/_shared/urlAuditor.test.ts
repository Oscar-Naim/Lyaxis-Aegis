import { describe, expect, it } from 'vitest';
import { validateExternalTarget } from './urlAuditor.ts';

describe('validateExternalTarget', () => {
  it('blocks loopback and metadata-style private destinations before fetch', async () => {
    await expect(validateExternalTarget('http://127.0.0.1:3000')).rejects.toThrow(/destinos locales o privados/i);
    await expect(validateExternalTarget('http://169.254.169.254')).rejects.toThrow(/destinos locales o privados/i);
  });

  it('rejects credentials in a target URL', async () => {
    await expect(validateExternalTarget('https://user:pass@example.com')).rejects.toThrow('sin credenciales');
  });
});
