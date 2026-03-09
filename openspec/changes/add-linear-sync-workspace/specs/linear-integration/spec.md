## ADDED Requirements

### Requirement: Linear OAuth Authentication

The system SHALL provide OAuth 2.0 authentication with Linear using Better-auth's social provider system. Upon successful authorization, the system SHALL store the user's `access_token` and `refresh_token` in the `account` table with `providerId: 'linear'`. The system SHALL automatically refresh expired tokens before any API call.

#### Scenario: User connects Linear account

- **WHEN** user clicks "Connect Linear" button on the dashboard
- **THEN** user is redirected to Linear's OAuth consent screen
- **AND** upon granting access, the user is redirected back with tokens stored in the `account` table
- **AND** the UI updates to show "Linear Connected" status

#### Scenario: Token refresh on expiration

- **WHEN** the stored `access_token` has expired
- **AND** a Linear API call is attempted
- **THEN** the system SHALL use the `refresh_token` to obtain a new `access_token`
- **AND** update the `account` table with the new tokens
- **AND** retry the original API call

#### Scenario: User disconnects Linear

- **WHEN** user clicks "Disconnect Linear"
- **THEN** the system SHALL remove the Linear account row from the `account` table
- **AND** display a confirmation message
- **AND** workspace projects linked to this connection remain in the database but are marked as disconnected

### Requirement: Linear Project Discovery

The system SHALL use the `@linear/sdk` to fetch the user's available Linear teams and projects. The user SHALL be presented with a searchable dropdown of their Linear projects. The system SHALL display each project's name, team, icon, and issue count.

#### Scenario: User selects a Linear project

- **WHEN** user opens the project selector after connecting Linear
- **THEN** the system fetches all accessible Linear projects via the SDK
- **AND** displays them in a searchable, scrollable list grouped by team
- **AND** each project shows its name, key, and approximate issue count

#### Scenario: No projects available

- **WHEN** the user's Linear account has no projects
- **THEN** the system SHALL display an empty state with guidance on creating a project in Linear

### Requirement: Linear API Client

The system SHALL provide a server-side Linear API client utility (`lib/linear.ts`) that wraps the `@linear/sdk` with automatic token management. All Linear API interactions SHALL go through this client. The client SHALL handle pagination for large result sets.

#### Scenario: Paginated issue fetch

- **WHEN** a Linear project has more than 50 issues
- **THEN** the client SHALL paginate through all results using the SDK's cursor-based pagination
- **AND** return the complete list of issues
