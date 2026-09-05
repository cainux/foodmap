# admin-navigation Specification

## Purpose
Gives the admin app a persistent bottom tab bar so admins can move between tasks (restaurant management, publishing) in a single tap at any viewport width, and sign out, without relying on ad-hoc inline links scattered across pages.

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

### Requirement: Persistent bottom tab bar
The system SHALL present navigation as a persistent tab bar fixed to the bottom of the
viewport on every authenticated page, with one tab per primary destination — Restaurants, Add
Restaurant, and Publish — all directly reachable without first opening a menu.

#### Scenario: Every destination reachable in one action
- **WHEN** an admin views any authenticated page
- **THEN** the Restaurants, Add Restaurant, and Publish destinations are each visible in the tab bar and reachable with a single activation

#### Scenario: Tab bar remains fixed while scrolling
- **WHEN** an admin scrolls the content of any authenticated page
- **THEN** the tab bar remains fixed at the bottom of the viewport and does not scroll out of view

#### Scenario: No menu required at any viewport width
- **WHEN** an admin views any authenticated page at any viewport width
- **THEN** no menu toggle is presented and no navigation destination is concealed behind one

### Requirement: Publish tab indicates pending changes
The system SHALL show an indicator on the Publish tab whenever restaurant data has been
changed since the last successful publish, so that unpublished work is visible from every
screen.

#### Scenario: Indicator shown when changes are pending
- **WHEN** restaurant data has been created, edited, or deleted since the last successful publish
- **THEN** the Publish tab displays a pending-changes indicator

#### Scenario: Indicator cleared after publishing
- **WHEN** a publish has succeeded and no restaurant data has changed since
- **THEN** the Publish tab displays no pending-changes indicator

### Requirement: Logout is available without occupying layout space
The system SHALL provide a logout control in the persistent header as a compact,
labelled control, without displaying the signed-in admin's identity. The admin app
permits a single signed-in account at a time, so showing which account is signed in
conveys nothing the admin does not already know, and the vertical space is more
valuable on a phone.

#### Scenario: Logout reachable from any authenticated page
- **WHEN** an admin views any authenticated page
- **THEN** a logout control is present in the persistent header and is reachable without opening a menu

#### Scenario: Logging out ends the session
- **WHEN** an admin activates the logout control
- **THEN** the admin's session ends and they are returned to the login page

#### Scenario: Identity is not displayed
- **WHEN** an admin views any authenticated page
- **THEN** the signed-in account's handle is not displayed in the navigation, header, or any other persistent chrome
