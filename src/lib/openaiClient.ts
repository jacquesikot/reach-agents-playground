import OpenAI from 'openai';
import { opikApi } from './apiClient';

const openai = new OpenAI({
  apiKey:
    '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',
  dangerouslyAllowBrowser: true,
});

export interface PromptVersionRequest {
  name: string;
  version: {
    template: string;
    change_description: string;
  };
}

export async function createPromptVersion(promptId: string, template: string, changeDescription: string): Promise<any> {
  try {
    // First, get the prompt details to get the name
    const promptResponse = await opikApi.get(`/v1/private/prompts/${promptId}`);
    const promptName = promptResponse.data.name;

    // Then create a new version using the prompt name
    const response = await opikApi.post('/v1/private/prompts/versions', {
      name: promptName,
      version: {
        template,
        change_description: changeDescription,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create prompt version:', error);
    throw new Error(`Failed to create prompt version: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateChangeDescription(oldPrompt: string, newPrompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that analyzes prompt changes and creates concise, descriptive change summaries. Focus on the key differences and improvements made.',
        },
        {
          role: 'user',
          content: `Please analyze the changes between these two prompts and create a brief change description (2-3 lines max):

OLD PROMPT:
${oldPrompt}

NEW PROMPT:
${newPrompt}

Provide a concise description of what was changed or improved. Let the response follow a gihtub style commit message.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || 'Updated prompt content';
  } catch (error) {
    console.error('Failed to generate change description:', error);
    return 'Updated prompt content';
  }
}
