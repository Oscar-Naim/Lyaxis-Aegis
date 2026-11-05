import { describe, expect, it } from 'vitest';
import { redactSecrets } from './sanitization.ts';

describe('redactSecrets', () => {
  it('redacts common keys before browser persistence', () => {
    expect(redactSecrets("api_key='secret-value' Authorization: Bearer token-value")).not.toContain('secret-value');
    expect(redactSecrets('ghp_123456789012345678901234567890')).toContain('[REDACTED]');
  });
});
