import { generateMasterImplementationPlan, handleArchitectChat } from './_shared/lyaxisArchitect.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'LYAXIS Architect API online' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, message, history, currentScanContext, platform } = body;

    if (action === 'chat' || message) {
      const response = handleArchitectChat({
        message,
        history,
        currentScanContext,
        platformTarget: platform
      });
      return res.status(200).json({ response });
    }

    // Default: generate master plan for platform
    const masterPlan = generateMasterImplementationPlan(currentScanContext || {}, platform || 'Next.js');
    return res.status(200).json({ masterPlan });
  } catch (err: any) {
    console.error('LYAXIS Architect Error:', err);
    return res.status(500).json({
      error: 'Error al consultar LYAXIS Architect',
      details: err?.message || 'Error interno'
    });
  }
}
