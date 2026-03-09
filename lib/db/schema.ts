import {
  boolean,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Better-Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

// App Specific Tables
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  name: text('name'),
  description: text('description'),
  docUrl: text('doc_url'),
  rawText: text('raw_text'),
});

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id),
  type: text('type').$type<'epic' | 'task' | 'subtask'>(),
  title: text('title'),
  description: text('description'),
  parentId: integer('parent_id'),
  orderIndex: integer('order_index'),
});

export const ticketHistory = pgTable('ticket_history', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => tickets.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').references(() => user.id),
  changeType: text('change_type').$type<
    'create' | 'update' | 'delete' | 'ai_tweak'
  >(),
  previousValue: json('previous_value'),
  newValue: json('new_value'),
  prompt: text('prompt'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workspaceProjects = pgTable('workspace_projects', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  linearProjectId: text('linear_project_id').notNull(),
  linearTeamId: text('linear_team_id').notNull(),
  linearProjectName: text('linear_project_name').notNull(),
  linearProjectKey: text('linear_project_key'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaceTickets = pgTable('workspace_tickets', {
  id: serial('id').primaryKey(),
  workspaceProjectId: integer('workspace_project_id')
    .notNull()
    .references(() => workspaceProjects.id, { onDelete: 'cascade' }),
  linearIssueId: text('linear_issue_id'), // null for new_local tickets
  linearIdentifier: text('linear_identifier'), // e.g., "PROJ-123"
  originalData: json('original_data'), // raw Linear issue snapshot
  originalHash: text('original_hash'), // SHA-256 of core fields
  draftData: json('draft_data'), // local modifications (null = no changes)
  syncStatus: text('sync_status')
    .$type<
      | 'synced'
      | 'modified'
      | 'new_local'
      | 'new_remote'
      | 'remote_updated'
      | 'remote_deleted'
      | 'push_failed'
    >()
    .notNull()
    .default('synced'),
  parentLinearIdentifier: text('parent_linear_identifier'), // for sub-issue linking
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
