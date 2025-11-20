'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateJiraIssueAction } from '@/actions/jira.server';

interface UpdateIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cloudId: string;
  issueKey: string;
  currentSummary: string;
  currentDescription?: string;
  onSuccess?: () => void;
}

export function UpdateJiraIssueDialog({
  open,
  onOpenChange,
  cloudId,
  issueKey,
  currentSummary,
  currentDescription,
  onSuccess,
}: UpdateIssueDialogProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(currentSummary);
  const [description, setDescription] = useState(currentDescription || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        fields: {},
      };

      // Only update fields that changed
      if (summary !== currentSummary) {
        updateData.fields.summary = summary;
      }

      if (description !== currentDescription) {
        updateData.fields.description = {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: description,
                },
              ],
            },
          ],
        };
      }

      // If no fields changed, just close
      if (Object.keys(updateData.fields).length === 0) {
        toast.info('No changes to save');
        onOpenChange(false);
        return;
      }

      const result = await updateJiraIssueAction(cloudId, issueKey, updateData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Issue updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to update issue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Issue</DialogTitle>
            <DialogDescription>
              Update the details for {issueKey}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Issue summary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Issue description"
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
