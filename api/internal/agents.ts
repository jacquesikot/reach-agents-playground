import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.VITE_AGENT_API_KEY;
  const orgId = process.env.VITE_AGENT_ORG_ID;
  const baseUrl = process.env.VITE_AGENT_API_BASE_URL;

  if (!apiKey || !orgId || !baseUrl) {
    return res.status(500).json({ error: 'Agent API configuration missing' });
  }

  try {
    const response = await fetch(`${baseUrl}/agents`, {
      method: req.method,
      headers: {
        'x-api-key': apiKey,
        'x-organization-id': orgId,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Agent API error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Agent API' });
  }
}
