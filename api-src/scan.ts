import { runAegisForensicScan } from './_shared/aegisEngine.ts';
import { parseGitHubUrl, fetchRepoMetadata } from './_shared/githubFetcher.ts';

export default async function handler(req: any, res: any) {
  // Enable CORS for API consumption
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Fast GitHub info probe via GET
  if (req.method === 'GET') {
    const url = (req.query?.url as string) || '';
    if (!url) {
      return res.status(200).json({ status: 'LYAXIS Aegis Engine API online' });
    }
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return res.status(400).json({ error: 'URL de GitHub inválida' });
    }
    const meta = await fetchRepoMetadata(parsed.owner, parsed.repo);
    return res.status(200).json({ parsed, meta });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const targetInput = body.targetUrl || body.githubUrl || body.targetName || '';
    const sourceCodeInput = body.sourceCode || '';
    const targetTypeHint = body.targetTypeHint;

    const scanResult = await runAegisForensicScan({
      targetInput,
      sourceCodeInput,
      targetTypeHint,
    });

    return res.status(200).json(scanResult);
  } catch (err: any) {
    console.error('Aegis Engine Scan Error:', err);
    return res.status(500).json({ 
      error: 'Error al ejecutar el escaneo forense con Aegis Engine',
      details: err?.message || 'Error interno'
    });
  }
}
