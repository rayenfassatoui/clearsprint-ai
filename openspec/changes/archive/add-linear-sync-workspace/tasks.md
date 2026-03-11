# Tasks

## 1. Remove Jira Infrastructure <!-- id: 0 -->

- [x] 1.1 Delete `lib/jira.ts`
- [x] 1.2 Delete entire `features/jira/` directory (actions, components, types)
- [x] 1.3 Remove Atlassian social provider from `lib/auth.ts` (remove `atlassian` from `socialProviders` and `trustedProviders`)
- [x] 1.4 Remove `jiraTokens` table from `lib/db/schema.ts`
- [x] 1.5 Remove `jiraProjectKey` column from `projects` table in `lib/db/schema.ts`
- [x] 1.6 Remove `jiraId` column from `tickets` table in `lib/db/schema.ts`
- [x] 1.7 Remove Jira-related types from `lib/types.ts` (`JiraResource`, `JiraProject`, `JiraIssueField`, `JiraIssueData`, `JiraIssueUpdateData`)
- [x] 1.8 Remove any Jira-related imports and components from `app/dashboard/` pages (project pages, integration page)
- [x] 1.9 Remove `@types/three`, `three`, `ogl`, `@paper-design/shaders-react` if unused elsewhere (audit first)
- [x] 1.10 Update `openspec/project.md` to remove all Jira references from Domain Context and External Dependencies
- [x] 1.11 Run `bun run build` to verify no broken imports remain

## 2. Install Dependencies & Configure Linear OAuth <!-- id: 1 -->

- [x] 2.1 Install packages: `bun add @linear/sdk ai @ai-sdk/openai`
- [x] 2.2 Register a Linear OAuth application at https://linear.app/settings/api/applications. Add `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, and `LINEAR_REDIRECT_URI` to `.env` and `.env.example`
- [x] 2.3 Add Linear social provider to `lib/auth.ts` using Better-auth's custom social provider API. Configure scopes: `read`, `write`, `issues:create`, `comments:create`. Store tokens in `account` table with `providerId: 'linear'`
- [x] 2.4 Create `lib/linear.ts` with a `getLinearClient(userId: string)` function that:
  - Fetches the user's Linear `access_token` from the `account` table
  - Checks expiration and refreshes if needed
  - Returns an initialized `LinearClient` from `@linear/sdk`
  - Handles token refresh using Linear's OAuth token endpoint
- [x] 2.5 Verify Linear OAuth flow works end-to-end: sign in, grant access, token stored, client can fetch user info
- [x] 2.6 Update `lib/auth-client.ts` to export the Linear sign-in method

## 3. Database Schema Migration <!-- id: 2 -->

- [x] 3.1 Add `workspace_projects` table to `lib/db/schema.ts`:
  ```typescript
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
  ```
- [x] 3.2 Add `workspace_tickets` table to `lib/db/schema.ts`:
  ```typescript
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
  ```
- [x] 3.3 Run `bun run db:push` to apply the new schema
- [x] 3.4 Add inferred types to `lib/types.ts`:
  ```typescript
  export type WorkspaceProject = InferSelectModel<typeof workspaceProjects>;
  export type WorkspaceTicket = InferSelectModel<typeof workspaceTickets>;
  ```

## 4. Scaffold `features/linear-sync/` Module <!-- id: 3 -->

- [x] 4.1 Create directory structure:
  ```
  features/linear-sync/
  +-- actions/
  |   +-- connect.server.ts       # Linear OAuth connect/disconnect actions
  |   +-- pull-sync.server.ts     # Pull issues from Linear -> workspace
  |   +-- push-sync.server.ts     # Push draft changes workspace -> Linear
  |   +-- workspace-crud.server.ts # Create/delete workspace projects
  |   +-- tickets.server.ts       # Manual ticket CRUD in workspace
  +-- components/
  |   +-- connect-linear-button.tsx
  |   +-- linear-project-picker.tsx
  |   +-- workspace-header.tsx
  |   +-- workspace-toolbar.tsx
  |   +-- workspace-list-view.tsx
  |   +-- workspace-kanban-view.tsx
  |   +-- workspace-ticket-card.tsx
  |   +-- ticket-detail-sheet.tsx
  |   +-- diff-review-modal.tsx
  |   +-- diff-field-viewer.tsx
  |   +-- sync-status-bar.tsx
  |   +-- ai-prompt-bar.tsx
  |   +-- bulk-select-toolbar.tsx
  +-- hooks/
  |   +-- use-workspace-tickets.ts
  |   +-- use-sync-status.ts
  |   +-- use-ai-edit.ts
  +-- types.ts                    # Feature-specific types and Zod schemas
  +-- utils/
      +-- hash.ts                 # Content hashing utility
      +-- diff.ts                 # Diff computation utility
      +-- batch.ts                # Concurrency-limited batch execution
  ```
- [x] 4.2 Define Zod schemas and TypeScript types in `features/linear-sync/types.ts`:
  - `LinearIssueData` (shape of issue data stored in `original_data`)
  - `TicketDraftData` (shape of local draft modifications)
  - `TicketUpdateSchema` (Zod schema for AI-generated ticket updates)
  - `TicketCreateSchema` (Zod schema for AI-generated new sub-issues)
  - `SyncStatusType` (the union enum)
  - `TicketDiff` (shape of a computed diff result)

## 5. Implement Linear Connection & Project Discovery <!-- id: 4 -->

- [x] 5.1 Build `connect.server.ts`:
  - `connectLinearAccount()`: Initiates OAuth flow (delegates to better-auth)
  - `disconnectLinearAccount(userId)`: Removes Linear account from DB
  - `getLinearConnectionStatus(userId)`: Returns whether user has a connected Linear account
- [x] 5.2 Build `workspace-crud.server.ts`:
  - `getLinearProjects(userId)`: Uses `getLinearClient` to fetch all teams and projects from Linear
  - `createWorkspaceProject(userId, linearProjectId, teamId, name, key)`: Creates a `workspace_projects` row
  - `deleteWorkspaceProject(userId, projectId)`: Deletes workspace project and cascades to tickets
  - `getWorkspaceProjects(userId)`: Lists all workspace projects for the user
- [x] 5.3 Build `ConnectLinearButton` component:
  - Shows "Connect Linear" with Linear logo if not connected
  - Shows "Connected" status badge with disconnect option if connected
- [x] 5.4 Build `LinearProjectPicker` component:
  - Searchable dropdown listing all Linear projects grouped by team
  - Each item shows project name, key, icon, and issue count
  - On selection, calls `createWorkspaceProject` and triggers initial pull sync

## 6. Implement Pull Sync Engine <!-- id: 5 -->

- [x] 6.1 Create `features/linear-sync/utils/hash.ts`:
  - `computeTicketHash(data: LinearIssueData): string`
  - Deterministic SHA-256 over: `title + '\n' + description + '\n' + statusName + '\n' + priority + '\n' + assigneeId + '\n' + sortedLabels.join(',')`
  - Use `crypto.subtle.digest` for hashing, return hex string
- [x] 6.2 Build `pull-sync.server.ts`:
  - `pullFromLinear(userId, workspaceProjectId)`:
    1. Get the Linear client for the user
    2. Fetch the workspace project to get `linearProjectId`
    3. Paginate through all issues in the project using `@linear/sdk` cursor pagination
    4. For each issue, normalize data into `LinearIssueData` shape
    5. Compute hash with `computeTicketHash`
    6. Upsert into `workspace_tickets`:
       - New issues: insert with `sync_status: 'synced'`
       - Existing issues with matching hash: skip
       - Existing issues with differing hash: update `original_data`, `original_hash`, set `sync_status: 'remote_updated'`
       - Local tickets not found in Linear: set `sync_status: 'remote_deleted'`
    7. Update `workspace_projects.lastSyncedAt`
    8. Return sync summary: `{ added: N, updated: N, deleted: N, unchanged: N }`
- [ ] 6.3 Write unit test for `computeTicketHash` (deterministic, consistent across identical inputs)
- [ ] 6.4 Write integration test for `pullFromLinear` with mocked Linear SDK responses

## 7. Build Workspace Views (List + Kanban) <!-- id: 6 -->

- [x] 7.1 Create app route `app/dashboard/workspace/[projectId]/page.tsx`:
  - Server component that fetches workspace project and tickets
  - Validates user owns the workspace project
  - Passes data to the client layout component
- [x] 7.2 Build `WorkspaceHeader` component:
  - Project name, Linear project link, last synced time
  - "Pull from Linear" and "Push to Linear" buttons
  - Change count badges
- [x] 7.3 Build `WorkspaceToolbar` component:
  - Toggle between List / Board views
  - Search input for filtering tickets by title/identifier
  - Filter dropdowns: by status, priority, sync status
  - "Select All" checkbox for bulk operations
  - "AI Edit Selected" button (appears when tickets are selected)
- [x] 7.4 Build `WorkspaceTicketCard` component:
  - Displays: identifier, title, status badge, priority icon, assignee avatar, labels
  - Visual indicators: "Draft" badge (modified), "New" badge (new_local), "Conflict" badge (remote_updated)
  - Checkbox for multi-select
  - Click to open detail sheet
- [x] 7.5 Build `WorkspaceListView` component:
  - Table/list layout with sortable columns
  - Groups by status with collapsible sections
  - Uses `WorkspaceTicketCard` in row format
- [x] 7.6 Build `WorkspaceKanbanView` component:
  - Columns per status (matching Linear workflow states)
  - Uses `@dnd-kit/core` and `@dnd-kit/sortable` (already in `package.json`)
  - Drag-and-drop between columns updates `draft_data.status` and sets `sync_status: 'modified'`
  - Empty state per column
- [x] 7.7 Build `TicketDetailSheet` component:
  - Slide-over panel (using shadcn/ui Sheet)
  - Editable fields: title, description (Markdown textarea), status dropdown, priority dropdown, assignee picker, labels multi-select
  - Shows original values from `original_data` in muted text beside each field when `draft_data` exists
  - AI prompt input at the bottom for single-ticket AI editing
  - Save button writes to `draft_data` via server action
- [x] 7.8 Build `SyncStatusBar` component:
  - Sticky bar at the bottom or top of the workspace
  - Shows: last sync time, N modified, N new, N failed
  - "Push to Linear" CTA with count badge
- [x] 7.9 Apply premium design system:
  - Dark mode support using existing `next-themes`
  - Glassmorphic card styling for ticket cards
  - Smooth hover transitions and micro-animations with Framer Motion
  - Professional color palette (avoid generic colors, use slate/zinc/neutral base with accent)
  - No emojis anywhere
  - Mobile-responsive layout

## 8. Implement AI Editing Integration <!-- id: 7 -->

- [x] 8.1 Create `app/api/ai/edit-ticket/route.ts`:
  - POST endpoint accepting `{ ticketData: LinearIssueData, prompt: string }`
  - Validates session via `auth.api.getSession`
  - Uses `generateObject` from AI SDK v6 with `@ai-sdk/openai` provider (model: `gpt-4o-mini`)
  - Schema: `TicketUpdateSchema` (Zod)
  - System prompt: "You are a senior project manager editing Linear tickets. Only modify the fields the user asks about. Return the complete updated ticket data."
  - Returns the structured update
- [x] 8.2 Create `app/api/ai/bulk-edit/route.ts`:
  - POST endpoint accepting `{ ticketIds: number[], prompt: string, workspaceProjectId: number }`
  - Fetches all specified tickets from DB
  - Iterates through each, calling `generateObject` individually
  - Streams progress updates back to the client using `StreamingTextResponse` or manual `ReadableStream`
  - Applies each successful update to `draft_data` in DB
  - Returns summary: `{ updated: N, failed: N, errors: [...] }`
- [x] 8.3 Create `app/api/ai/create-subtasks/route.ts`:
  - POST endpoint accepting `{ parentTicketId: number, prompt: string }`
  - Fetches parent ticket data for context
  - Uses `generateObject` with an array schema: `z.array(TicketCreateSchema)`
  - Creates new `workspace_tickets` rows with `sync_status: 'new_local'`
  - Returns the created tickets
- [x] 8.4 Build `AiPromptBar` component:
  - Text input with "Apply" button
  - Dropdown for operation type: "Edit this ticket", "Break into sub-tasks"
  - Loading state with streaming text animation during AI processing
  - Error display for failed AI calls
- [x] 8.5 Build `BulkSelectToolbar` component:
  - Appears when 1+ tickets are selected
  - Shows "N tickets selected"
  - "AI Edit All" button opens a prompt dialog
  - "Deselect All" button
  - Streaming progress indicator during bulk AI operations
- [x] 8.6 Create `hooks/use-ai-edit.ts`:
  - Encapsulates the fetch call to AI endpoints
  - Manages loading, streaming, error states
  - Optimistically updates local state while awaiting server confirmation

## 9. Implement Diff Review & Push Engine <!-- id: 8 -->

- [x] 9.1 Create `features/linear-sync/utils/diff.ts`:
  - `computeFieldDiff(original: LinearIssueData, draft: TicketDraftData): TicketDiff[]`
  - For text fields: word-level diff using a simple diffing algorithm (or integrate `diff` npm package if needed)
  - For enum fields: old value vs. new value
  - For arrays: added/removed items
  - Returns an array of `{ field, changeType, oldValue, newValue, diffHtml? }`
- [x] 9.2 Build `DiffReviewModal` component:
  - Full-screen modal opened via "Review Changes" button
  - Summary bar at top: "N modified | N new | N deleted"
  - Scrollable list of changed tickets, each showing:
    - Identifier, title, change type badge
    - Expandable accordion with field-level diffs via `DiffFieldViewer`
    - Checkbox to include/exclude from push
  - "Push All Approved" button at the bottom
  - "Cancel" button to close without pushing
- [x] 9.3 Build `DiffFieldViewer` component:
  - Shows a single field's diff
  - Text fields: inline diff with green highlights for additions, red strikethrough for deletions
  - Accessible: uses underline + icons in addition to color
  - Enum fields: "Status: Backlog -> In Progress" format
  - Array fields: chips with +/- indicators
- [x] 9.4 Build `push-sync.server.ts`:
  - `pushToLinear(userId, workspaceProjectId, ticketIds?: number[])`:
    1. Validate user session and workspace ownership
    2. Fetch all tickets with `sync_status` in `['modified', 'new_local']` (or only specified `ticketIds`)
    3. Sort: process `new_local` tickets without parents first, then `new_local` with parents, then `modified`
    4. For each ticket, execute the appropriate Linear SDK mutation:
       - `modified`: `linearClient.issueUpdate(linearIssueId, { ...draftFields })`
       - `new_local`: `linearClient.issueCreate({ ...draftFields, projectId, teamId })`
       - For children: use the parent's newly created `linearIssueId` as parentId
    5. Use `features/linear-sync/utils/batch.ts` for concurrency-limited execution (max 3 concurrent)
    6. On success per ticket: update `original_data` from draft, recompute `original_hash`, clear `draft_data`, set `sync_status: 'synced'`
    7. On failure per ticket: set `sync_status: 'push_failed'`, preserve `draft_data`
    8. Return summary: `{ pushed: N, failed: N, failures: [...] }`
- [x] 9.5 Create `features/linear-sync/utils/batch.ts`:
  - `batchExecute<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<PromiseSettledResult<T>[]>`
  - Simple concurrency pool using `Promise.allSettled` with a sliding window
- [x] 9.6 Wire up the "Push to Linear" button in `WorkspaceHeader` and `DiffReviewModal` to call `pushToLinear`
- [x] 9.7 Add optimistic UI: disable push button during push, show progress "Pushing N of M...", toast on completion

## 10. Integration Testing & Polish <!-- id: 9 -->

- [ ] 10.1 End-to-end manual test: Connect Linear -> Select project -> Pull tickets -> View in List and Kanban -> AI edit a single ticket -> AI bulk edit -> Create sub-issues with AI -> Review diff -> Push to Linear -> Verify on linear.app -> Re-pull and confirm no changes detected
- [ ] 10.2 Add error boundaries around workspace views for graceful failure handling
- [ ] 10.3 Add Suspense boundaries with skeleton loaders for ticket loading states
- [ ] 10.4 Add empty states for: no workspace projects, no tickets after sync, no changes to push
- [ ] 10.5 Polish animations: smooth sheet open/close, diff expand/collapse, push progress bar
- [ ] 10.6 Verify mobile responsiveness on all workspace views
- [ ] 10.7 Clean up the old `linear_sync_plan.md` file from the project root (it has been superseded by this OpenSpec change)
- [ ] 10.8 Update `openspec/project.md` to reflect the Linear pivot: update Purpose, Domain Context, External Dependencies, and Common Patterns sections
