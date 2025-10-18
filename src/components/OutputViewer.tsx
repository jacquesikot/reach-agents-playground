import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AgentRunResult } from '@/lib/apiClient';
import { FileJson, Layout, CheckCircle, XCircle, Copy, Check } from 'lucide-react';

interface OutputViewerProps {
  result: AgentRunResult | null;
}

export function OutputViewer({ result }: OutputViewerProps) {
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;

    const textToCopy = JSON.stringify(result, null, 2);
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Output
          </CardTitle>
          <CardDescription>
            Run an agent to see the output here
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const renderPrettyView = () => {
    if (!result.success) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="font-medium text-destructive">Error</span>
          </div>
          <p className="text-sm bg-destructive/10 p-3 rounded-md text-destructive">
            {result.error || 'An unknown error occurred'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-600">Success</span>
        </div>

        {result.data && typeof result.data === 'object' ? (
          <div className="space-y-3">
            {Object.entries(result.data).map(([key, value]) => (
              <div key={key} className="border rounded-md p-3 space-y-1">
                <div className="text-sm font-medium text-muted-foreground">{key}</div>
                <div className="text-sm">
                  {typeof value === 'object' ? (
                    <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(value)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm">{String(result.data)}</div>
        )}
      </div>
    );
  };

  const renderRawView = () => {
    return (
      <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Output
            </CardTitle>
            <div className="flex items-center gap-2">
              {result.success ? (
                <Badge className="bg-green-600">Success</Badge>
              ) : (
                <Badge variant="destructive">Error</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'pretty' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pretty')}
                className="rounded-r-none"
              >
                <Layout className="h-4 w-4 mr-2" />
                Pretty
              </Button>
              <Button
                variant={viewMode === 'raw' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('raw')}
                className="rounded-l-none"
              >
                <FileJson className="h-4 w-4 mr-2" />
                Raw
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'pretty' ? renderPrettyView() : renderRawView()}
      </CardContent>
    </Card>
  );
}
