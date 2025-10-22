import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi, opikApi } from '@/lib/apiClient';
import type { Agent, Prompt, OpikPrompt, AgentRunInput, AgentRunResult } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { createPromptVersion, generateChangeDescription } from '@/lib/openaiClient';
import axios from 'axios';

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await agentApi.get('/agents');
      return response.data.agents.filter((agent: Agent) => agent.playground_mode);
    },
  });
}

export function usePrompt(promptId: string | null) {
  return useQuery<Prompt>({
    queryKey: ['prompt', promptId],
    queryFn: async () => {
      if (!promptId) throw new Error('Prompt ID is required');

      try {
        // Fetch the specific prompt by ID with cache-busting timestamp
        const timestamp = Date.now();
        const response = await opikApi.get(`/v1/private/prompts/${promptId}?t=${timestamp}`);
        const prompt: OpikPrompt = response.data;

        return {
          id: prompt.id,
          name: prompt.name,
          content: prompt.latest_version.template,
          version: prompt.version_count,
        };
      } catch (error) {
        console.error('Failed to fetch prompt from Opik:', error);
        // Return default prompt structure on error
        return {
          id: promptId,
          name: `Prompt ${promptId}`,
          content: `# Prompt\n\nThis is a default prompt. Please edit it as needed.`,
          version: 1,
        };
      }
    },
    enabled: !!promptId,
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promptId, content }: { promptId: string; content: string }) => {
      try {
        // Update the prompt template in the latest version
        const response = await opikApi.put(`/v1/private/prompts/${promptId}`, {
          template: content,
        });
        return response.data;
      } catch (error) {
        console.error('Failed to update prompt in Opik:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompt', variables.promptId] });
    },
  });
}

export function useRunAgent() {
  const { session } = useAuth();

  return useMutation<AgentRunResult, Error, { agent: Agent; inputs: AgentRunInput }>({
    mutationFn: async ({ agent, inputs }) => {
      try {
        // Get the base URL and normalize it
        let baseURL = import.meta.env.VITE_AGENT_API_BASE_URL;

        // Remove /api/internal suffix if present
        baseURL = baseURL.replace(/\/api\/internal\/?$/, '');

        // Ensure the base URL doesn't end with a slash
        baseURL = baseURL.replace(/\/$/, '');

        // Ensure the endpoint starts with a slash and ends with a slash (to prevent 307 redirects)
        let endpoint = agent.endpoint.startsWith('/') ? agent.endpoint : `/${agent.endpoint}`;

        // Add trailing slash if not present (many APIs redirect without it)
        if (!endpoint.endsWith('/')) {
          endpoint = `${endpoint}/`;
        }

        // Construct the full URL
        const url = `${baseURL}${endpoint}`;

        console.log('Running agent:', {
          baseURL,
          endpoint,
          fullURL: url,
          agentName: agent.name,
          hasToken: !!session?.access_token,
        });

        const startTime = Date.now();

        const response = await axios.post(url, inputs, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'content-type': 'application/json',
            // 'X-Playground': 'true',
          },
          maxRedirects: 0, // Don't follow redirects, fail instead so we can see the issue
        });

        const responseTime = Date.now() - startTime;

        return {
          success: true,
          data: response.data,
          responseTime,
        };
      } catch (error: unknown) {
        console.error('Agent run error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to run agent';
        const responseTime =
          error instanceof Error && 'response' in error
            ? Date.now() -
              ((error as { response?: { config?: { startTime?: number } } }).response?.config?.startTime ?? 0)
            : 0;

        return {
          success: false,
          error: errorMessage,
          responseTime,
        };
      }
    },
  });
}

export function useCreatePromptVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      promptId,
      template,
      oldTemplate,
    }: {
      promptId: string;
      template: string;
      oldTemplate: string;
    }) => {
      try {
        // Generate change description using OpenAI
        const changeDescription = await generateChangeDescription(oldTemplate, template);

        // Create new prompt version
        const result = await createPromptVersion(promptId, template, changeDescription);
        return result;
      } catch (error) {
        console.error('Failed to create prompt version:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompt', variables.promptId] });
    },
  });
}
