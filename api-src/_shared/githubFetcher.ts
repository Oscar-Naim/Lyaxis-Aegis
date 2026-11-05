export interface ParsedRepo {
  owner: string;
  repo: string;
  branch?: string;
  subPath?: string;
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  stars: number;
  openIssues: number;
  language: string;
  htmlUrl: string;
}

export interface FetchedFile {
  path: string;
  content: string;
  size: number;
}

export function parseGitHubUrl(input: string): ParsedRepo | null {
  if (!input) return null;
  const clean = input.trim();

  // Pattern: https://github.com/owner/repo or github.com/owner/repo
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/tree\/([a-zA-Z0-9_.-]+)(?:\/(.*))?)?/;
  const match = clean.match(githubRegex);

  if (match) {
    const owner = match[1];
    let repo = match[2];
    if (repo.endsWith('.git')) repo = repo.slice(0, -4);
    const branch = match[3];
    const subPath = match[4];
    return { owner, repo, branch, subPath };
  }

  // Fallback: simple "owner/repo" shorthand
  const shortRegex = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/;
  const shortMatch = clean.match(shortRegex);
  if (shortMatch) {
    let repo = shortMatch[2];
    if (repo.endsWith('.git')) repo = repo.slice(0, -4);
    return { owner: shortMatch[1], repo };
  }

  return null;
}

export async function fetchRepoMetadata(owner: string, repo: string): Promise<RepoMetadata | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'LYAXIS-Aegis-Engine-v2',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      owner: data.owner?.login || owner,
      repo: data.name || repo,
      fullName: data.full_name || `${owner}/${repo}`,
      description: data.description || 'Repositorio analizado con Aegis Engine.',
      defaultBranch: data.default_branch || 'main',
      stars: data.stargazers_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      language: data.language || 'TypeScript',
      htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}

async function fetchRawFile(owner: string, repo: string, branch: string, path: string): Promise<string | null> {
  try {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(rawUrl, {
      headers: { 'User-Agent': 'LYAXIS-Aegis-Engine-v2' },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function scoreFilePath(path: string): number {
  if (path === 'package.json') return 100;
  if (/^server\.(ts|js)/i.test(path)) return 95;
  if (/^app\.(ts|js)/i.test(path)) return 90;
  if (/auth|jwt|token|login|security/i.test(path)) return 88;
  if (/api\/|routes\/|controllers\//i.test(path)) return 85;
  if (/db\/|models\/|database\/|prisma/i.test(path)) return 80;
  if (/checkout|payment|order/i.test(path)) return 78;
  if (/middleware/i.test(path)) return 75;
  if (/Dockerfile|\.github\/workflows/i.test(path)) return 70;
  if (/App\.(tsx|jsx)/i.test(path)) return 65;
  if (/\.(ts|tsx|js|jsx)$/i.test(path)) return 40;
  return 10;
}

export async function fetchRepoKeyFiles(
  owner: string,
  repo: string,
  branch: string
): Promise<{ files: FetchedFile[]; filePaths: string[] }> {
  let fileList: string[] = [];

  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          'User-Agent': 'LYAXIS-Aegis-Engine-v2',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (treeRes.ok) {
      const treeData = await treeRes.json();
      if (Array.isArray(treeData.tree)) {
        fileList = treeData.tree
          .filter((item: any) => item.type === 'blob')
          .map((item: any) => item.path)
          .filter((p: string) => !p.startsWith('node_modules/') && !p.startsWith('dist/') && !p.startsWith('.git/'));
      }
    }
  } catch {
    // Fallback list
  }

  if (fileList.length === 0) {
    fileList = [
      'package.json',
      'server.ts',
      'src/App.tsx',
      'src/index.ts',
      'api/index.ts',
      'next.config.js',
      'tsconfig.json',
      'Dockerfile'
    ];
  }

  const sortedFiles = fileList
    .slice()
    .sort((a, b) => scoreFilePath(b) - scoreFilePath(a))
    .slice(0, 10);

  const fetchedFiles: FetchedFile[] = [];
  let totalBytes = 0;
  const MAX_TOTAL_BYTES = 120 * 1024;

  for (const filePath of sortedFiles) {
    if (totalBytes >= MAX_TOTAL_BYTES) break;
    const content = await fetchRawFile(owner, repo, branch, filePath);
    if (content && content.trim().length > 0) {
      const size = Buffer.byteLength(content, 'utf8');
      const finalContent = content.length > 30000 ? content.slice(0, 30000) + '\n// ... [truncado para auditoría]' : content;
      fetchedFiles.push({
        path: filePath,
        content: finalContent,
        size,
      });
      totalBytes += size;
    }
  }

  return {
    files: fetchedFiles,
    filePaths: fetchedFiles.map(f => f.path),
  };
}
