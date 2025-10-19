import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.VITE_OPIK_API_KEY;
  const workspace = process.env.VITE_OPIK_WORKSPACE;

  if (!apiKey || !workspace) {
    console.error('Missing environment variables:', {
      hasApiKey: !!apiKey,
      hasWorkspace: !!workspace
    });
    return res.status(500).json({ error: 'Opik API configuration missing' });
  }

  try {
    const url = `https://www.comet.com/opik/api/v1/workspaces/${workspace}/prompts/versions`;
    console.log('Fetching from Opik API:', { method: req.method, url });

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        Authorization: apiKey,
        'Comet-Workspace': workspace,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    // Only add body for methods that support it
    if (req.method && ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);

    const data = await response.json();

    if (!response.ok) {
      console.error('Opik API error response:', {
        status: response.status,
        data
      });
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Opik API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch from Opik API',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
