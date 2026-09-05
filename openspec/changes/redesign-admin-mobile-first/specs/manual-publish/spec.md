## ADDED Requirements

### Requirement: Restaurant data mutation is timestamped
The system SHALL record the time of the most recent restaurant data mutation, updating it
whenever a restaurant is created, edited, or deleted. The record SHALL be independent of any
individual restaurant record, so that a deletion updates it as reliably as a creation or an
edit.

#### Scenario: Creation updates the mutation time
- **WHEN** an admin creates a restaurant
- **THEN** the recorded time of last restaurant data mutation is updated to that moment

#### Scenario: Edit updates the mutation time
- **WHEN** an admin edits a restaurant
- **THEN** the recorded time of last restaurant data mutation is updated to that moment

#### Scenario: Deletion updates the mutation time
- **WHEN** an admin deletes a restaurant
- **THEN** the recorded time of last restaurant data mutation is updated to that moment, even though the restaurant record no longer exists

### Requirement: Successful publishes are timestamped
The system SHALL record the time at which a publish was triggered, and SHALL record it only
when the rebuild trigger was accepted. A failed trigger SHALL leave the recorded publish time
unchanged.

#### Scenario: Successful trigger is recorded
- **WHEN** an admin triggers a publish and the rebuild trigger is accepted
- **THEN** the recorded time of last publish is updated to the time the publish was triggered

#### Scenario: Failed trigger is not recorded
- **WHEN** an admin triggers a publish and the rebuild trigger fails
- **THEN** the recorded time of last publish is left unchanged, so the changes remain reported as pending

### Requirement: Publish trigger response is retained for diagnosis
The system SHALL retain the deployment identifier returned when a rebuild trigger is accepted,
storing it alongside the recorded publish time. The system does not interpret the identifier or
report on the resulting build's outcome; it is retained so that a publish can be traced to a
specific deployment after the fact.

#### Scenario: Identifier retained on a successful trigger
- **WHEN** a rebuild trigger is accepted and the response identifies the resulting deployment
- **THEN** that identifier is stored with the recorded publish time

#### Scenario: Missing or unreadable identifier does not fail the publish
- **WHEN** a rebuild trigger is accepted but the response contains no readable deployment identifier
- **THEN** the publish is still recorded as successful and the identifier is left empty

#### Scenario: Identifier not retained for a failed trigger
- **WHEN** a rebuild trigger fails
- **THEN** no deployment identifier is stored and the previously stored identifier is left unchanged

### Requirement: Publish state is visible to the admin
The system SHALL show the admin whether the public site reflects the current restaurant data,
distinguishing three states: never published, up to date, and changes pending. The state
SHALL be derived by comparing the recorded mutation time against the recorded publish time.

#### Scenario: Changes pending
- **WHEN** restaurant data has been mutated more recently than the last recorded publish
- **THEN** the publish screen reports that there are changes not yet published, and shows when data was last changed and when the last publish occurred

#### Scenario: Up to date
- **WHEN** no restaurant data has been mutated since the last recorded publish
- **THEN** the publish screen reports that the public site is up to date, and shows when the last publish occurred

#### Scenario: Never published
- **WHEN** no publish has ever been recorded
- **THEN** the publish screen reports that the site has never been published, rather than reporting it as up to date

#### Scenario: Publishing remains available when up to date
- **WHEN** the publish screen reports that the public site is up to date
- **THEN** the admin can still trigger a publish

### Requirement: Publish confirmation does not claim the rebuild succeeded
The system SHALL report only that a rebuild was requested and accepted, and SHALL NOT state
that the public site has been or will be successfully rebuilt, since acceptance of the trigger
does not indicate that the resulting build completed.

#### Scenario: Confirmation wording is limited to the trigger
- **WHEN** a publish trigger is accepted
- **THEN** the admin is told the publish was requested, without an assertion that the rebuild has completed or is guaranteed to complete
