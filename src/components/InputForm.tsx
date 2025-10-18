import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { AgentRunInput } from '@/lib/apiClient';
import { Play } from 'lucide-react';

interface SchemaProperty {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

interface Schema {
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

interface InputFormProps {
  schema?: Schema;
  onSubmit: (inputs: AgentRunInput) => void;
  loading?: boolean;
}

export function InputForm({ schema, onSubmit, loading }: InputFormProps) {
  const [inputs, setInputs] = useState<AgentRunInput>({});

  useEffect(() => {
    // Initialize form with default values from schema
    if (schema?.properties) {
      const initialValues: AgentRunInput = {};
      Object.entries(schema.properties).forEach(([key, prop]: [string, SchemaProperty]) => {
        initialValues[key] = prop.default || '';
      });
      setInputs(initialValues);
    }
  }, [schema]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  const handleChange = (key: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  if (!schema?.properties) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Inputs</CardTitle>
          <CardDescription>No input schema defined for this agent</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => onSubmit({})} disabled={loading}>
            <Play className="mr-2 h-4 w-4" />
            {loading ? 'Running...' : 'Run Agent'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const properties = schema.properties;
  const required = schema.required || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Inputs</CardTitle>
        <CardDescription>Configure the inputs for running this agent</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(properties).map(([key, prop]: [string, SchemaProperty]) => {
            const isRequired = required.includes(key);
            const fieldType = prop.type || 'string';

            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {prop.title || key}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {prop.description && <p className="text-xs text-muted-foreground">{prop.description}</p>}

                {fieldType === 'string' && prop.format === 'textarea' ? (
                  <Textarea
                    id={key}
                    value={(inputs[key] as string) || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={prop.placeholder || `Enter ${key}`}
                    required={isRequired}
                    disabled={loading}
                    rows={4}
                  />
                ) : fieldType === 'number' || fieldType === 'integer' ? (
                  <Input
                    id={key}
                    type="number"
                    value={(inputs[key] as string | number) || ''}
                    onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                    placeholder={prop.placeholder || `Enter ${key}`}
                    required={isRequired}
                    disabled={loading}
                    min={prop.minimum}
                    max={prop.maximum}
                  />
                ) : fieldType === 'boolean' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      id={key}
                      type="checkbox"
                      checked={(inputs[key] as boolean) || false}
                      onChange={(e) => handleChange(key, e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4"
                    />
                    <label htmlFor={key} className="text-sm">
                      {prop.title || key}
                    </label>
                  </div>
                ) : (
                  <Input
                    id={key}
                    type="text"
                    value={(inputs[key] as string) || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={prop.placeholder || `Enter ${key}`}
                    required={isRequired}
                    disabled={loading}
                  />
                )}
              </div>
            );
          })}

          <Button type="submit" disabled={loading} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            {loading ? 'Running Agent...' : 'Run Agent'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
