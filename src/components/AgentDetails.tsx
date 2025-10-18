import type { Agent } from '@/lib/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Settings } from 'lucide-react';

interface AgentDetailsProps {
  agent: Agent;
}

export function AgentDetails({ agent }: AgentDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>{agent.name}</CardTitle>
            </div>
            {agent.description && (
              <CardDescription>{agent.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {agent.model && (
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Model:</span>
              <Badge variant="secondary">{agent.model}</Badge>
            </div>
          )}

          {agent.capabilities && agent.capabilities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Capabilities:</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {agent.capabilities.map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {agent.endpoint && (
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium">Endpoint:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{agent.endpoint}</code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
