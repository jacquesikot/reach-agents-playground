import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePrompt, useCreatePromptVersion } from '@/hooks/useAgents';
import type { Agent } from '@/lib/apiClient';
import { Loader2, Save, FileText, AlertCircle, Upload, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface PromptEditorProps {
  agent: Agent | null;
}

export function PromptEditor({ agent }: PromptEditorProps) {
  const { data: prompt, isLoading, error } = usePrompt(agent?.prompt_id || null);
  const createPromptVersion = useCreatePromptVersion();
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [lastAction, setLastAction] = useState<'local' | 'version' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Local storage key for this agent's prompt
  const localStorageKey = `prompt_${agent?.prompt_id || 'default'}`;

  useEffect(() => {
    if (prompt?.content) {
      setContent(prompt.content);
      setHasChanges(false);
      setHasLocalChanges(false);
    }
  }, [prompt]);

  // Load from local storage on component mount
  useEffect(() => {
    if (agent?.prompt_id) {
      const savedContent = localStorage.getItem(localStorageKey);
      if (savedContent && savedContent !== (prompt?.content || '')) {
        setContent(savedContent);
        setHasLocalChanges(true);
      }
    }
  }, [agent?.prompt_id, localStorageKey, prompt?.content]);

  const handleSave = () => {
    if (!agent?.prompt_id) return;

    try {
      localStorage.setItem(localStorageKey, content);
      // Don't set hasLocalChanges to false here - keep it true since we have local changes
      setLastAction('local');
      setActionError(null);

      // Clear success message after 3 seconds
      setTimeout(() => setLastAction(null), 3000);
    } catch {
      setActionError('Failed to save to local storage');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleCreateVersion = async () => {
    if (!agent?.prompt_id || !prompt?.content) return;

    try {
      await createPromptVersion.mutateAsync({
        promptId: agent.prompt_id,
        template: content,
        oldTemplate: prompt.content,
      });

      // Clear local storage after successful version creation
      localStorage.removeItem(localStorageKey);
      setHasLocalChanges(false);
      setHasChanges(false);
      setLastAction('version');
      setActionError(null);

      // Clear success message after 5 seconds
      setTimeout(() => setLastAction(null), 5000);
    } catch (err) {
      console.error('Failed to create prompt version:', err);
      setActionError('Failed to create prompt version. Please try again.');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleResetLocal = () => {
    if (!agent?.prompt_id) return;

    try {
      // Remove from local storage
      localStorage.removeItem(localStorageKey);

      // Reset content to server version
      const serverContent = prompt?.content || '';
      setContent(serverContent);
      setHasLocalChanges(false);
      setHasChanges(serverContent !== (prompt?.content || ''));
      setActionError(null);

      // Clear any previous action messages
      if (lastAction) setLastAction(null);
    } catch {
      setActionError('Failed to reset local changes');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== (prompt?.content || ''));

    // Check if content differs from local storage
    const savedContent = localStorage.getItem(localStorageKey);
    setHasLocalChanges(value !== savedContent);

    // Clear any previous action messages when user starts typing
    if (lastAction) setLastAction(null);
    if (actionError) setActionError(null);
  };

  // Helper function to check if there are local changes
  const hasLocalChangesToReset = () => {
    if (!agent?.prompt_id) return false;
    const savedContent = localStorage.getItem(localStorageKey);
    return savedContent !== null && savedContent !== (prompt?.content || '');
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
        <div className="space-y-4">
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
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleResetLocal}
                    disabled={!hasLocalChangesToReset() || !agent?.prompt_id}
                    size="sm"
                    variant="ghost"
                    className="w-full sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset local changes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={handleSave}
              disabled={!hasLocalChanges || !agent?.prompt_id}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Button
              onClick={handleCreateVersion}
              disabled={!hasChanges || createPromptVersion.isPending || !agent?.prompt_id}
              size="sm"
              variant="default"
              className="w-full sm:w-auto"
            >
              {createPromptVersion.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Creating Version...</span>
                  <span className="sm:hidden">Creating...</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Create Version</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          </div>
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
        <div className="mt-3 space-y-2">
          {actionError && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">{actionError}</span>
            </div>
          )}
          {lastAction === 'local' && (
            <div className="flex items-start gap-2 text-xs text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">Successfully saved to local storage</span>
            </div>
          )}
          {lastAction === 'version' && (
            <div className="flex items-start gap-2 text-xs text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">Successfully created new prompt version</span>
            </div>
          )}
          {hasChanges && (
            <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-md">
              <span className="text-orange-500">⚠️</span>
              <span className="break-words">You have unsaved changes to the server version</span>
            </div>
          )}
          {hasLocalChanges && (
            <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
              <span className="text-blue-500">💾</span>
              <span className="break-words">You have unsaved changes in local storage</span>
            </div>
          )}
          {hasLocalChanges && hasChanges && (
            <div className="flex items-start gap-2 text-xs text-purple-600 bg-purple-50 p-2 rounded-md">
              <span className="text-purple-500">🔄</span>
              <span className="break-words">Both local and server versions have changes</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
