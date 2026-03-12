---
description: Comprehensive 10-Point End-to-End Testing Plan for ClearSprint AI Core Features
---

# ClearSprint AI — Comprehensive Testing Plan

To ensure all core features of the Linear sync engine and AI features are working perfectly, please follow this 10-point checklist. This covers every major interaction from sign-in to AI bulk generation.

## Test 1: Authentication & Settings Access
- [ ] **Action:** Go to `/auth/signin` and log in with email/password. Navigate to `/dashboard/settings`.
- [ ] **Verify:** The Settings page renders correctly without layout shifts.
- [ ] **Verify:** Linear connection status accurately reflects whether an OAuth token is stored for your account.

## Test 2: Linear Integration Connection
- [ ] **Action:** Disconnect Linear (if connected) and click "Connect Linear". 
- [ ] **Verify:** You are redirected to the Linear OAuth approval screen.
- [ ] **Verify:** Upon approval, you are returned to `/dashboard` instantly with no errors (verifying the PKCE fix).

## Test 3: Project Import Flow
- [ ] **Action:** On the Dashboard, click the large "Import Linear Project" button.
- [ ] **Verify:** A modal opens displaying the Linear projects you have access to.
- [ ] **Verify:** Clicking a project redirects you to `/dashboard/workspace/[id]` and initiates the initial pull.

## Test 4: Workspace Initial Load & Pull Sync
- [ ] **Action:** Wait for the workspace skeleton loader to finish.
- [ ] **Verify:** The Kanban and List views populate with all tickets from the Linear project.
- [ ] **Verify:** Complex fields (assignee avatars, labels as pills, status indicators) map over correctly.
- [ ] **Verify:** Clicking the "Pull from Linear" refresh button updates the dashboard instantly without requiring a hard refresh (verifying the `useEffect` sync fix).

## Test 5: Kanban & List UI Switching
- [ ] **Action:** Toggle between Kanban and List views using the top-right View switcher.
- [ ] **Verify:** The same dataset is preserved between views.
- [ ] **Verify:** Search and status dropdown filters apply instantly to both views.

## Test 6: Safe Offline Manual Editing
- [ ] **Action:** Click on any ticket to open the Detail Sheet on the right. Modify the title and priority without clicking Push yet. Close the sheet.
- [ ] **Verify:** The ticket card now reflects the draft edits.
- [ ] **Verify:** The floating "Review & Push" banner appears at the bottom with a count of `1 unpublished change`.

## Test 7: Review & Diff Viewer
- [ ] **Action:** Click "Review & Push" on the floating banner.
- [ ] **Verify:** The Diff Review Modal opens showing exactly what fields changed.
- [ ] **Verify:** ONLY the Title and Priority are marked as changed (ensuring the safety-first patch engine isolates drafts correctly).

## Test 8: Single Ticket AI Editing
- [ ] **Action:** Open a ticket's Detail Sheet. In the bottom AI prompt bar, type something like "Make this description more concise and set priority to High" and click Apply.
- **Note:** *Ensure your OpenRouter API key in `.env` is valid. If it throws a 401 error, generate a new key on OpenRouter.*
- [ ] **Verify:** The AI accurately parses the request, infers the correct Linear priority status, and rewrites the description.
- [ ] **Verify:** The changes appear as local drafts in the UI instantly.

## Test 9: Bulk Edit AI (Mass Selection)
- [ ] **Action:** Use the List view or hover over Kanban cards to select 2 or 3 tickets via checkboxes.
- [ ] **Verify:** The Bulk Actions toolbar appears at the bottom.
- [ ] **Action:** Click "AI Edit" and prompt it to "Assign all to me and set labels to 'Urgent'".
- [ ] **Verify:** Processing completes, and all 3 tickets update with the new assignee and label drafts locally.

## Test 10: Push Sync Execution (The Sandbox Test)
- [ ] **Action:** With your accumulated drafts (manual + AI edits), click "Review & Push", select all tickets, and click "Push to Linear".
- [ ] **Verify:** A success toast appears confirming the push.
- [ ] **Verify:** The local tickets immediately lose their "unpublished" flags and return to a clean "synced" state.
- [ ] **Verify:** Check your actual Linear Web App — ensure *only* the specific fields you touched (e.g. descriptions, priority) were modified, and nothing else was overwritten.
