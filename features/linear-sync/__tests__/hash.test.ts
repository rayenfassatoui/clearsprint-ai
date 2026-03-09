import { describe, it, expect } from 'vitest';
import { computeTicketHash } from '../utils/hash';
import type { LinearIssueData } from '../types';

describe('computeTicketHash', () => {
  it('should generate identical hashes for identical data', async () => {
    const issueData: LinearIssueData = {
      id: 'uuid-123',
      identifier: 'PROJ-123',
      title: 'Fix auth bug',
      description: 'The login page is broken',
      statusName: 'In Progress',
      priority: 2,
      assigneeId: 'user-456',
      labels: ['bug', 'auth'],
    };

    const hash1 = await computeTicketHash(issueData);
    const hash2 = await computeTicketHash({ ...issueData });

    expect(hash1).toBe(hash2);
  });

  it('should safely handle missing optional fields', async () => {
    const fullIssue: LinearIssueData = {
      id: 'uuid-1',
      identifier: 'PROJ-1',
      title: 'Missing description test',
      description: null,
      statusName: 'Todo',
      priority: 0,
      assigneeId: null,
      labels: [],
    };

    const emptyishIssue: LinearIssueData = {
      id: 'uuid-1',
      identifier: 'PROJ-1',
      title: 'Missing description test',
      description: '',
      statusName: 'Todo',
      priority: 0,
      assigneeId: '',
      labels: [],
    };

    const hash1 = await computeTicketHash(fullIssue);
    const hash2 = await computeTicketHash(emptyishIssue);

    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes when data changes', async () => {
    const baseIssue: LinearIssueData = {
      id: 'uuid-123',
      identifier: 'PROJ-123',
      title: 'Original Title',
      description: 'Original Description',
      statusName: 'Todo',
      priority: 1,
      assigneeId: null,
      labels: [],
    };

    const originalHash = await computeTicketHash(baseIssue);

    // Title change
    const titleHash = await computeTicketHash({
      ...baseIssue,
      title: 'Changed Title',
    });
    expect(titleHash).not.toBe(originalHash);

    // Status change
    const statusHash = await computeTicketHash({
      ...baseIssue,
      statusName: 'Done',
    });
    expect(statusHash).not.toBe(originalHash);

    // Priority change
    const priorityHash = await computeTicketHash({ ...baseIssue, priority: 2 });
    expect(priorityHash).not.toBe(originalHash);

    // Assignee change
    const assigneeHash = await computeTicketHash({
      ...baseIssue,
      assigneeId: 'user-789',
    });
    expect(assigneeHash).not.toBe(originalHash);
  });

  it('labels array order should not affect hash', async () => {
    const issueA: LinearIssueData = {
      id: 'uuid-1',
      identifier: 'PROJ-1',
      title: 'Test',
      description: 'Test',
      statusName: 'Todo',
      priority: 1,
      assigneeId: null,
      labels: ['b', 'a', 'c'],
    };

    const issueB: LinearIssueData = {
      ...issueA,
      labels: ['a', 'b', 'c'],
    };

    const hash1 = await computeTicketHash(issueA);
    const hash2 = await computeTicketHash(issueB);

    expect(hash1).toBe(hash2);
  });
});
