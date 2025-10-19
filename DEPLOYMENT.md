# Deployment Guide

## Environment Variables Setup

Before deploying to Vercel, ensure all environment variables are configured in your Vercel dashboard.

### Required Environment Variables

Go to your Vercel project settings → Environment Variables and add:

```
VITE_OPIK_API_KEY=your_opik_api_key_here
VITE_OPIK_WORKSPACE=your_opik_workspace_here
VITE_OPIK_PROJECT_NAME=your_opik_project_name_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_AGENT_API_BASE_URL=your_agent_api_base_url_here
VITE_AGENT_API_KEY=your_agent_api_key_here
VITE_AGENT_ORG_ID=your_agent_org_id_here
```

### Important Notes

1. All environment variables should be added to ALL environments (Production, Preview, Development)
2. After adding environment variables, you must redeploy your application for changes to take effect
3. The serverless functions in `/api` directory will use these environment variables

## Architecture

### Development vs Production

- **Development**: The Vite dev server proxy (configured in `vite.config.ts`) routes `/api/opik` requests to the Opik API
- **Production**: Vercel serverless functions in `/api/opik/v1/private/prompts/` handle the routing

### API Routes

The following API routes are available:

1. **GET/PUT `/api/opik/v1/private/prompts/{id}`**
   - Fetches or updates a specific prompt by ID
   - Implemented in: `api/opik/v1/private/prompts/[id].ts`

2. **POST `/api/opik/v1/private/prompts/versions`**
   - Creates a new version of a prompt
   - Implemented in: `api/opik/v1/private/prompts/versions.ts`

## Troubleshooting

### 404 Errors on API Routes

If you're getting 404 errors on `/api/opik/*` routes:

1. Check Vercel deployment logs for errors
2. Verify environment variables are set in Vercel dashboard
3. Ensure the deployment includes the `/api` directory
4. Check the function logs in Vercel dashboard for detailed error messages

### Environment Variable Issues

If you're getting "Opik API configuration missing" errors:

1. Verify `VITE_OPIK_API_KEY` is set in Vercel
2. Verify `VITE_OPIK_WORKSPACE` is set in Vercel
3. Redeploy the application after adding environment variables

### Viewing Logs

To view serverless function logs:
1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Deployments" tab
4. Click on the latest deployment
5. Click "Functions" to view function logs

## Deployment Steps

1. Commit your changes:
```bash
git add .
git commit -m "Fix Opik API proxy for production"
git push
```

2. Vercel will automatically deploy your changes

3. After deployment, verify environment variables are set

4. Test the API endpoints using your application

## Local Development

For local development, the Vite proxy handles all `/api/opik` requests. Make sure your `.env` file contains:

```
VITE_OPIK_API_KEY=your_opik_api_key_here
VITE_OPIK_WORKSPACE=your_opik_workspace_here
```

Start the dev server:
```bash
npm run dev
```
