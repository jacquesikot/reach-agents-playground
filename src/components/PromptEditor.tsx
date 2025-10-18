import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { usePrompt, useUpdatePrompt } from '@/hooks/useAgents';
import type { Agent } from '@/lib/apiClient';
import { Loader2, Save, FileText, AlertCircle } from 'lucide-react';

interface PromptEditorProps {
  agent: Agent | null;
}

export function PromptEditor({ agent }: PromptEditorProps) {
  const { data: prompt, isLoading, error } = usePrompt(agent?.prompt_id || null);
  const updatePrompt = useUpdatePrompt();
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (prompt?.content) {
      setContent(prompt.content);
      setHasChanges(false);
    }
  }, [prompt]);

  const handleSave = async () => {
    if (!agent?.prompt_id) return;

    try {
      await updatePrompt.mutateAsync({ promptId: agent.prompt_id, content });
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save prompt:', err);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== (prompt?.content || ''));
  };

  if (!agent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prompt Editor
          </CardTitle>
          <CardDescription>Select an agent to view and edit its prompt</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prompt Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prompt Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              {!agent?.prompt_id
                ? "This agent doesn't have a prompt ID configured. Please ensure the agent has a prompt_id field."
                : 'No prompt found for this agent. A default prompt will be created when you start editing.'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prompt Editor
            </CardTitle>
            <CardDescription>
              Edit the prompt for this agent
              {prompt?.version && ` (Version ${prompt.version})`}
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || updatePrompt.isPending || !agent?.prompt_id} size="sm">
            {updatePrompt.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={agent?.prompt_id ? 'Enter prompt content...' : 'No prompt ID available for this agent'}
          className="min-h-[300px] font-mono text-sm"
          disabled={!agent?.prompt_id}
        />
        {hasChanges && <p className="text-xs text-muted-foreground mt-2">You have unsaved changes</p>}
      </CardContent>
    </Card>
  );
}
