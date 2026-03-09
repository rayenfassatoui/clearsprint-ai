import type { LinearIssueData } from '../types';

/**
 * Computes a deterministic SHA-256 hash representing a ticket's full data.
 * Used to detect if a remote issue has been modified since the last pull.
 * All fields that we track are included so any remote change is detected.
 */
export async function computeTicketHash(
  data: LinearIssueData,
): Promise<string> {
  const sortedLabels = [...(data.labelIds || [])].sort();
  const sortedSubscribers = [...(data.subscriberIds || [])].sort();
  const sortedChildren = [...(data.childIdentifiers || [])].sort();

  const hashString = [
    `ID:${data.identifier}`,
    `TITLE:${data.title}`,
    `DESC:${data.description ?? ''}`,
    `STATUS:${data.statusId}`,
    `PRIORITY:${data.priority}`,
    `ASSIGNEE:${data.assigneeId ?? ''}`,
    `LABELS:${sortedLabels.join(',')}`,
    `ESTIMATE:${data.estimate ?? ''}`,
    `DUE:${data.dueDate ?? ''}`,
    `PARENT:${data.parentId ?? ''}`,
    `CHILDREN:${sortedChildren.join(',')}`,
    `SUBS:${sortedSubscribers.join(',')}`,
  ].join('|');

  const utf8 = new TextEncoder().encode(hashString);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
