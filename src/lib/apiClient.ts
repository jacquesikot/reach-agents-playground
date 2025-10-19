import axios from 'axios';

// Agent API client
export const agentApi = axios.create({
  baseURL: '/api/internal',
  headers: {
    'content-type': 'application/json',
  },
});

// Opik API client - routed through Vite proxy to avoid CORS
export const opikApi = axios.create({
  baseURL: '/api/opik',
  headers: {
    'content-type': 'application/json',
  },
});

// Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  endpoint: string;
  capabilities?: string[];
  model_input_schema?: Record<string, unknown>;
  endpoint_params?: Record<string, unknown>;
  prompt_id?: string;
  playground_mode: boolean;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  version?: number;
}

export interface OpikPrompt {
  name: string;
  id: string;
  description: string;
  tags: string[];
  created_at: string;
  created_by: string;
  last_updated_at: string;
  last_updated_by: string;
  version_count: number;
  latest_version: {
    template: string;
    id: string;
    prompt_id: string;
    commit: string;
    metadata: Record<string, unknown>;
    type: string;
    change_description: string;
    variables: string[];
    created_at: string;
    created_by: string;
  };
}

export interface AgentRunInput {
  [key: string]: unknown;
}

export interface AgentRunResult {
  success: boolean;
  data?: unknown;
  error?: string;
  responseTime?: number; // Response time in milliseconds
}
