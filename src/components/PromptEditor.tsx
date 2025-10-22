import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePrompt, useCreatePromptVersion } from '@/hooks/useAgents';
import type { Agent } from '@/lib/apiClient';
import {
  Loader2,
  FileText,
  AlertCircle,
  Upload,
  CheckCircle,
  XCircle,
  RotateCcw,
  Maximize2,
  X,
  Clock,
} from 'lucide-react';

interface PromptEditorProps {
  agent: Agent | null;
}

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function PromptEditor({ agent }: PromptEditorProps) {
  const { data: prompt, isLoading, error } = usePrompt(agent?.prompt_id || null);
  const createPromptVersion = useCreatePromptVersion();
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local storage key for this agent's prompt
  const localStorageKey = `prompt_${agent?.prompt_id || 'default'}`;

  useEffect(() => {
    if (prompt?.content) {
      setContent(prompt.content);
      setHasChanges(false);
      setAutosaveStatus('idle');
    }
  }, [prompt]);

  // Load from local storage on component mount
  useEffect(() => {
    if (agent?.prompt_id) {
      const savedContent = localStorage.getItem(localStorageKey);
      if (savedContent && savedContent !== (prompt?.content || '')) {
        setContent(savedContent);
        setHasChanges(true);
      }
    }
  }, [agent?.prompt_id, localStorageKey, prompt?.content]);

  // Debounced autosave function
  const autosave = useCallback(
    async (contentToSave: string) => {
      if (!agent?.prompt_id || !contentToSave.trim()) return;

      setAutosaveStatus('saving');

      try {
        localStorage.setItem(localStorageKey, contentToSave);
        setAutosaveStatus('saved');

        // Clear saved status after 2 seconds
        setTimeout(() => setAutosaveStatus('idle'), 2000);
      } catch (error) {
        setAutosaveStatus('error');
        setActionError('Failed to save locally');
        setTimeout(() => {
          setAutosaveStatus('idle');
          setActionError(null);
        }, 3000);
      }
    },
    [agent?.prompt_id, localStorageKey]
  );

  // Debounced autosave effect
  useEffect(() => {
    if (!agent?.prompt_id || content === (prompt?.content || '')) return;

    const timeoutId = setTimeout(() => {
      autosave(content);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [content, agent?.prompt_id, prompt?.content, autosave]);

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
      setHasChanges(false);
      setAutosaveStatus('idle');
      setActionError(null);
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
      setHasChanges(false);
      setAutosaveStatus('idle');
      setActionError(null);
    } catch {
      setActionError('Failed to reset local changes');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== (prompt?.content || ''));

    // Clear any previous action messages when user starts typing
    if (actionError) setActionError(null);
  };

  // Helper function to check if there are local changes
  const hasLocalChangesToReset = () => {
    if (!agent?.prompt_id) return false;
    const savedContent = localStorage.getItem(localStorageKey);
    return savedContent !== null && savedContent !== (prompt?.content || '');
  };

  // Helper function to render autosave status
  const renderAutosaveStatus = () => {
    switch (autosaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Saved locally</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <XCircle className="h-3 w-3" />
            <span>Save failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

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
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
            <div className="flex items-center gap-2">
              {renderAutosaveStatus()}
              {hasChanges && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Clock className="h-3 w-3" />
                  <span>Changes not saved to server</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      disabled={!agent?.prompt_id}
                      size="sm"
                      variant="ghost"
                      className="w-full sm:w-auto"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expand editor</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                    <p>Reset to server version</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
        {actionError && (
          <div className="mt-3">
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">{actionError}</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal for expanded editor */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prompt Editor - {agent.name}
                  {prompt?.version && ` (Version ${prompt.version})`}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Large editor view for better editing experience</p>
              </div>
              <Button onClick={() => setIsModalOpen(false)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex flex-col p-6 min-h-0">
              {/* Action buttons and status */}
              <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
                <div className="flex items-center gap-2">
                  {renderAutosaveStatus()}
                  {hasChanges && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      <span>Changes not saved to server</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleResetLocal}
                          disabled={!hasLocalChangesToReset() || !agent?.prompt_id}
                          size="sm"
                          variant="ghost"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset to Server
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reset to server version</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    onClick={handleCreateVersion}
                    disabled={!hasChanges || createPromptVersion.isPending || !agent?.prompt_id}
                    size="sm"
                    variant="default"
                  >
                    {createPromptVersion.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Version...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Create Version
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Large textarea */}
              <Textarea
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={agent?.prompt_id ? 'Enter prompt content...' : 'No prompt ID available for this agent'}
                className="flex-1 font-mono text-sm resize-none"
                disabled={!agent?.prompt_id}
              />

              {/* Status messages */}
              {actionError && (
                <div className="mt-4">
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{actionError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
              <Button onClick={() => setIsModalOpen(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
