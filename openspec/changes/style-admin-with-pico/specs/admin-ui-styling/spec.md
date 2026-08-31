## Purpose

Ensures the admin app has readable, usable base styling consistent with the public site's Pico CSS convention, instead of rendering as unstyled raw HTML.

## ADDED Requirements

### Requirement: Admin pages load base styling
The system SHALL apply Pico CSS as base styling across all admin app pages, matching the styling approach already used by the public site.

#### Scenario: Any admin page renders styled
- **WHEN** an admin visits any page in the admin app (login, restaurant list, restaurant edit, publish)
- **THEN** the page renders with Pico CSS base styling applied (typography, form controls, spacing, buttons) rather than unstyled browser defaults

### Requirement: Existing semantic markup renders correctly under Pico
The system SHALL ensure existing semantic HTML elements (forms, labels, buttons, alerts) continue to function correctly and remain accessible once Pico CSS styling is applied.

#### Scenario: Login form remains usable
- **WHEN** an admin views the sign-in form
- **THEN** the handle input and submit button are usable and visibly styled, and an error message (`role="alert"`) is visually distinguishable
