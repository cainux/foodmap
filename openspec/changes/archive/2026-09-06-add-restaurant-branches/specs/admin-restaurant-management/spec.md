## ADDED Requirements

### Requirement: Restaurants sharing a name are distinguishable in the list
The system SHALL present each restaurant in the admin list in a way that distinguishes it
from other restaurants sharing the same name, by showing its branch label alongside the name
when one is set. The list SHALL be ordered so that restaurants sharing a name appear
adjacently, ordered by branch label within that name.

#### Scenario: Branch shown alongside name
- **WHEN** an admin views the list and a restaurant has a branch label
- **THEN** that restaurant's entry shows both its name and its branch label

#### Scenario: Restaurant without a branch shows name alone
- **WHEN** an admin views the list and a restaurant has no branch label
- **THEN** that restaurant's entry shows its name without a trailing separator or empty branch

#### Scenario: Same-name restaurants sort adjacently
- **WHEN** the list contains two or more restaurants sharing a name
- **THEN** they appear consecutively, ordered among themselves by branch label

#### Scenario: Search behaviour is unchanged by branch
- **WHEN** an admin types a query that matches a restaurant's branch label but not its name
- **THEN** that restaurant is not shown, because search continues to match names only

## MODIFIED Requirements

### Requirement: Add a restaurant
The system SHALL let an authenticated admin create a new restaurant record with name,
coordinates, and a Google Maps URL — all required — and optionally tags, a branch label, and
a comment, from a dedicated "Add Restaurant" page separate from the restaurant list.

#### Scenario: Minimal restaurant added
- **WHEN** an admin submits the add form with a name, coordinates, and a Google Maps URL, leaving tags, branch, and comment empty
- **THEN** a new restaurant record is created with those values and empty tags, branch, and comment

#### Scenario: Full restaurant added
- **WHEN** an admin submits the add form with name, coordinates, a Google Maps URL, one or more tags, a branch label, and a comment
- **THEN** a new restaurant record is created with all submitted values

#### Scenario: Missing required field rejected
- **WHEN** an admin submits the add form without a name, without coordinates, or without a Google Maps URL
- **THEN** the submission is rejected, the missing field is identified, and no restaurant record is created

#### Scenario: Branch is never required
- **WHEN** an admin submits the add form with a name that an existing restaurant already uses, leaving the branch empty
- **THEN** the submission is accepted and the record is created, because a branch label is optional regardless of whether the name collides

#### Scenario: Add form reachable without the list
- **WHEN** an admin navigates to the Add Restaurant page
- **THEN** the add form is shown on its own, without the restaurant list
