## Purpose

Lets an admin explicitly publish accumulated database changes to the public static site on demand, rather than rebuilding automatically on every write, so multiple edits can be batched before triggering a rebuild.

## Requirements

### Requirement: Manual publish control in the admin area
The system SHALL provide a control in `/admin` that an authenticated admin can use to trigger a rebuild of the public site on demand.

#### Scenario: Admin triggers a publish
- **WHEN** an admin activates the publish control
- **THEN** a rebuild of the public site is triggered

### Requirement: Writes do not automatically trigger a rebuild
The system SHALL NOT trigger a rebuild of the public site automatically when a restaurant is created, edited, or deleted.

#### Scenario: Create does not trigger a rebuild
- **WHEN** an admin creates a new restaurant
- **THEN** no rebuild of the public site is triggered as a side effect

#### Scenario: Edit does not trigger a rebuild
- **WHEN** an admin edits an existing restaurant
- **THEN** no rebuild of the public site is triggered as a side effect

#### Scenario: Delete does not trigger a rebuild
- **WHEN** an admin deletes a restaurant
- **THEN** no rebuild of the public site is triggered as a side effect

### Requirement: Public site remains static between publishes
The system SHALL continue to serve the public site as prerendered static output between publishes, without querying the database on the public request path.

#### Scenario: Public page served without a live query
- **WHEN** a visitor loads the public restaurant map
- **THEN** the page is served from prerendered static output, not a live database read

### Requirement: Publish failure does not lose data
The system SHALL persist admin writes to the database regardless of whether a subsequent publish succeeds, so a failed or delayed publish does not lose data and can be retried.

#### Scenario: Publish trigger fails after successful writes
- **WHEN** an admin triggers a publish and the rebuild trigger request fails
- **THEN** all previously saved restaurant changes remain in the database and are included in the next successful publish
