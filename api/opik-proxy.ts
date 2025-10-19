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
      hasWorkspace: !!workspace,
      env: process.env
    });
    return res.status(500).json({ error: 'Opik API configuration missing' });
  }

  try {
    // Extract the path from the query parameter
    const pathParam = req.query.path;
    let apiPath = '';

    if (Array.isArray(pathParam)) {
      apiPath = pathParam.join('/');
    } else if (pathParam) {
      apiPath = pathParam;
    } else {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const url = `https://www.comet.com/opik/api/${apiPath}`;
    console.log('Proxying Opik request:', {
      method: req.method,
      url,
      path: apiPath,
      hasApiKey: !!apiKey,
      hasWorkspace: !!workspace
    });

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
    const contentType = response.headers.get('content-type');

    // Handle JSON responses
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        console.error('Opik API error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
      }

      return res.status(response.status).json(data);
    }

    // Handle non-JSON responses
    const text = await response.text();
    return res.status(response.status).send(text);

  } catch (error) {
    console.error('Opik API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch from Opik API',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
