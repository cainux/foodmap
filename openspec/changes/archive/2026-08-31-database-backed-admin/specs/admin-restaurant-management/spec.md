## Purpose

Provides the authenticated `/admin` interface for adding, editing, and deleting restaurants, including in-the-field geolocation capture, on a single responsive layout for mobile and desktop.

## ADDED Requirements

### Requirement: Add a restaurant
The system SHALL let an authenticated admin create a new restaurant record with name, coordinates, and optionally a Google Maps URL, tags, and a comment.

#### Scenario: Minimal restaurant added
- **WHEN** an admin submits the add form with only a name and coordinates
- **THEN** a new restaurant record is created with those values and empty URL, tags, and comment

#### Scenario: Full restaurant added
- **WHEN** an admin submits the add form with name, coordinates, a Google Maps URL, one or more tags, and a comment
- **THEN** a new restaurant record is created with all submitted values

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

### Requirement: Responsive single layout
The system SHALL present restaurant management (add/edit form and the list of existing restaurants) as one responsive layout that adapts to viewport width, rather than separate mobile and desktop pages.

#### Scenario: Narrow viewport stacks the layout
- **WHEN** the admin area is viewed on a narrow (mobile-width) viewport
- **THEN** the form and the restaurant list are presented stacked, using the same components and routes as the desktop view

#### Scenario: Wide viewport shows side-by-side layout
- **WHEN** the admin area is viewed on a wide (desktop-width) viewport
- **THEN** the form and the restaurant list are presented side by side, using the same components and routes as the mobile view

### Requirement: List and search existing restaurants
The system SHALL let an authenticated admin view and search the list of all existing restaurants from within `/admin`.

#### Scenario: Search filters the list
- **WHEN** an admin types a query into the admin search field
- **THEN** the list shows only restaurants whose name or tags match the query
