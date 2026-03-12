# ClearSprint AI V2 — UI/UX Overhaul & Optimization

## 1. Core Vision & Goals
ClearSprint AI V2 transitions the app from a "click-and-sheet" model to an **Inline-First, High-Density** editing flow. The goal is blazing-fast interaction, zero friction, and a highly polished, modern, and elegant "wow" UI. 

**Key UX Pillars:**
- **List View by Default:** The Kanban board will be removed or completely overhauled later. For V2, we focus exclusively on making the List View a powerful, full-screen data table.
- **Inline Editing:** No more opening slide-out sheets just to change a status or assign a user. We edit directly in the table row.
- **AI Integration:** The AI prompt bar becomes smarter and context-aware, sitting seamlessly at the bottom or top of the list view.
- **Minimalist Aesthetics:** Remove redundant buttons (e.g., duplicate import buttons, cluttered toolbars). Make use of the `--linear` brand color (`#5E6AD2`) thoughtfully, not overwhelmingly. Use subtle micro-animations and glassmorphism.

---

## 2. Redundant Elements to Remove
- **Kanban View:** Drop it entirely for V2. The current implementation is clunky. We will double down on building the world’s best List View.
- **Redundant Filter Dropdowns:** Consolidate filter controls into a single, sleek "View Options" dropdown or command menu (using `cmdk`).
- **Full Ticket Sheet Detail (for basic edits):** While still available for deep edits (long descriptions), it will no longer be the primary way to change priority, estimate, status, or assignee.

---

## 3. The New List View (The Core of V2)
Our new default view is a highly interactive Data Table (`features/linear-sync/components/workspace-list-view.tsx`).

### Inline Edit Capabilities
Each row in the List View will support immediate inline edits for:
- **Status:** Click the status badge -> Dropdown opens -> Select new status.
- **Priority:** Click priority icon -> Dropdown opens -> Select new priority.
- **Assignee:** Click avatar/name -> Search and select user.
- **Estimate:** Click estimate number -> Input / Dropdown.

### Interaction Design
- **Hover States:** Rows subtly highlight. Edit icons (`lucide-react`) fade in only on hover to keep the UI uncluttered.
- **Selection:** Checkboxes on the far left of each row. Checking a row pulls up the context-aware AI / Bulk Edit floating toolbar at the bottom center.
- **Animations:** Use `framer-motion` for row insertions, deletions, and status changes. When a status changes to "Done", a slight green flash or strikethrough animation plays.

---

## 4. Floating AI Toolbar (The "Magic" Bar)
When 1 or more tickets are selected, the `BulkSelectToolbar` floats up from the bottom.
- **Sleek Design:** Glassmorphic background (`bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl`).
- **AI Input:** A single, expanding input field: "Ask AI to edit {N} selected tickets..."
- **Quick Chips:** Below or next to the input, dynamic suggestion chips (e.g., "Set priority to High", "Mark as Done").

---

## 5. Implementation Phases

### Phase 1: Clean Up & Consolidate (The Purge)
- [ ] Remove `workspace-kanban-view.tsx` and all associated state toggles.
- [ ] Simplify `workspace-toolbar.tsx` to remove the View Mode toggle.
- [ ] Remove redundant UI elements in the project dashboard (ensure the single "Import" button is perfectly placed).

### Phase 2: Inline Editing Data Table
- [ ] Upgrade `WorkspaceListView` to support interactive cell components.
- [ ] Create `InlineStatusPicker`, `InlinePriorityPicker`, `InlineAssigneePicker`, and `InlineEstimatePicker` components using `shadcn/ui` Popovers / Selects.
- [ ] Integrate these pickers into the table columns. Ensure changes immediately update the `draftData` state and mark the ticket sync status as `modified`.

### Phase 3: AI Toolbar & UI Polish
- [ ] Refine the `BulkSelectToolbar` into a floating macOS-style dock/bar.
- [ ] Refine the primary layout styling. Ensure `max-w-7xl` or dynamic full-width layouts look phenomenal.
- [ ] Add `framer-motion` micro-interactions (hover un-blurs, click ripples, smooth state transitions).
- [ ] Ensure all empty states and loading states look premium.

---

## 6. Architecture & State Management Updates
- Inline edits will immediately trigger the `updateTicketDraft` server action.
- The UI will optimistically update the ticket row to show the new value immediately, avoiding loading spinners for simple dropdown selections.
- The "Review & Push" button in the Workspace Header will still govern pushing all accumulated `modified` drafts to Linear.
