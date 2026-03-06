# Change: Add Jira Project Discovery and One-Click Sync

## Why
Users currently cannot see which Jira projects exist in their workspace until they open a multi-step modal dialog. This creates a disconnect between their Jira workspace and ClearSprint, requiring them to remember project names manually. The hidden complexity forces users through unnecessary steps (select site, then select project, then import), when they should be able to see all available projects immediately and sync with one click.

**Current Pain Points:**
- No visibility into available Jira projects before attempting to sync
- Multi-step modal flow (3+ clicks) to discover and import projects
- Users must remember Jira project names and keys
- No indication of sync status (synced vs available)
- Cannot create new Jira projects from within ClearSprint

## What Changes
- Add intelligent project discovery to Projects page showing all available Jira projects
- Implement one-click sync functionality for available Jira projects
- Create visual distinction between synced and available projects
- Add project creation capability for new Jira projects
- Enhance Projects page with search, filter, and sort capabilities
- Display project metadata (key, lead, site, type) before syncing

**User Experience Impact:**
- Reduce time to first sync by ~70% (from multi-step modal to one click)
- Immediate visibility of all Jira projects on page load
- Clear sync status indicators (synced, available, syncing, error)
- Streamlined project creation workflow

**Breaking Changes:** None

## Impact

### Affected Specs
- `jira-integration` (new capability) - Jira project discovery and sync
- `projects` (modified) - Enhanced project listing with discovery section

### Affected Code
- **New Components:**
  - `features/jira/components/jira-projects-discovery.tsx` - Discovery grid component
  - `features/jira/components/jira-project-card.tsx` - Individual project card
  - `features/jira/components/quick-sync-button.tsx` - One-click sync action
  - `features/jira/components/create-jira-project-dialog.tsx` - Create new Jira project
  - `features/projects/components/project-sync-status-badge.tsx` - Status indicator

- **New Server Actions:**
  - `features/jira/actions/jira-discovery.server.ts` - Discovery and sync logic
  - `features/jira/actions/create-jira-project.server.ts` - Project creation

- **Modified Files:**
  - `app/dashboard/projects-list/page.tsx` - Add discovery section
  - `types/jira.ts` - Add discovery types
  - `lib/jira.ts` - Add createProject API call

- **Database:** No schema changes (uses existing `projects` table with `jiraProjectKey`)

### Technical Approach
- Aggregate projects from all connected Jira sites
- Cross-reference with local database to determine sync status
- Implement optimistic UI updates for instant feedback
- Cache discovery results (5 min TTL) for performance
- Handle errors gracefully with retry mechanisms

### User-Facing Changes
- Projects page reorganized into sections: "Synced Projects", "Available Jira Projects", "Quick Actions"
- New "Sync Now" button on available project cards
- New "Create New Jira Project" dialog accessible from Quick Actions
- Search and filter functionality across all projects
- Visual status badges (synced, available, syncing, error)

### Migration Plan
- No data migration required
- Existing projects continue to work unchanged
- Old import modal remains functional (gradual deprecation)
- Feature-flag controlled rollout possible

### Dependencies
- Existing Jira API integration (`lib/jira.ts`)
- Existing authentication system (Better-auth)
- Existing project creation logic (`createProjectFromJira`)
