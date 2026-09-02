# admin-navigation Specification

## Purpose
Gives the admin app a persistent, responsive navigation bar so admins can move between tasks (restaurant management, publishing) and sign out, without relying on ad-hoc inline links scattered across pages.

## Requirements

### Requirement: Persistent navigation on authenticated pages
The system SHALL render a navigation bar on every authenticated admin page, linking to the Restaurants page, the Add Restaurant page, and the Publish page.

#### Scenario: Navigation present on restaurant list
- **WHEN** an admin views the restaurant list page
- **THEN** the navigation bar is visible with links to Restaurants, Add Restaurant, and Publish

#### Scenario: Navigation present on add, edit, and publish pages
- **WHEN** an admin views the add-restaurant page, the restaurant edit page, or the publish page
- **THEN** the navigation bar is visible with links to Restaurants, Add Restaurant, and Publish

#### Scenario: Navigation absent on the login page
- **WHEN** an unauthenticated visitor views the login page
- **THEN** no navigation bar is rendered

### Requirement: Active page indication
The system SHALL visually indicate which navigation link corresponds to the current page.

#### Scenario: Restaurants link indicates current page
- **WHEN** an admin is on the restaurant list or an edit page
- **THEN** the Restaurants navigation link is visually marked as active

#### Scenario: Add Restaurant link indicates current page
- **WHEN** an admin is on the add-restaurant page
- **THEN** the Add Restaurant navigation link is visually marked as active

#### Scenario: Publish link indicates current page
- **WHEN** an admin is on the publish page
- **THEN** the Publish navigation link is visually marked as active

### Requirement: Responsive, mobile-first layout
The system SHALL present the navigation as a single row of links on wider viewports and collapse it behind a hamburger toggle on narrower viewports.

#### Scenario: Collapsed navigation on a narrow viewport
- **WHEN** an admin views any authenticated page on a viewport narrower than the app's tablet breakpoint
- **THEN** the navigation links are hidden behind a hamburger toggle control

#### Scenario: Expanding collapsed navigation
- **WHEN** an admin taps the hamburger toggle on a narrow viewport
- **THEN** the navigation links become visible

#### Scenario: Single-row navigation on a wide viewport
- **WHEN** an admin views any authenticated page on a viewport at or above the app's tablet breakpoint
- **THEN** the navigation links are shown in a single row without a hamburger toggle

### Requirement: Signed-in identity and logout in navigation
The system SHALL display the signed-in admin's identity and a logout control within the navigation bar.

#### Scenario: Identity shown in navigation
- **WHEN** an admin views any authenticated page
- **THEN** the navigation bar shows the signed-in admin's identity and a "Log out" control

#### Scenario: Logging out from navigation
- **WHEN** an admin activates the "Log out" control
- **THEN** the admin's session ends and they are returned to the login page
