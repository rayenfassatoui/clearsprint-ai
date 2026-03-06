# Tasks

- [x] **Implement Stepped Loading for AI Generation** <!-- id: 0 -->
    - [x] Create `SteppedLoader` component with states (Analyzing, Drafting, Finalizing).
    - [x] Update `generateBacklog` action to support streaming or progress updates (or simulate steps on client if server streaming is too complex for now).
    - [x] Integrate into `CreateProjectDialog` (Actually `EmptyProjectState` via `GenerateButton`).

- [x] **Unify Jira Sync Terminology & UI** <!-- id: 1 -->
    - [x] Design `SyncStatusBadge` component (`ProjectHeaderSyncBadge`).
    - [x] Create `UnifiedSyncModal` that shows "Changes to Push", "Updates to Pull", and "Conflicts".
    - [x] Implement conflict resolution UI (User chooses Local vs Remote).
    - [x] Refactor `JiraIntegration` feature to use this new flow (Replaced old modals in page).

- [x] **Convert Ticket Edit Modal to Sheet** <!-- id: 2 -->
    - [x] Create `TicketDetailsSheet` component using `shadcn/ui` Sheet.
    - [x] Move logic from `GeneralAiEditDialog` to this sheet.
    - [x] Update `KanbanBoard` to open sheet on click.
    - [x] Refine `CreateTicketDialog` to be more modern/elegant (keep as modal).

- [x] **Add "Quick Filters" to Kanban Board** <!-- id: 3 -->
    - [x] Add search input (filter by title/description).
    - [x] Add type filter (Epic/Task/Subtask).
    - [x] Implement client-side filtering logic.
    - [x] Add filter state to `KanbanBoard` (Text Search, Epic).
    - [x] Implement filter logic in the render loop.
    - [x] Add UI controls for filters (Search Input, Epic Combobox).

- [x] **Implement Inline Editing for Card Titles** <!-- id: 4 -->
    - [x] Create `InlineEditableText` component.
    - [x] Integrate into `TicketCard`.
    - [x] Wire up to `updateTicket` server action.

- [x] **Add Keyboard Shortcuts** <!-- id: 5 -->
    - [x] Add `useKeyboardShortcuts` hook.
    - [x] Map keys (c, f, esc) to actions.
    - [x] Create `InlineEditableText` component.
    - [x] Integrate into `TicketCard`.
    - [x] Wire up to `updateTicket` server action.
    - [ ] Create `InlineEditableText` component.
    - [ ] Integrate into `TicketCard`.
    - [ ] Wire up to `updateTicket` server action.

- [ ] **Add Keyboard Shortcuts** <!-- id: 5 -->
    - [ ] Add `useKeyboardShortcuts` hook.
    - [ ] Map keys (c, f, esc) to actions.
