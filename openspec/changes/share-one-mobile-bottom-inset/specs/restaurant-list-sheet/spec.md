## MODIFIED Requirements

### Requirement: The sheet's targets stay clear of the system gesture area
No part of the sheet that responds to touch SHALL occupy the strip along the bottom of the
screen that the operating system reserves for its own edge gestures. The sheet's surface
MAY extend to the bottom edge so that no gap appears beneath it, but the portion within
that strip SHALL be inert: touching it SHALL neither open, close, nor drag the sheet.

That clearance SHALL be provided only where it is needed. When the sheet is open its
handle is nowhere near the bottom of the screen, so the clearance SHALL NOT consume space
between the handle and the list: the open sheet's spacing SHALL be unaffected by it.

#### Scenario: A home swipe does not reach the handle
- **WHEN** the visitor swipes up from the bottom edge of the screen with the list collapsed
- **THEN** the swipe begins on inert surface, not on the handle

#### Scenario: The sheet still meets the bottom edge
- **WHEN** the list is collapsed on a phone
- **THEN** the sheet's surface reaches the bottom of the screen with no gap showing the map beneath it

#### Scenario: The open sheet is not padded by the clearance
- **WHEN** the restaurant list is open on a phone
- **THEN** the space between the grab handle and the first restaurant card is as it would be with no gesture clearance at all

#### Scenario: The last card is reachable when the list is open
- **WHEN** the restaurant list is open and scrolled to the end
- **THEN** the final restaurant card is fully visible and tappable outside the system gesture area

## ADDED Requirements

### Requirement: One clearance governs every element at the bottom edge
The clearance kept from the system gesture area SHALL be defined once and read by every
element positioned against the bottom of the screen. An element that must clear that strip
SHALL NOT carry its own independently chosen value, so that changing the clearance cannot
leave one element correct and another overlapping.

#### Scenario: The map's controls clear the collapsed sheet
- **WHEN** the restaurant list is collapsed on a phone
- **THEN** the map's floating location control is fully visible above the sheet, overlapping neither the sheet nor the system gesture area

#### Scenario: The location control stays put when the list opens
- **WHEN** the visitor opens the restaurant list
- **THEN** the location control remains where it was rather than moving with the sheet

#### Scenario: Changing the clearance moves every element together
- **WHEN** the clearance is changed to a different measurement
- **THEN** every element positioned against the bottom edge adjusts by that same amount, with no element left behind

### Requirement: The grab handle does not present itself as text
The grab handle SHALL NOT be selectable as text, and touching it SHALL NOT paint a
selection or tap highlight. It carries no text and exists only to be dragged or tapped, so
a selection offers the visitor nothing and appears as an artefact. The handle SHALL remain
operable and visibly focusable by keyboard.

#### Scenario: Pressing the handle selects nothing
- **WHEN** the visitor presses and holds the grab handle, or drags across it
- **THEN** no text selection appears on or below the handle, and no tap highlight is painted

#### Scenario: Keyboard focus on the handle is still visible
- **WHEN** the visitor moves keyboard focus to the grab handle
- **THEN** a focus indicator is shown and the handle can still be operated from the keyboard
