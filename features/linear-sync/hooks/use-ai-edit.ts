import { useState, useCallback } from 'react';
import type { TicketDraftData, LinearIssueData } from '../types';
import type { WorkspaceTicket } from '@/lib/types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

export function useAiEdit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editSingleTicket = useCallback(
    async (
      ticketData: LinearIssueData,
      prompt: string,
    ): Promise<TicketDraftData | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/edit-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketData, prompt }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error || `HTTP ${res.status}`,
          );
        }
        const data = await res.json();
        return (data.data as TicketDraftData) ?? null;
      } catch (err) {
        setError(getErrorMessage(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createSubtasks = useCallback(
    async (
      parentTicketId: number,
      prompt: string,
    ): Promise<WorkspaceTicket[]> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/create-subtasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentTicketId, prompt }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error || `HTTP ${res.status}`,
          );
        }
        const data = await res.json();
        return (data.data as WorkspaceTicket[]) ?? [];
      } catch (err) {
        setError(getErrorMessage(err));
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    editSingleTicket,
    createSubtasks,
  };
}
