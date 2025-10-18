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
      return response.data.agents;
    },
  });
}

export function usePrompt(promptId: string | null) {
  return useQuery<Prompt>({
    queryKey: ['prompt', promptId],
    queryFn: async () => {
      if (!promptId) throw new Error('Prompt ID is required');

      try {
        // Fetch the specific prompt by ID
        const response = await opikApi.get(`/v1/private/prompts/${promptId}`);
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
        const baseURL = import.meta.env.VITE_AGENT_API_BASE_URL.replace('/api/internal', '');

        const response = await axios.post(`${baseURL}${agent.endpoint}`, inputs, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'content-type': 'application/json',
          },
        });

        return {
          success: true,
          data: response.data,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to run agent';
        return {
          success: false,
          error: errorMessage,
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
