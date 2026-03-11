---
description: Unify Linear Project import UI and fix ticket synchronization state refresh
---

# Change Proposal: Unify Linear Project Import UI and Fix Sync UI Reflection

## Problem Context
1. **Duplicate Buttons**: The Dashboard and Projects List pages currently display two buttons side-by-side: `LinearProjectPicker` and `CreateProjectDialog`. Since `CreateProjectDialog` already handles the Linear flow nicely, having two is confusing. The user requested one unified, primary-themed button called "Import Linear Project".
2. **Sync UI Reflection**: When a user clicks "Pull from Linear" in the workspace, the pull completes in the DB successfully, but the UI fails to show the tickets. The root cause is `WorkspaceClient` using `useState(initialTickets)` which doesn't synchronize when Next.js executes `router.refresh()`. The component maintains its stale `[]` state until a hard window refresh.

## Proposed Changes

### 1. Fix `WorkspaceClient` state synchronization
**File:** `features/linear-sync/components/workspace-client.tsx`
- **Change:** Add a `useEffect` hook that listens to changes in `initialTickets` and updates the local `tickets` state.
- **Why:** When `router.refresh()` fires after `pullFromLinear`, it re-fetches the server component and passes new `initialTickets` props, but the client component does not remount so `useState` ignores the new prop. `useEffect` will ensure the UI updates instantly.

### 2. Unify Import UI on Dashboard
**File:** `app/dashboard/page.tsx`
- **Change:** 
  - Remove the standalone inline `<LinearProjectPicker />`.
  - Update the trigger button inside `<CreateProjectDialog>` to read "Import Linear Project".
  - Change the button styling from plain to a premium, gorgeous AI theme matching our primary brand.
- **Why:** Centralizes the Linear project import into one clear, high-contrast action.

### 3. Unify Import UI on Projects List
**File:** `app/dashboard/projects-list/page.tsx`
- **Change:** Similar to the dashboard, remove the standalone `LinearProjectPicker` which duplicates the `NewProjectModal` action. Set `NewProjectModal` to be the sole entry point, perhaps passing it a styled "Import Linear Project" trigger to match.

## Implementation Plan
1. Edit `workspace-client.tsx` to add `useEffect(() => setTickets(initialTickets), [initialTickets])`.
2. Edit `app/dashboard/page.tsx` to clean up the duplicate elements and style the `CreateProjectDialog` trigger.
3. Edit `app/dashboard/projects-list/page.tsx` to clean up duplicate buttons.
4. Update `features/projects/components/new-project-modal.tsx` or similar if needed to conform to the new button title.
5. Lint, build, test the flow.
