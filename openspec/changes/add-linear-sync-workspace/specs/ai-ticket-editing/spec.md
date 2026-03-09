## ADDED Requirements

### Requirement: AI Single-Ticket Editing

The system SHALL allow users to select a single workspace ticket and prompt an AI agent to edit it. The AI SHALL use Vercel AI SDK v6 `generateObject` with a strict Zod schema to produce a structured ticket update (title, description, status, priority, labels). The AI output SHALL be applied to `draft_data` and the ticket SHALL be marked as `sync_status: 'modified'`.

#### Scenario: User prompts AI to improve a ticket description

- **WHEN** user opens a ticket detail sheet
- **AND** types a prompt like "Make this description more technical and add acceptance criteria"
- **AND** clicks "Apply AI Edit"
- **THEN** the system calls the AI API route with the ticket's current data and the user's prompt
- **AND** the AI returns a structured update conforming to the ticket Zod schema
- **AND** the update is applied to `draft_data`
- **AND** the ticket shows a "Draft (AI Edited)" badge
- **AND** the user can see the before/after diff inline

#### Scenario: AI returns malformed output

- **WHEN** the AI response does not conform to the Zod schema
- **THEN** the system SHALL display an error message: "AI response was invalid. Please try a different prompt."
- **AND** no changes SHALL be applied to `draft_data`

### Requirement: AI Bulk Ticket Editing

The system SHALL allow users to select multiple workspace tickets (or all tickets) and prompt the AI to update them in bulk. The AI SHALL process tickets in batches, streaming progress to the UI. Each ticket update SHALL be validated individually. Failed individual ticket updates SHALL not block the rest of the batch.

#### Scenario: User bulk-edits all tickets

- **WHEN** user selects "Edit All with AI" from the workspace toolbar
- **AND** types a prompt like "Rewrite all descriptions to be more concise and add story points estimates"
- **AND** clicks "Apply"
- **THEN** the system batches all tickets and sends them to the AI endpoint
- **AND** streams progress: "Updating ticket 3 of 45..."
- **AND** each successful update is applied to the respective ticket's `draft_data`
- **AND** tickets that fail validation are skipped and reported in a summary
- **AND** the UI updates in real-time as each ticket is processed

#### Scenario: User bulk-edits selected tickets

- **WHEN** user multi-selects 5 tickets using checkboxes
- **AND** types a prompt and clicks "Apply AI Edit"
- **THEN** only the 5 selected tickets are sent to the AI
- **AND** the same streaming progress and validation behavior applies

### Requirement: AI Sub-Issue Creation

The system SHALL allow the AI to create new sub-issues under existing workspace tickets. When the AI determines that a ticket should be broken down, it SHALL generate child tickets with appropriate titles, descriptions, and metadata. These children SHALL be created as `workspace_tickets` with `sync_status: 'new_local'` and a `parent_linear_identifier` linking them to the parent.

#### Scenario: AI breaks down a feature ticket into sub-tasks

- **WHEN** user prompts the AI with "Break this epic down into smaller technical tasks"
- **THEN** the AI generates multiple child ticket objects conforming to the Zod schema
- **AND** each child ticket is created as a new `workspace_tickets` row with `sync_status: 'new_local'`
- **AND** each child has its `parent_linear_identifier` set to the parent ticket's identifier
- **AND** the parent ticket's UI shows the new children nested beneath it
- **AND** the change summary updates to show "N new tickets to create"

### Requirement: AI API Route

The system SHALL provide API routes under `app/api/ai/` that use Vercel AI SDK v6 with `@ai-sdk/openai` as the provider. The routes SHALL:

- Accept a request body with ticket data, user prompt, and operation type (single edit, bulk edit, create children)
- Use `generateObject` for single-ticket structured edits
- Use `streamText` with tool calls for bulk operations and sub-issue creation
- Validate all AI outputs against Zod schemas before returning
- Enforce authentication via session validation

#### Scenario: AI endpoint processes a single edit request

- **WHEN** a POST request is sent to `/api/ai/edit-ticket`
- **WITH** body containing `{ ticketData, prompt, model?: string }`
- **THEN** the endpoint validates the session
- **AND** calls `generateObject` with the ticket data as context and the prompt as instruction
- **AND** validates the response against the `TicketUpdateSchema`
- **AND** returns the structured update

#### Scenario: AI endpoint processes a bulk edit request

- **WHEN** a POST request is sent to `/api/ai/bulk-edit`
- **WITH** body containing `{ ticketIds, prompt, workspaceProjectId }`
- **THEN** the endpoint fetches the tickets from the database
- **AND** processes each ticket sequentially using `generateObject`
- **AND** streams progress updates to the client
- **AND** returns a summary of successes and failures

### Requirement: AI Context Management

The AI SHALL receive sufficient context to make intelligent edits. For single-ticket edits, the context SHALL include the full ticket data plus the names and descriptions of sibling tickets for awareness. For bulk edits, the context SHALL include a summary of the project and the full list of ticket titles to understand the scope. The system SHALL truncate context if it exceeds model token limits.

#### Scenario: Context window management for large projects

- **WHEN** the total context (prompt + ticket data) exceeds 80% of the model's context window
- **THEN** the system SHALL truncate ticket descriptions to summaries (first 200 characters)
- **AND** include only titles and identifiers for sibling tickets
- **AND** log a warning for debugging purposes
