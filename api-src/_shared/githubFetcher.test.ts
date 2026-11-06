import { describe, expect, it } from 'vitest';
import { parseGitHubUrl } from './githubFetcher.ts';

describe('parseGitHubUrl', () => {
  it('accepts public repository URLs and shorthand', () => {
    expect(parseGitHubUrl('https://github.com/lyaxis/lyaxis-core/tree/main/src')).toEqual({ owner: 'lyaxis', repo: 'lyaxis-core', branch: 'main', subPath: 'src' });
    expect(parseGitHubUrl('owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('rejects unrelated URLs', () => {
    expect(parseGitHubUrl('https://example.com/owner/repo')).toBeNull();
  });
});
