## Purpose

Defines the admin app's phone-first application shell: how it is installed and launched, the
single layout it presents at every viewport width, and the persistent header that identifies
the current screen.

## Requirements

### Requirement: Installable as a standalone app
The system SHALL publish a web app manifest that allows the admin to be installed to a device
home screen and launched in standalone display mode, without browser navigation chrome.

#### Scenario: Installed admin launches without browser chrome
- **WHEN** an admin installs the admin app to their device and launches it from the home screen
- **THEN** the app opens in standalone display mode with no browser address bar or navigation controls

#### Scenario: Admin remains usable in a normal browser tab
- **WHEN** an admin opens the admin app in an ordinary browser tab instead of installing it
- **THEN** every feature remains available and behaves identically to the installed app

### Requirement: No offline caching of application data
The system SHALL NOT serve admin pages or restaurant data from an offline cache. Because the
admin is authenticated and write-oriented, stale cached content would misrepresent the current
state of the database.

#### Scenario: No stale data served while offline
- **WHEN** an admin opens the installed app with no network connection
- **THEN** the app does not present cached restaurant data as current, and instead surfaces the failure to reach the server

#### Scenario: Data always reflects the server
- **WHEN** an admin views the restaurant list after a restaurant was changed
- **THEN** the list reflects the current database state rather than a previously cached response

### Requirement: Single layout at all viewport widths
The system SHALL present one phone-oriented layout at every viewport width, with no
viewport-dependent navigation or structural variants. On wide viewports the same layout is
presented as a centred column rather than being stretched to the full width.

#### Scenario: Narrow viewport
- **WHEN** an admin views any authenticated page on a phone-width viewport
- **THEN** content is presented in a single column sized to the viewport

#### Scenario: Wide viewport uses the same structure
- **WHEN** an admin views the same page on a desktop-width viewport
- **THEN** the page presents the identical structure and navigation as on a phone, constrained to a centred column rather than filling the viewport width

### Requirement: Layout respects device safe areas
The system SHALL keep interactive controls clear of device safe-area insets, so that fixed
navigation is not obscured by system UI such as a home indicator or rounded display corners.

#### Scenario: Fixed navigation clears system UI
- **WHEN** an admin uses the installed app on a device with a home indicator or display cutout
- **THEN** the fixed navigation controls remain fully visible and tappable, inset clear of the system UI

### Requirement: Persistent header identifies the current screen
The system SHALL display a persistent header on every authenticated page showing the title of
the current screen, in place of a per-page heading in the content body.

#### Scenario: Screen title shown in the header
- **WHEN** an admin navigates to the restaurant list, add, edit, or publish screen
- **THEN** the header shows that screen's title

#### Scenario: Title not duplicated in content
- **WHEN** an admin views any authenticated page
- **THEN** the screen title appears only in the header and is not repeated as a heading at the top of the page content
