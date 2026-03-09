## ADDED Requirements

### Requirement: Diff Computation Engine

The system SHALL compute a field-level diff between each ticket's `original_data` and `draft_data`. The diff SHALL identify changes to: title, description, status, priority, assignee, labels, and parent. For text fields (title, description), the diff SHALL show additions, deletions, and modifications at a line or word level. The diff result SHALL include a `changeType` categorization: `'unchanged'`, `'modified'`, `'new_local'`, `'remote_updated'`, `'remote_deleted'`.

#### Scenario: Diff computed for modified ticket

- **WHEN** a ticket has `sync_status: 'modified'` and both `original_data` and `draft_data` are present
- **THEN** the diff engine produces a field-by-field comparison
- **AND** text fields show word-level diffs with added/removed markers
- **AND** enum fields (status, priority) show the old and new values
- **AND** array fields (labels) show added and removed items

#### Scenario: Diff computed for new local ticket

- **WHEN** a ticket has `sync_status: 'new_local'`
- **THEN** the diff engine returns all fields as "added" with no original values

### Requirement: Diff Review UI

The system SHALL provide a "Review Changes" view that displays all tickets with pending changes. The view SHALL group tickets by change type: "Modified", "New", "Deleted on Remote". Each ticket SHALL be expandable to show a visual inline diff of each changed field. The diff SHALL use color coding (additions in green, deletions in red/strikethrough) with accessible alternatives (underline for additions, strikethrough for deletions, icons for each change type).

#### Scenario: User opens the diff review before push

- **WHEN** user clicks "Review Changes" in the workspace toolbar
- **THEN** a full-screen or large modal view appears
- **AND** shows a summary bar: "5 modified, 3 new, 1 deleted"
- **AND** lists all changed tickets grouped by change type
- **AND** each ticket is expandable to show field-level diffs
- **AND** the user can accept or reject individual ticket changes
- **AND** a "Push All Approved" button is prominently displayed

#### Scenario: User rejects a specific change

- **WHEN** user unchecks a ticket in the diff review
- **THEN** that ticket is excluded from the next push operation
- **AND** its `draft_data` is preserved for future review
- **AND** the push summary count updates to reflect the exclusion

### Requirement: Push Engine (Workspace to Linear)

The system SHALL provide a push operation that takes all approved workspace changes and applies them to the Linear project via the Linear API. The push engine SHALL:

- Update existing issues: map `draft_data` fields to Linear issue update mutations
- Create new issues: map `new_local` tickets to Linear issue create mutations, including parent relationships
- Handle sub-issue creation by first creating parent issues, then children (respecting dependency order)
- Batch operations with a concurrency limit of 3 to respect Linear API rate limits
- Report per-ticket success or failure
- On success: update `original_data` and `original_hash` to reflect the new state, clear `draft_data`, set `sync_status: 'synced'`
- On failure: set `sync_status: 'push_failed'` and preserve `draft_data`

#### Scenario: Successful push of modified tickets

- **WHEN** user clicks "Push to Linear" with 5 modified tickets approved
- **THEN** the system sends 5 update mutations to the Linear API
- **AND** shows a progress indicator: "Pushing 3 of 5..."
- **AND** on completion, all 5 tickets have `sync_status: 'synced'`, `draft_data: null`, and updated `original_hash`
- **AND** a success toast displays: "5 tickets pushed to Linear"

#### Scenario: Successful push of new local tickets

- **WHEN** user pushes 3 new local tickets, 1 of which is a child of another
- **THEN** the system creates the parent issue first
- **AND** uses the returned Linear issue ID to create the child issue with the correct parent
- **AND** all 3 tickets receive their `linear_issue_id` and `linear_identifier` from the API response
- **AND** `sync_status` is set to `'synced'`

#### Scenario: Partial push failure

- **WHEN** 2 of 5 tickets fail to push (e.g., due to a permission error)
- **THEN** the successfully pushed tickets are updated as normal
- **AND** the failed tickets retain `sync_status: 'push_failed'` and their `draft_data`
- **AND** the UI displays: "3 tickets pushed successfully. 2 failed." with error details for each failure
- **AND** the user can retry the failed tickets individually or in bulk

#### Scenario: Remote conflict detected during push

- **WHEN** user pushes a modified ticket
- **AND** the ticket's current hash on Linear differs from the stored `original_hash` (someone else edited it)
- **THEN** the system SHALL warn the user: "This ticket was updated on Linear since your last sync"
- **AND** offer options: "Force Push" (overwrite remote) or "Re-Pull" (fetch latest and re-apply)

### Requirement: Sync Status Dashboard

The workspace view SHALL display a persistent sync status bar showing: last sync time, number of tickets with pending changes, number of new local tickets, and any tickets in `push_failed` state. The bar SHALL include buttons for "Pull from Linear" and "Push to Linear".

#### Scenario: Sync status after edits

- **WHEN** the user has made edits to 3 tickets and created 2 new ones
- **THEN** the sync status bar shows: "Last synced: 2 minutes ago | 3 modified | 2 new | 0 failed"
- **AND** the "Push to Linear" button is enabled with a badge showing "5"
- **AND** the "Pull from Linear" button is always available
