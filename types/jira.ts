// Jira API Types

export interface JiraResource {
  id: string;
  name: string;
  url: string;
  avatarUrl: string;
  scopes: string[];
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  projectTypeKey: string;
}

export interface JiraIssueField {
  type: string;
  content?: JiraIssueField[];
  text?: string;
  version?: number;
}

export interface JiraIssueData {
  fields: {
    project: { key: string };
    summary: string | null;
    description: {
      type: string;
      version: number;
      content: JiraIssueField[];
    };
    issuetype: { name: string };
    parent?: { key: string };
  };
}

export interface JiraIssueUpdateData {
  fields?: {
    summary?: string;
    description?: {
      type: string;
      version: number;
      content: JiraIssueField[];
    };
    status?: { name: string } | { id: string };
    assignee?: { accountId: string } | null;
    priority?: { name: string } | { id: string };
    labels?: string[];
    [key: string]: unknown;
  };
}
