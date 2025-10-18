import { useState, useEffect } from 'react';
import type { AgentRunInput, AgentRunResult } from '@/lib/apiClient';

export interface HistoryEntry {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: number;
  inputs: AgentRunInput;
  result: AgentRunResult;
}

const HISTORY_KEY = 'agent-playground-history';
const MAX_HISTORY = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  const addToHistory = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const getAgentHistory = (agentId: string) => {
    return history.filter((entry) => entry.agentId === agentId);
  };

  return {
    history,
    addToHistory,
    clearHistory,
    getAgentHistory,
  };
}
