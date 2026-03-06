## MODIFIED Requirements

### Requirement: Projects Page Layout
The system SHALL organize the Projects page into distinct sections: synced projects, available Jira projects, and quick actions, providing clear navigation and discovery.

#### Scenario: Display organized sections
- **WHEN** user navigates to Projects page
- **THEN** system displays three sections in order
- **AND** shows "Your Synced Projects" section with local projects
- **AND** shows "Available Jira Projects" section with unsynced Jira projects
- **AND** shows "Quick Actions" section with creation buttons

#### Scenario: Empty synced projects section
- **WHEN** user has no synced projects
- **THEN** system displays empty state in synced section
- **AND** shows message "No projects yet"
- **AND** offers quick action to create or sync first project

#### Scenario: Section headers with counts
- **WHEN** rendering section headers
- **THEN** system displays count of items in each section
- **AND** updates counts dynamically as projects sync
- **AND** formats as "Your Synced Projects (3)"

## ADDED Requirements

### Requirement: Quick Actions Section
The system SHALL provide a Quick Actions section offering streamlined access to project creation workflows.

#### Scenario: Display quick action buttons
- **WHEN** user views Projects page
- **THEN** system displays Quick Actions section at bottom
- **AND** shows "Create New Jira Project" button
- **AND** shows "Upload PRD" button (if implemented)
- **AND** disables buttons if Jira not connected

#### Scenario: Navigate to action from quick actions
- **WHEN** user clicks quick action button
- **THEN** system opens appropriate dialog or navigates to form
- **AND** pre-fills context if available

### Requirement: Project Card Enhancement
The system SHALL display comprehensive metadata on project cards to help users understand project details at a glance.

#### Scenario: Display project metadata
- **WHEN** rendering project card
- **THEN** system displays project key prominently
- **AND** shows project name
- **AND** shows Jira site name and URL
- **AND** shows project lead with avatar (if available)
- **AND** shows project type (Scrum, Kanban, etc.)

#### Scenario: Visual distinction for synced projects
- **WHEN** rendering synced project card
- **THEN** system displays additional sync information
- **AND** shows ticket count
- **AND** shows last sync timestamp
- **AND** offers "Open Project" and "Sync Now" actions

### Requirement: Responsive Project Grid
The system SHALL adapt project card layout based on viewport size for optimal viewing on all devices.

#### Scenario: Desktop layout
- **WHEN** viewport width is greater than 1024px
- **THEN** system displays projects in 3-column grid
- **AND** maintains consistent card sizes

#### Scenario: Tablet layout
- **WHEN** viewport width is between 768px and 1024px
- **THEN** system displays projects in 2-column grid
- **AND** adjusts card spacing appropriately

#### Scenario: Mobile layout
- **WHEN** viewport width is less than 768px
- **THEN** system displays projects in single column
- **AND** stacks card content vertically
- **AND** enlarges touch targets to 44x44px minimum
