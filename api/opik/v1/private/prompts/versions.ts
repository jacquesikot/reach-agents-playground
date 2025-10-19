import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.VITE_OPIK_API_KEY;
  const workspace = process.env.VITE_OPIK_WORKSPACE;

  if (!apiKey || !workspace) {
    return res.status(500).json({ error: 'Opik API configuration missing' });
  }

  try {
    const response = await fetch(`https://www.comet.com/opik/api/v1/workspaces/${workspace}/prompts/versions`, {
      method: req.method,
      headers: {
        Authorization: apiKey,
        'Comet-Workspace': workspace,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Opik API error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Opik API' });
  }
}
