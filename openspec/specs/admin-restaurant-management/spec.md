## Purpose

Provides the authenticated `/admin` interface for adding, editing, and deleting restaurants, including in-the-field geolocation capture, on a single responsive layout for mobile and desktop.

## Requirements

### Requirement: Add a restaurant
The system SHALL let an authenticated admin create a new restaurant record with name, coordinates, and optionally a Google Maps URL, tags, and a comment, from a dedicated "Add Restaurant" page separate from the restaurant list.

#### Scenario: Minimal restaurant added
- **WHEN** an admin submits the add form with only a name and coordinates
- **THEN** a new restaurant record is created with those values and empty URL, tags, and comment

#### Scenario: Full restaurant added
- **WHEN** an admin submits the add form with name, coordinates, a Google Maps URL, one or more tags, and a comment
- **THEN** a new restaurant record is created with all submitted values

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

### Requirement: Responsive single layout
The system SHALL present the restaurant list (browse/search) and the add-restaurant form each as its own responsive layout that adapts to viewport width; the edit form is likewise presented as its own responsive page for the selected restaurant.

#### Scenario: Narrow viewport stacks the layout
- **WHEN** the restaurant list, add-restaurant, or edit page is viewed on a narrow (mobile-width) viewport
- **THEN** that page's contents (list, or form) are presented in a single-column layout appropriate to a mobile viewport

#### Scenario: Wide viewport shows side-by-side layout
- **WHEN** the restaurant list, add-restaurant, or edit page is viewed on a wide (desktop-width) viewport
- **THEN** that page's contents are presented using the available width, without requiring the list and a form to share one page

### Requirement: List and search existing restaurants
The system SHALL let an authenticated admin view and search the list of all existing restaurants from the restaurant list page, without an add-restaurant form on the same page.

#### Scenario: Search filters the list
- **WHEN** an admin types a query into the admin search field
- **THEN** the list shows only restaurants whose name or tags match the query

#### Scenario: List page has no add form
- **WHEN** an admin views the restaurant list page
- **THEN** no add-restaurant form is shown on that page; adding a restaurant happens on the dedicated Add Restaurant page
