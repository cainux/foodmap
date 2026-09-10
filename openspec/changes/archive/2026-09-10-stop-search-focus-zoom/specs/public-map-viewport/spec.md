## Purpose

Defines the public map's viewport contract on a touch device: that the site never leaves a
visitor at a zoom level they have no way to return from. The map claims pinch gestures for
its own zoom and, installed to the home screen, runs without browser chrome offering a
zoom reset — so a page zoom the site provokes is a page zoom the visitor is stuck with.

## ADDED Requirements

### Requirement: The site never provokes a page zoom it cannot undo
The public site SHALL NOT take any action that causes the browser to change the page's
zoom level. Because the map surface claims pinch gestures for map zoom, and because the
installed site presents no browser chrome offering a zoom reset, a page zoom once applied
cannot be reversed by the visitor. The site therefore avoids provoking one rather than
relying on an escape from it.

#### Scenario: Focusing the search field leaves the page scale unchanged
- **WHEN** the visitor taps into the restaurant search field on a phone
- **THEN** the page remains at the same zoom level, and the field is usable at that zoom

#### Scenario: The installed app is never left zoomed
- **WHEN** the visitor uses the site installed to the home screen and interacts with every control it offers
- **THEN** the page is never left at a zoom level other than the one it started at

### Requirement: Form controls are rendered at or above the browsers' focus-zoom threshold
Every form control the public site renders SHALL use a text size of at least 16px. Mobile
browsers automatically zoom the page when a control smaller than this receives focus, so
any control below the threshold reintroduces a zoom the visitor cannot undo.

#### Scenario: The search field meets the threshold
- **WHEN** the restaurant search field is rendered
- **THEN** its text size is at least 16px

#### Scenario: A restyle below the threshold is a defect
- **WHEN** any form control on the public site is rendered with a text size below 16px
- **THEN** the site does not satisfy this requirement, regardless of how the control looks

### Requirement: Deliberate zoom remains available to the visitor
The site SHALL NOT disable the browser's own zoom controls in order to satisfy the
requirements above. Suppressing zoom would deny it to visitors who need it to read the
page, so the trap is removed by not triggering zoom rather than by forbidding it.

#### Scenario: Pinch zoom is not disabled at the page level
- **WHEN** the site is loaded
- **THEN** the browser's zoom is not restricted by a maximum scale or a user-scalable prohibition
