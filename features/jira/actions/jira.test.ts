import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSyncPreview } from './jira.server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  tickets: {
    projectId: 'projectId',
    id: 'id',
  },
}));

vi.mock('@/lib/jira', () => ({
  getValidJiraToken: vi.fn(),
  getJiraIssues: vi.fn(),
  getJiraIssue: vi.fn(),
}));

// Import mocks to manipulate them
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getValidJiraToken, getJiraIssues, getJiraIssue } from '@/lib/jira';

describe('getSyncPreview', () => {
  const mockProjectId = 1;
  const mockCloudId = 'cloud-123';
  const mockJiraProjectKey = 'PROJ';

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful auth
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
    (getValidJiraToken as any).mockResolvedValue('token-123');
  });

  it('should identify tickets to create in Jira', async () => {
    // Mock DB tickets (Local)
    const mockDbTickets = [
      {
        id: 1,
        title: 'New Feature',
        description: 'Desc',
        jiraId: null,
        type: 'task',
      },
    ];
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockDbTickets),
      }),
    });

    // Mock Jira issues (Remote) - Empty for soft delete check
    (getJiraIssues as any).mockResolvedValue({ issues: [] });

    const result = await getSyncPreview(
      mockProjectId,
      mockCloudId,
      mockJiraProjectKey
    );

    expect(result.success).toBe(true);
    expect(result.preview?.changes).toHaveLength(1);
    expect(result.preview?.changes[0]).toMatchObject({
      changeType: 'create',
      title: 'New Feature',
    });
  });

  it('should identify tickets to update in Jira', async () => {
    // Mock DB tickets (Local) - Changed title
    const mockDbTickets = [
      {
        id: 1,
        title: 'Updated Feature',
        description: 'Desc',
        jiraId: 'JIRA-1',
        type: 'task',
      },
    ];
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockDbTickets),
      }),
    });

    // Mock Single Jira Issue (for update check)
    (getJiraIssue as any).mockResolvedValue({
      key: 'JIRA-1',
      fields: {
        summary: 'Old Feature',
        description: 'Desc',
        issuetype: { name: 'Task' },
      },
    });

    // Mock All Jira Issues (for soft delete check)
    (getJiraIssues as any).mockResolvedValue({ issues: [] });

    const result = await getSyncPreview(
      mockProjectId,
      mockCloudId,
      mockJiraProjectKey
    );

    expect(result.success).toBe(true);
    expect(result.preview?.changes).toHaveLength(1);
    expect(result.preview?.changes[0]).toMatchObject({
      changeType: 'update',
      title: 'Updated Feature',
      jiraId: 'JIRA-1',
    });
    expect(result.preview?.changes[0].diff).toContainEqual({
      field: 'title',
      oldValue: 'Old Feature',
      newValue: 'Updated Feature',
    });
  });

  it('should identify tickets to soft delete in Jira', async () => {
    // Mock DB tickets (Local) - Empty (deleted locally)
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    // Mock All Jira Issues (Remote) - Exists
    (getJiraIssues as any).mockResolvedValue({
      issues: [
        {
          key: 'JIRA-1',
          fields: {
            summary: 'Feature to Delete',
            description: 'Desc',
            issuetype: { name: 'Task' },
          },
        },
      ],
    });

    const result = await getSyncPreview(
      mockProjectId,
      mockCloudId,
      mockJiraProjectKey
    );

    expect(result.success).toBe(true);
    expect(result.preview?.changes).toHaveLength(1);
    expect(result.preview?.changes[0]).toMatchObject({
      changeType: 'soft_delete',
      jiraId: 'JIRA-1',
      title: 'Feature to Delete',
    });
  });

  it('should ignore tickets that are already synced', async () => {
    // Mock DB tickets (Local)
    const mockDbTickets = [
      {
        id: 1,
        title: 'Synced Feature',
        description: 'Desc',
        jiraId: 'JIRA-1',
        type: 'task',
      },
    ];
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockDbTickets),
      }),
    });

    // Mock Single Jira Issue (for update check)
    (getJiraIssue as any).mockResolvedValue({
      key: 'JIRA-1',
      fields: {
        summary: 'Synced Feature',
        description: 'Desc',
        issuetype: { name: 'Task' },
      },
    });

    // Mock All Jira Issues (for soft delete check)
    (getJiraIssues as any).mockResolvedValue({
      issues: [
        {
          key: 'JIRA-1',
          fields: {
            summary: 'Synced Feature',
            description: 'Desc',
            issuetype: { name: 'Task' },
          },
        },
      ],
    });

    const result = await getSyncPreview(
      mockProjectId,
      mockCloudId,
      mockJiraProjectKey
    );

    expect(result.success).toBe(true);
    expect(result.preview?.changes).toHaveLength(0);
  });
});
