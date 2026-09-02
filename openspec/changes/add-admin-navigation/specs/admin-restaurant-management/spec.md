## MODIFIED Requirements

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
