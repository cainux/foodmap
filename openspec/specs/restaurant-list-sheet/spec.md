# restaurant-list-sheet Specification

## Purpose
Defines how the restaurant list is revealed and dismissed on a phone — what the collapsed
sheet offers as a target, and how that target coexists with the operating system's own
edge gestures. Installed to the home screen the site runs against the bottom of the
screen, where the OS reserves a strip for its swipe-up home gesture.

## Requirements

### Requirement: The collapsed list is revealed by a persistent handle
When the restaurant list is collapsed on a phone, the sheet SHALL remain partly visible,
presenting a handle the visitor can drag upward or tap to open the list. The list SHALL
NOT collapse out of sight entirely, so that its existence and the means of opening it stay
apparent without a separate control.

#### Scenario: The collapsed sheet stays visible
- **WHEN** the restaurant list is collapsed on a phone
- **THEN** part of the sheet remains visible at the bottom of the screen, showing a handle

#### Scenario: Dragging the handle upward opens the list
- **WHEN** the visitor drags the handle upward and releases
- **THEN** the restaurant list opens

#### Scenario: Tapping the handle opens the list
- **WHEN** the visitor taps the handle without dragging
- **THEN** the restaurant list opens

### Requirement: The sheet's targets stay clear of the system gesture area
No part of the sheet that responds to touch SHALL occupy the strip along the bottom of the
screen that the operating system reserves for its own edge gestures. The sheet's surface
MAY extend to the bottom edge so that no gap appears beneath it, but the portion within
that strip SHALL be inert: touching it SHALL neither open, close, nor drag the sheet.

#### Scenario: A home swipe does not reach the handle
- **WHEN** the visitor swipes up from the bottom edge of the screen with the list collapsed
- **THEN** the swipe begins on inert surface, not on the handle

#### Scenario: The sheet still meets the bottom edge
- **WHEN** the list is collapsed on a phone
- **THEN** the sheet's surface reaches the bottom of the screen with no gap showing the map beneath it

#### Scenario: The last card is reachable when the list is open
- **WHEN** the restaurant list is open and scrolled to the end
- **THEN** the final restaurant card is fully visible and tappable outside the system gesture area

### Requirement: A gesture claimed by the operating system leaves the sheet unchanged
When the operating system takes over a touch gesture that began on the sheet, the sheet
SHALL return to the state it was in before the gesture began. A gesture that was taken
away was not a decision by the visitor, so it SHALL NOT open or close the list.

#### Scenario: A stolen swipe does not open the list
- **WHEN** the visitor swipes up from the bottom of the screen with the list collapsed and the operating system claims that gesture
- **THEN** the list remains collapsed, and is still collapsed when the visitor returns to the app

#### Scenario: A stolen drag leaves an open list open
- **WHEN** the restaurant list is open, the visitor begins dragging the sheet, and the operating system claims that gesture
- **THEN** the list returns to open rather than closing

#### Scenario: A completed drag is still honoured
- **WHEN** the visitor drags the sheet and releases it without the operating system intervening
- **THEN** the sheet opens or closes according to the direction of the drag
