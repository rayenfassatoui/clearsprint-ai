## ADDED Requirements

### Requirement: Workspace Project Creation

The system SHALL allow users to create a workspace project linked to a specific Linear project. Upon creation, the system SHALL store the Linear project ID, team ID, project key, and project name in the `workspace_projects` table. Each user MAY have multiple workspace projects, each linked to a different Linear project.

#### Scenario: User creates workspace from Linear project

- **WHEN** user selects a Linear project from the project discovery list
- **AND** clicks "Create Workspace"
- **THEN** the system creates a `workspace_projects` row with the Linear project metadata
- **AND** immediately initiates the first pull sync
- **AND** redirects the user to the new workspace view at `/dashboard/workspace/[projectId]`

### Requirement: Pull Sync (Linear to Workspace)

The system SHALL fetch all issues from the linked Linear project and store them as `workspace_tickets` rows. Each workspace ticket SHALL contain: the Linear issue ID, identifier (e.g., "PROJ-123"), title, description (as Markdown), status, priority, assignee ID, labels, parent issue ID (for sub-issues), and a computed `original_hash` of these fields. The system SHALL also store the raw Linear data as `original_data` (JSONB) for reference.

#### Scenario: Initial pull sync

- **WHEN** a workspace project is created
- **THEN** the system fetches all issues from the Linear project
- **AND** creates a `workspace_tickets` row for each issue with `sync_status: 'synced'`
- **AND** computes and stores the `original_hash` for each ticket
- **AND** sets `draft_data` to `null` (no local changes yet)
- **AND** displays a progress indicator showing "Syncing X of Y tickets..."

#### Scenario: Re-pull sync (refresh from Linear)

- **WHEN** user clicks "Pull from Linear" on an existing workspace
- **THEN** the system re-fetches all issues from Linear
- **AND** for each issue:
  - If it exists locally and hash matches: no change
  - If it exists locally but hash differs: update `original_data` and `original_hash`, flag as `sync_status: 'remote_updated'`
  - If it exists locally but not on Linear: flag as `sync_status: 'remote_deleted'`
  - If it exists on Linear but not locally: create new workspace ticket with `sync_status: 'new_remote'`
- **AND** the system SHALL NOT overwrite `draft_data` during a re-pull

#### Scenario: Pull sync with large project

- **WHEN** the Linear project has 200+ issues
- **THEN** the system paginates through all issues using cursor-based pagination
- **AND** shows a progress bar with count (e.g., "Pulled 150 of 230 tickets")
- **AND** completes within a reasonable timeframe (under 30 seconds for 500 tickets)

### Requirement: Workspace Ticket Schema

The `workspace_tickets` table SHALL have the following columns:

- `id` (serial, primary key)
- `workspace_project_id` (integer, FK to `workspace_projects.id`)
- `linear_issue_id` (text, the Linear issue UUID)
- `linear_identifier` (text, e.g., "PROJ-123")
- `original_data` (jsonb, the raw Linear issue data at last sync)
- `original_hash` (text, SHA-256 hash of core fields from `original_data`)
- `draft_data` (jsonb, nullable, the locally modified version of the ticket)
- `sync_status` (text, enum: 'synced' | 'modified' | 'new_local' | 'new_remote' | 'remote_updated' | 'remote_deleted' | 'push_failed')
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Scenario: Ticket data integrity

- **WHEN** a workspace ticket is created from a Linear issue
- **THEN** `original_data` SHALL contain the full Linear issue payload
- **AND** `original_hash` SHALL be a SHA-256 hash of: title + description + status.name + priority + assigneeId + sorted(labels)
- **AND** `draft_data` SHALL be `null`
- **AND** `sync_status` SHALL be `'synced'`

### Requirement: Workspace List View

The system SHALL display workspace tickets in a sortable, filterable list view similar to Linear's list view. Each row SHALL show: identifier, title, status badge, priority icon, assignee avatar, labels, and a "Modified" indicator if `draft_data` differs from `original_data`. The list SHALL support grouping by status, priority, or assignee.

#### Scenario: User views workspace tickets in list mode

- **WHEN** user navigates to the workspace view
- **AND** the "List" toggle is selected
- **THEN** tickets are displayed in a table/list with columns for identifier, title, status, priority, assignee, and labels
- **AND** tickets with `draft_data` show a visual "Draft" badge
- **AND** the list is sortable by any column
- **AND** the list supports text search filtering

### Requirement: Workspace Kanban View

The system SHALL display workspace tickets in a Kanban board view grouped by status columns. Each card SHALL show the identifier, title, priority icon, assignee avatar, and a "Modified" indicator. Users SHALL be able to drag cards between status columns to update the draft status.

#### Scenario: User views workspace tickets in Kanban mode

- **WHEN** user navigates to the workspace view
- **AND** the "Board" toggle is selected
- **THEN** tickets are displayed in a Kanban board with columns per Linear workflow status
- **AND** each card shows identifier, title, priority, assignee
- **AND** dragging a card to a new column updates `draft_data.status` and sets `sync_status: 'modified'`

#### Scenario: Empty status column

- **WHEN** a status column has no tickets
- **THEN** the column SHALL display an empty state placeholder with the status name
- **AND** the column SHALL accept dropped cards

### Requirement: Manual Ticket Editing

Users SHALL be able to click on any workspace ticket to open a detail sheet/panel. The sheet SHALL allow editing title, description (rich text / Markdown), status, priority, assignee, and labels. All manual edits SHALL be written to `draft_data` and the `sync_status` SHALL be set to `'modified'`. The original Linear data SHALL remain visible for comparison.

#### Scenario: User manually edits a ticket

- **WHEN** user clicks on a ticket in the list or kanban view
- **THEN** a slide-over sheet opens showing the ticket details
- **AND** all fields are editable
- **AND** upon saving, the changes are written to `draft_data`
- **AND** `sync_status` is set to `'modified'`
- **AND** the original values from `original_data` are shown alongside for reference

### Requirement: Create Local Tickets

Users SHALL be able to create new tickets locally in the workspace. These tickets SHALL have `sync_status: 'new_local'` and no `linear_issue_id`. Upon push, they SHALL be created as new issues in the Linear project.

#### Scenario: User creates a new local ticket

- **WHEN** user clicks "Create Ticket" in the workspace
- **THEN** a dialog opens for entering title, description, type, status, priority, assignee, labels, and optional parent ticket
- **AND** upon submission, a new `workspace_tickets` row is created with `sync_status: 'new_local'`
- **AND** the ticket appears in the list/kanban view with a "New" badge
