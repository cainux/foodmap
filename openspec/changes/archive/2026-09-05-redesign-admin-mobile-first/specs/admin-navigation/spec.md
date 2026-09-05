## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Signed-in identity and logout in navigation
**Reason**: Displaying the signed-in handle consumes persistent vertical space on a
phone to communicate something invariant — the admin app allows one signed-in account,
and the person reading the screen is that account. The logout control it was bundled
with is retained separately.

**Migration**: Logout behaviour is covered by "Logout is available without occupying
layout space". No identity display replaces the removed one.

### Requirement: Responsive, mobile-first layout
**Reason**: The admin is used primarily on a phone, and maintaining a separate desktop
navigation layout added a breakpoint, a menu toggle, and its open/close state for a viewport
that is rarely used. A single bottom tab bar serves both, and removes the case where the
app's most frequent action was concealed behind a menu.

**Migration**: The bottom tab bar defined under "Persistent bottom tab bar" replaces this
requirement at all viewport widths. No hamburger toggle, breakpoint, or wide-viewport
navigation variant remains; the wide-viewport presentation is governed by the single-layout
requirement in `admin-app-shell`.
