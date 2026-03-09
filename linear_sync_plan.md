# Interpreted Feature Summary

ClearSprint AI is pivoting away from Jira to a native, Linear-only integration. The core problem being solved is the friction and manual effort required to manage, breakdown, and update project issues. By bringing Linear tickets into a dedicated, AI-native workspace, users can leverage autonomous agents to bulk-edit, refine descriptions, create sub-tasks, and reorganize work. The user reviews these changes locally in a Diff-enabled List or Kanban view and confidently pushes the batched updates back to Linear.

# Assumptions & Unknowns

**Assumptions:**

- We are using the Vercel AI SDK mapping to our existing Next.js 16 App Router architecture.
- Linear integration will be authenticated via OAuth or Personal Access Tokens provided by the user.
- Local tickets will retain the original Linear ID and a content hash to detect drift.
- The AI has enough context (via RAG or explicit inclusion) to make intelligent updates to tickets.
- Workspace data schema already exists or can be easily extended to support this "draft" issue state.

**Unknowns:**

- **Rate Limits:** Linear API rate limits when doing bulk pushes or fetching large projects.
- **Conflict Handling:** How to handle state where a ticket is updated on Linear _while_ it is being edited in the workspace. (Assumption: We will warn the user if the remote hash changes).
- **AI Context Window Limits:** Bulk reviewing 100+ tickets at once might exceed standard token limits; we may need a chunking strategy.

# Success Criteria

## User Success

- A user can seamlessly connect their Linear account and mirror a project in under 10 seconds.
- The AI can autonomously update 10+ tickets (e.g., rewriting descriptions, adding sub-issues) and present a clear, intuitive diff of the proposed changes.
- Pushing to Linear is one-click, deterministic, and provides immediate visual feedback on success.

## System / Business Success

- The syncing engine accurately detects changes using hashing without unnecessary API calls.
- AI operations execute reliably without timeouts or silent failures.
- No data loss on the Linear side (safe updates).

## Non-Goals

- We are intentionally abandoning Jira support. This is Linear only.
- Real-time websocket bi-directional syncing (the user explicitly triggers pull/push to maintain control).
- Highly complex merge conflict resolution (we will start with simple overwrite or rejection with warnings).

# UX Plan

## Primary Flow

1. **Onboarding:** User navigates to the Workspace, clicks "Connect Linear", and authorizes.
2. **Import:** User selects a Linear Project from a dropdown. The system fetches and maps tickets into the workspace.
3. **AI Interaction:** User selects tickets and types a prompt (e.g., "Break down these features into smaller technical tasks").
4. **Draft State:** The AI streams updates. The UI highlights modified tickets with a "Draft" badge.
5. **Review:** User toggles a "Diff View" to see before/after states for descriptions, assignees, and new sub-issues. They can view this as a List or a Kanban board.
6. **Push:** User clicks "Sync to Linear". A summary modal shows the operations (e.g., "Updating 5 tickets, creating 3"). User confirms.

## UI States & Edge Cases

- **Empty State:** High-polish empty state promoting the Linear connection with a subtle glowing button.
- **Loading State:** Skeleton loaders during initial sync. Streaming text indications when the AI is writing.
- **Error State:** Granular error boundaries if Linear API fails, or if a specific ticket fails to push.
- **Edge Case:** Ticket deleted on Linear but exists as a draft locally (Show a "Missing on Remote" badge).
- **Edge Case:** AI rate limits or context errors (Graceful fallback UI suggesting the user select fewer tickets).

## Accessibility

- Full keyboard navigation for the List and Kanban views.
- ARIA live regions for AI streaming updates so screen readers announce changes.
- High contrast "Diff" colors (avoiding relying solely on red/green for colorblind users; use strikethrough/underlines and icons).

# Technical Strategy (Conceptual)

- **Auth Layer:** Secure token storage for Linear API keys.
- **Database (Drizzle/Postgres):**
  - `linear_projects`: Maps user workspace to Linear project ID.
  - `workspace_tickets`: Stores localized tickets. Columns: `id`, `linear_id`, `original_hash`, `draft_data`, `sync_status`.
- **Syncing Engine:**
  - **Pull:** Fetch from Linear API, calculate a hash of the content. If hash differs from local `original_hash`, update local base state.
  - **Diff Calculation:** Frontend computes diffs between base state and `draft_data`.
  - **Push:** Transform `draft_data` back to Linear API GraphQL mutations. Update `original_hash` on success.
- **AI Layer:**
  - Utilize Vercel AI SDK (`streamText`, `generateObject`) for ticket updates.
  - Use structured outputs (`generateObject` with Zod schemas) to ensure the AI returns strictly formatted ticket metadata (title, description, assignee) so the UI doesn't break.
- **Feature-Driven Structure:** This will reside in `features/linear-sync/`.

# Risks & Tradeoffs

- **Risk:** AI Hallucinates ticket fields or links that don't exist.
  - **Mitigation:** Force structured outputs with Zod formatting. Validate against known Linear users/labels before showing the draft.
- **Risk:** Hashing mechanism becomes a bottleneck for large projects.
  - **Tradeoff:** We will only hash core fields (title, description, status, priority, assignee) rather than the entire GraphQL payload to save compute.
- **Risk:** Overwhelming the user with a massive diff.
  - **Mitigation:** Group diffs by "Modified", "Added", "Deleted" with collapsible accordions.

# Step-by-Step Implementation Plan

## Milestone 1: Linear Infrastructure & Core Sync

**Objective:** Establish Linear connection and basic one-way sync to the local database.

1. **Task:** Implement Linear OAuth / PAT connection and save credentials securely in the DB.
2. **Task:** Create the Drizzle schema for `linear_projects` and `workspace_tickets`.
3. **Task:** Implement a Server Action in `features/linear-sync/actions` to fetch a project's issues via Linear GraphQL API.
4. **Task:** Implement the hashing utility to compute a deterministic hash for an issue's state.
5. **Validation:** Write a unit test ensuring the hashing function is consistent. Verify tickets appear in the DB with correct Linear IDs.

## Milestone 2: Workspace View & State Management

**Objective:** Render the synced tickets in a highly polished List/Kanban UI.

1. **Task:** Build the `LinearProjectWorkspace` component (server component fetching initial data).
2. **Task:** Create the client-side state store (Zustand or React `useOptimistic`) to manage local drafts.
3. **Task:** Implement the List View and Kanban View components with toggles (using shadcn/ui and custom aesthetic styling).
4. **Validation:** Ensure dragging in Kanban updates local draft state without hitting the server yet.

## Milestone 3: AI Agent Integration

**Objective:** Introduce autonomous ticket editing via AI SDK.

1. **Task:** Build an API route `/api/tickets/generate` using Vercel AI SDK `generateObject` and defining a strict Zod schema for ticket updates.
2. **Task:** Create the UI for prompting the AI (e.g., a command bar or floating action button).
3. **Task:** Wire the AI response stream to update the local draft state in real-time.
4. **Validation:** Give the AI a prompt ("Make this description more technical") and verify the local draft state updates to show the new text.

## Milestone 4: Diffing & Push Engine

**Objective:** Show changes and sync them back to Linear.

1. **Task:** Build a `TicketDiff` component that visually compares the base state (original Linear) with the draft state.
2. **Task:** Implement the "Push to Linear" Server Action that iterates through draft tickets and executes Linear GraphQL mutations (UpdateIssue, CreateIssue).
3. **Task:** Build batching logic into the Server Action to handle rate limits (e.g., Promise.all with concurrency limits).
4. **Task:** Upon successful push, update the `original_hash` in the database and clear the draft state.
5. **Validation:** Edit a ticket locally, push, and verify the exact change appears on linear.app.

# Test & Validation Plan

### Automated Tests

- **Unit:** Test the content hashing functions.
- **Unit:** Test Zod schemas for AI structured outputs to handle missing or malformed AI responses.
- **Integration:** Mock the Linear API to test the push and pull Server Actions.

### Manual Verification

1. Connect a test Linear account with a scratch project.
2. Sync a list of 10 complex tickets.
3. Prompt the agent to rewrite the descriptions and create 5 sub-tickets.
4. Verify the Diff Viewer correctly highlights the added text and shows the 5 new tickets as "New".
5. Click Push.
6. Verify on Linear.app that exactly those changes occurred.
7. Click Sync again in the app; verify no new changes are detected (hashes match).

# Handoff Pack for Implementation Agents

- [x] Connect Linear Auth & DB Schema setup
- [x] Pull tickets and Hash execution
- [x] List & Kanban Workspace UI
- [x] AI generative editing integration (Strict Zod Schemas)
- [x] Visual Diff component
- [x] Push engine & conflict avoidance

**Assumptions to respect:**

- Use Next.js App Router and Server Actions.
- Place all domain logic into `features/linear-sync`.
- Prioritize high-end design, do NOT use generic unpolished components. Use the primary color sparingly and elegantly.
- No `any` types. Ensure strict TypeScript constraints.

**Definition of Done:**

- User can sync, edit via AI, review the diff visually, and push back to Linear without errors. UI handles loading and streaming effortlessly.

**Do NOT change without revisiting the plan:**

- The shift away from Jira. We are strictly building for Linear.
- The concept of the "Diff Draft State"; we must not auto-push to Linear without user validation in this initial version.
