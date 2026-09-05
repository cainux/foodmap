## Purpose

Provides the authenticated `/admin` interface for adding, editing, and deleting restaurants, including in-the-field geolocation capture, on one phone-oriented layout presented at every viewport width.

## Requirements

### Requirement: Add a restaurant
The system SHALL let an authenticated admin create a new restaurant record with name,
coordinates, and a Google Maps URL — all required — and optionally tags and a comment, from a
dedicated "Add Restaurant" page separate from the restaurant list.

#### Scenario: Minimal restaurant added
- **WHEN** an admin submits the add form with a name, coordinates, and a Google Maps URL, leaving tags and comment empty
- **THEN** a new restaurant record is created with those values and empty tags and comment

#### Scenario: Full restaurant added
- **WHEN** an admin submits the add form with name, coordinates, a Google Maps URL, one or more tags, and a comment
- **THEN** a new restaurant record is created with all submitted values

#### Scenario: Missing required field rejected
- **WHEN** an admin submits the add form without a name, without coordinates, or without a Google Maps URL
- **THEN** the submission is rejected, the missing field is identified, and no restaurant record is created

#### Scenario: Add form reachable without the list
- **WHEN** an admin navigates to the Add Restaurant page
- **THEN** the add form is shown on its own, without the restaurant list

### Requirement: Edit an existing restaurant
The system SHALL let an authenticated admin modify any field of an existing restaurant record using the same form used to add restaurants, pre-filled with its current values.

#### Scenario: Edit updates fields
- **WHEN** an admin opens an existing restaurant for editing, changes its tags, and saves
- **THEN** the restaurant record reflects the updated tags and unchanged fields remain as they were

### Requirement: Delete a restaurant
The system SHALL let an authenticated admin delete an existing restaurant record after confirming the action.

#### Scenario: Delete requires confirmation
- **WHEN** an admin initiates deleting a restaurant
- **THEN** the system asks for confirmation before the record is removed

#### Scenario: Confirmed delete removes the record
- **WHEN** an admin confirms deletion of a restaurant
- **THEN** the restaurant record is removed and no longer appears in the admin list

### Requirement: Capture coordinates from the current device
The system SHALL provide a control that fills the coordinate fields from the device's current geolocation, at a precision of at least 15 decimal places, while still allowing the admin to manually edit the resulting values.

#### Scenario: Location captured successfully
- **WHEN** an admin taps "use current location" and grants location permission
- **THEN** the latitude and longitude fields are filled with the device's current coordinates at 15 decimal places

#### Scenario: Captured coordinates remain editable
- **WHEN** coordinates have been filled via device geolocation
- **THEN** the admin can still manually edit the latitude and longitude field values before saving

### Requirement: Warn on likely duplicate
The system SHALL warn, without blocking submission, when the coordinates entered on the add form are within a short distance of an existing restaurant's coordinates.

#### Scenario: Nearby existing restaurant triggers warning
- **WHEN** an admin enters coordinates that are within the duplicate-warning radius of an existing restaurant
- **THEN** the form displays a non-blocking warning naming the nearby existing restaurant

#### Scenario: No nearby restaurant, no warning
- **WHEN** an admin enters coordinates that are not near any existing restaurant
- **THEN** no duplicate warning is shown

#### Scenario: Warning does not block saving
- **WHEN** a duplicate warning is shown
- **THEN** the admin can still save the new restaurant without dismissing or resolving the warning

### Requirement: List and search existing restaurants
The system SHALL let an authenticated admin view and search the list of all existing
restaurants from the restaurant list page, without an add-restaurant form on the same page.
Searching SHALL match restaurant names only, and SHALL filter the list as the admin types
without reloading the page.

#### Scenario: Search filters the list
- **WHEN** an admin types a query into the admin search field
- **THEN** the list shows only restaurants whose name matches the query, and restaurants matching only on tags are not shown

#### Scenario: List filters without a page reload
- **WHEN** an admin types into the search field
- **THEN** the list updates to match without navigating or reloading the page

#### Scenario: Result count shown
- **WHEN** an admin views the restaurant list, filtered or unfiltered
- **THEN** the number of restaurants currently listed is shown

#### Scenario: No matches reported explicitly
- **WHEN** a search query matches no restaurants
- **THEN** the list states that no restaurants match the query, rather than rendering an empty list

#### Scenario: List page has no add form
- **WHEN** an admin views the restaurant list page
- **THEN** no add-restaurant form is shown on that page; adding a restaurant happens on the dedicated Add Restaurant page

### Requirement: Coordinates must be valid before saving
The system SHALL reject a restaurant submission whose coordinates are absent or cannot be
parsed as a latitude and longitude pair, and SHALL NOT store a restaurant with missing
coordinates. Invalid coordinates SHALL be reported against the coordinate field before the
submission is accepted.

#### Scenario: Malformed coordinates are rejected
- **WHEN** an admin submits the add or edit form with a coordinate value that cannot be parsed as a latitude and longitude pair
- **THEN** the submission is rejected, the coordinate field is marked invalid, and no restaurant record is created or updated

#### Scenario: Empty coordinates are rejected
- **WHEN** an admin submits the add or edit form with no coordinate value
- **THEN** the submission is rejected and no restaurant record is created or updated

#### Scenario: Invalid coordinates never stored as absent
- **WHEN** a coordinate value fails to parse
- **THEN** the system does not store the restaurant with empty latitude and longitude in place of the unparsed value

### Requirement: Tag entry offers the existing vocabulary
The system SHALL present the tags already in use across existing restaurants when an admin is
entering tags, so that established tags can be reused rather than retyped, reducing accidental
near-duplicate tags.

#### Scenario: Existing tags offered
- **WHEN** an admin is entering tags on the add or edit form
- **THEN** the tags already used by existing restaurants are available to select

#### Scenario: New tags still permitted
- **WHEN** an admin enters a tag that no existing restaurant uses
- **THEN** the tag is accepted and saved
