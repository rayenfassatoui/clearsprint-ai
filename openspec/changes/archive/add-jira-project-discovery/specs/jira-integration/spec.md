## ADDED Requirements

### Requirement: Jira Project Discovery
The system SHALL fetch and display all available Jira projects from connected Jira sites on the Projects page, allowing users to see which projects can be synced without navigating through modal dialogs.

#### Scenario: Display available Jira projects on page load
- **WHEN** user navigates to Projects page with Jira connected
- **THEN** system fetches projects from all connected Jira sites
- **AND** displays projects in "Available Jira Projects" section
- **AND** shows project metadata (key, name, lead, site)
- **AND** indicates sync status (available vs already synced)

#### Scenario: No Jira connection
- **WHEN** user navigates to Projects page without Jira connected
- **THEN** system displays empty state with "Connect Jira" call-to-action
- **AND** hides "Available Jira Projects" section

#### Scenario: No available projects
- **WHEN** user has Jira connected but no projects exist
- **THEN** system displays empty state indicating no projects found
- **AND** offers "Create New Jira Project" action

### Requirement: Project Sync Status Indication
The system SHALL display clear visual indicators showing whether a Jira project is already synced or available to sync.

#### Scenario: Show sync status badge
- **WHEN** displaying Jira project cards
- **THEN** system shows status badge (synced, available, syncing, error)
- **AND** uses color-coded indicators (green for synced, blue for available)
- **AND** includes appropriate icon for each status

#### Scenario: Filter synced projects from available
- **WHEN** rendering available projects section
- **THEN** system excludes projects that are already synced
- **AND** cross-references local database with Jira projects
- **AND** marks projects with matching `jiraProjectKey` as synced

### Requirement: One-Click Project Sync
The system SHALL allow users to sync a Jira project with a single click from the discovery interface.

#### Scenario: Sync available project
- **WHEN** user clicks "Sync Now" button on available project card
- **THEN** system initiates sync operation
- **AND** updates button to loading state with spinner
- **AND** imports all issues from Jira project
- **AND** creates local project record linked to Jira
- **AND** displays success notification
- **AND** redirects to new project detail page

#### Scenario: Sync operation fails
- **WHEN** sync operation encounters error (API failure, timeout, etc.)
- **THEN** system displays error message with details
- **AND** reverts button to initial state
- **AND** offers retry action
- **AND** logs error for debugging

#### Scenario: Concurrent sync prevention
- **WHEN** user clicks sync on project already being synced
- **THEN** system prevents duplicate sync operation
- **AND** shows "Already syncing" message

### Requirement: Jira Project Creation
The system SHALL allow users to create new Jira projects directly from ClearSprint interface.

#### Scenario: Create new Jira project
- **WHEN** user opens "Create New Jira Project" dialog
- **AND** fills in project name, key, description, and site
- **AND** submits form
- **THEN** system validates project key format (2-10 uppercase alphanumeric)
- **AND** creates project in Jira via API
- **AND** automatically syncs new project to ClearSprint
- **AND** redirects to new project detail page
- **AND** displays success notification

#### Scenario: Auto-generate project key
- **WHEN** user types project name in creation form
- **THEN** system automatically generates suggested project key
- **AND** converts name to uppercase
- **AND** removes spaces and special characters
- **AND** truncates to max 10 characters
- **AND** allows manual override

#### Scenario: Invalid project key
- **WHEN** user enters invalid project key (too short, lowercase, special chars)
- **THEN** system displays inline validation error
- **AND** prevents form submission
- **AND** shows format requirements

#### Scenario: Project creation fails
- **WHEN** project creation API call fails
- **THEN** system displays error message
- **AND** keeps form open with entered data
- **AND** allows user to retry

### Requirement: Project Discovery Performance
The system SHALL optimize project discovery to load quickly and handle large numbers of projects efficiently.

#### Scenario: Cache discovery results
- **WHEN** system fetches Jira projects
- **THEN** caches results for 5 minutes
- **AND** serves cached data on subsequent requests within TTL
- **AND** refreshes cache after expiration

#### Scenario: Paginated project loading
- **WHEN** user has more than 20 projects
- **THEN** system loads first 20 projects initially
- **AND** loads additional projects on scroll or click "Load More"
- **AND** maintains smooth scrolling performance

#### Scenario: Optimistic UI updates
- **WHEN** user initiates sync operation
- **THEN** system immediately updates UI (button to loading state)
- **AND** moves card to synced section on success
- **AND** reverts on error

### Requirement: Multi-Site Jira Support
The system SHALL aggregate projects from multiple connected Jira sites and display them in a unified interface.

#### Scenario: Fetch from multiple sites
- **WHEN** user has multiple Jira sites connected
- **THEN** system fetches projects from all sites in parallel
- **AND** aggregates results into single list
- **AND** labels each project with its source site name
- **AND** handles partial failures (some sites succeed, others fail)

#### Scenario: Site selection during creation
- **WHEN** user creates new Jira project with multiple sites connected
- **THEN** system displays site selector dropdown
- **AND** requires site selection before submission
- **AND** creates project in selected site

### Requirement: Search and Filter Projects
The system SHALL provide search and filter capabilities to help users find specific projects quickly.

#### Scenario: Search by project name or key
- **WHEN** user types in search box
- **THEN** system filters projects in real-time
- **AND** searches both name and key fields
- **AND** highlights matching text
- **AND** shows "No results" message if no matches

#### Scenario: Filter by sync status
- **WHEN** user selects status filter (synced, available, all)
- **THEN** system displays only projects matching filter
- **AND** updates count in section headers

#### Scenario: Filter by Jira site
- **WHEN** user selects site filter
- **THEN** system displays only projects from selected site
- **AND** maintains other active filters

### Requirement: Error Handling and Recovery
The system SHALL handle errors gracefully and provide clear recovery options.

#### Scenario: Jira API rate limit
- **WHEN** Jira API returns rate limit error
- **THEN** system displays friendly message with retry timer
- **AND** automatically retries after exponential backoff
- **AND** allows manual retry

#### Scenario: Network failure during discovery
- **WHEN** network request fails during project fetch
- **THEN** system displays error state with retry button
- **AND** preserves existing cached data if available
- **AND** logs error details for debugging

#### Scenario: Project already synced
- **WHEN** user attempts to sync project that's already synced
- **THEN** system displays info message "Already synced"
- **AND** offers navigation to existing project
- **AND** does not create duplicate
