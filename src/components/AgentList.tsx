import type { Agent } from '@/lib/apiClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, Loader2 } from 'lucide-react';

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  loading?: boolean;
}

export function AgentList({ agents, selectedAgent, onSelectAgent, loading }: AgentListProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No agents available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className={cn(
              'p-4 cursor-pointer transition-all hover:shadow-md',
              selectedAgent?.id === agent.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelectAgent(agent)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-sm leading-none">{agent.name}</h3>
                </div>
              </div>
              {agent.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {agent.description}
                </p>
              )}
              {agent.model && (
                <Badge variant="secondary" className="text-xs">
                  {agent.model}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
