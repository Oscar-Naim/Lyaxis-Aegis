import { describe, expect, it } from 'vitest';
import { parseGitHubUrl } from './githubFetcher.ts';

describe('parseGitHubUrl', () => {
  it('accepts public repository URLs and shorthand', () => {
    expect(parseGitHubUrl('https://github.com/openai/openai-node/tree/main/src')).toEqual({ owner: 'openai', repo: 'openai-node', branch: 'main', subPath: 'src' });
    expect(parseGitHubUrl('owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('rejects unrelated URLs', () => {
    expect(parseGitHubUrl('https://example.com/owner/repo')).toBeNull();
  });
});
