import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { AgentList } from '@/components/AgentList';
import { AgentDetails } from '@/components/AgentDetails';
import { InputForm } from '@/components/InputForm';
import { PromptEditor } from '@/components/PromptEditor';
import { OutputViewer } from '@/components/OutputViewer';
import { useAgents, useRunAgent } from '@/hooks/useAgents';
import { useHistory } from '@/hooks/useHistory';
import type { Agent, AgentRunInput, AgentRunResult } from '@/lib/apiClient';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export function Dashboard() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentResult, setCurrentResult] = useState<AgentRunResult | null>(null);

  const { data: agents = [], isLoading } = useAgents();
  const runAgent = useRunAgent();
  const { addToHistory, getAgentHistory } = useHistory();

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;

    const query = searchQuery.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query) ||
        agent.model?.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

  const handleRunAgent = async (inputs: AgentRunInput) => {
    if (!selectedAgent) return;

    setCurrentResult(null);

    const result = await runAgent.mutateAsync({
      agent: selectedAgent,
      inputs,
    });

    setCurrentResult(result);

    // Add to history
    addToHistory({
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      inputs,
      result,
    });
  };

  const agentHistory = selectedAgent ? getAgentHistory(selectedAgent.id) : [];

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Agent List */}
        <div className="w-80 border-r bg-muted/20">
          <AgentList
            agents={filteredAgents}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            loading={isLoading}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedAgent ? (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Agent Details */}
                <AgentDetails agent={selectedAgent} />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Prompt Editor */}
                  <div className="space-y-6">
                    <PromptEditor agent={selectedAgent} />

                    {/* History */}
                    {agentHistory.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <History className="h-4 w-4" />
                            Recent Runs
                          </CardTitle>
                          <CardDescription>
                            Last {agentHistory.length} run{agentHistory.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {agentHistory.slice(0, 5).map((entry) => (
                              <div key={entry.id} className="text-xs p-2 bg-muted rounded-md space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </span>
                                  <span className={entry.result.success ? 'text-green-600' : 'text-destructive'}>
                                    {entry.result.success ? 'Success' : 'Error'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Right Column - Input Form & Output */}
                  <div className="space-y-6">
                    <InputForm
                      schema={selectedAgent.endpoint_params}
                      onSubmit={handleRunAgent}
                      loading={runAgent.isPending}
                    />

                    <OutputViewer result={currentResult} />
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Select an agent from the sidebar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
