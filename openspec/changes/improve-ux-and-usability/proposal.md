# Improve UX and Usability

## Summary
This proposal outlines a series of User Experience (UX) and User Interface (UI) improvements identified during an expert audit. The goal is to elevate the application from a functional MVP to a polished, professional product by addressing friction points in navigation, feedback loops, and interaction efficiency.

## Motivation
While the current application is functional, several areas negatively impact user confidence and efficiency:
1.  **"Black Box" AI Generation**: Users wait 10-30s without feedback during backlog creation.
2.  **Ambiguous Jira Sync**: Multiple modals and unclear directionality confuse users about the "Source of Truth".
3.  **"Modal Tunnel"**: Excessive nesting of dialogs prevents users from referencing context (the board) while editing.
4.  **Interaction Friction**: Lack of quick filters, inline editing, and keyboard shortcuts slows down power users.

## Proposed Solution
We will implement a set of prioritized improvements:

### 1. Stepped Loading for AI Generation (P0)
Replace the generic spinner with a "Stepped Loading" indicator that communicates progress (e.g., "Analyzing PRD...", "Drafting Epics...", "Finalizing...").

### 2. Unified Jira Sync UI (P0)
Consolidate `ImportJiraForm`, `SyncWithJiraModal`, and `PullFromJiraModal` into a single "Sync Status" indicator and management view that clearly shows directionality (Push vs. Pull) and pending changes.

### 3. Slide-over for Ticket Editing (P1)
Replace the `GeneralAiEditDialog` (and other edit modals) with a Sheet/Slide-over component. This allows users to maintain visual context of the Kanban board while editing ticket details.

### 4. Kanban Board Enhancements (P1, P2)
- **Quick Filters**: Add a filter bar for "My Tickets", "High Priority", etc.
- **Inline Editing**: Allow editing titles and story points directly on the card.
- **Empty States**: Add visual cues for empty columns.

### 5. Keyboard Shortcuts (P3)
Implement global shortcuts for common actions (Create, Search, Close).

## Risks
- **Complexity**: Unifying the Jira sync logic might require refactoring the underlying state management to track "diffs" more accurately.
- **Performance**: Inline editing needs to be optimistic to feel responsive.

## Alternatives Considered
- **Keep Modals**: Easier to implement but degrades UX significantly for heavy users.
- **Separate "Sync" Page**: Would remove the context of the project board; a unified modal/popover is better.
