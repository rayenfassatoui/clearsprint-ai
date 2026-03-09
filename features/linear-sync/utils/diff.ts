import type { LinearIssueData, TicketDraftData, TicketDiff } from '../types';

// Human-readable field labels for display in the diff viewer
export const DIFF_FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  statusName: 'Status',
  priority: 'Priority',
  assigneeName: 'Assignee',
  labels: 'Labels',
  estimate: 'Estimate',
  dueDate: 'Due Date',
  parentIdentifier: 'Parent Issue',
};

/**
 * Computes a detailed property-by-property visual diff between the original
 * Linear data and the local draft data.
 *
 * For new_local tickets (isNewLocal=true), all draft fields are shown as "added".
 * For existing tickets, only fields that actually differ are included.
 */
export function computeVisualDiff(
  originalData: LinearIssueData | null,
  draftData: TicketDraftData | null,
  isNewLocal = false,
): TicketDiff[] {
  if (!draftData) return [];

  const diffs: TicketDiff[] = [];

  if (isNewLocal) {
    // For new local tickets: show every present draft field as "added"
    const fields: (keyof TicketDraftData)[] = [
      'title',
      'description',
      'statusName',
      'priority',
      'assigneeName',
      'estimate',
      'dueDate',
      'parentIdentifier',
    ];
    for (const field of fields) {
      const val = draftData[field];
      if (val !== undefined && val !== null && val !== '') {
        diffs.push({
          field,
          changeType: 'added',
          oldValue: null,
          newValue: val,
        });
      }
    }
    if (draftData.labels && draftData.labels.length > 0) {
      diffs.push({
        field: 'labels',
        changeType: 'added',
        oldValue: [],
        newValue: draftData.labels,
      });
    }
    return diffs;
  }

  // Scalar field comparison
  const scalarFields: Array<{
    draft: keyof TicketDraftData;
    orig: keyof LinearIssueData;
  }> = [
    { draft: 'title', orig: 'title' },
    { draft: 'description', orig: 'description' },
    { draft: 'statusName', orig: 'statusName' },
    { draft: 'priority', orig: 'priority' },
    { draft: 'assigneeName', orig: 'assigneeName' },
    { draft: 'estimate', orig: 'estimate' },
    { draft: 'dueDate', orig: 'dueDate' },
    { draft: 'parentIdentifier', orig: 'parentIdentifier' },
  ];

  for (const { draft: draftKey, orig: origKey } of scalarFields) {
    if (draftData[draftKey] !== undefined) {
      const oldVal = originalData ? (originalData[origKey] ?? null) : null;
      const newVal = draftData[draftKey] ?? null;
      if (oldVal !== newVal) {
        diffs.push({
          field: draftKey,
          changeType:
            oldVal === null
              ? 'added'
              : newVal === null
                ? 'removed'
                : 'modified',
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }
  }

  // Label comparison (array — use Set-based equality on names)
  if (draftData.labels !== undefined) {
    const oldSet = new Set(originalData?.labels ?? []);
    const newSet = new Set(draftData.labels);
    const equal =
      oldSet.size === newSet.size && [...oldSet].every((v) => newSet.has(v));
    if (!equal) {
      diffs.push({
        field: 'labels',
        changeType: 'modified',
        oldValue: [...(originalData?.labels ?? [])].sort(),
        newValue: [...draftData.labels].sort(),
      });
    }
  }

  return diffs;
}
