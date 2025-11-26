export type SyncChangeType = 'create' | 'update' | 'delete' | 'soft_delete';

export interface SyncChange {
  id: string; // unique ID for the change (e.g., ticket ID or temp ID)
  ticketId: number;
  title: string;
  description?: string;
  changeType: SyncChangeType;
  jiraId?: string;
  diff?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface SyncPreview {
  changes: SyncChange[];
  summary: {
    toCreate: number;
    toUpdate: number;
    toDelete: number;
  };
}
