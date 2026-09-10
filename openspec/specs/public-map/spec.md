# public-map Specification

## Purpose
Defines how the public map identifies restaurants in place, so that a visitor can read
what is around them without opening each marker in turn, and how those names behave when
they compete for the same space.

## Requirements

### Requirement: An individually shown restaurant is labelled with its name
When a restaurant is drawn on the map as an individual point rather than grouped with
its neighbours, the map SHALL display that restaurant's name adjacent to its point. The
label SHALL NOT be gated on reaching a particular zoom level; whether a restaurant is
shown individually is already a measure of how much room it has at the current view.

#### Scenario: An isolated restaurant shows its name
- **WHEN** the map displays a restaurant as an individual point with no neighbouring points near it
- **THEN** the restaurant's name is displayed next to that point

#### Scenario: A grouped restaurant shows no name
- **WHEN** several restaurants are close enough at the current view to be drawn as a single group
- **THEN** the group is shown with its count and no restaurant name is displayed for it

#### Scenario: The same zoom labels differently in different places
- **WHEN** the map is at one zoom level over a dense area and then over a sparse area
- **THEN** names are shown according to the room available in each area, not according to the zoom level being the same

### Requirement: The label shows the brand name only
The map label SHALL contain the restaurant's name and nothing else. A branch label, where
a restaurant record carries one, SHALL NOT be appended to the map label. Branch
information remains available in the restaurant's detail popup.

#### Scenario: A restaurant with a branch is labelled by name alone
- **WHEN** a restaurant that carries a branch label is displayed individually on the map
- **THEN** the map label shows only the brand name, and the branch is shown in the detail popup when the restaurant is opened

#### Scenario: Two locations of one brand are labelled identically
- **WHEN** two locations of the same brand are both displayed individually
- **THEN** both are labelled with the shared brand name, and opening either one distinguishes it in its detail popup

### Requirement: Names never obscure one another
Where two restaurant names would overlap, the map SHALL omit at least one of them rather
than draw them on top of each other. A restaurant whose name is omitted SHALL still be
drawn as a point, so that suppressing a label never removes a restaurant from the map.

#### Scenario: Crowded names are thinned
- **WHEN** two restaurants are close enough that their names would overlap
- **THEN** at most one of the two names is drawn, and both restaurants remain visible as points

#### Scenario: A suppressed name is recovered by zooming
- **WHEN** a restaurant's name is omitted because of crowding and the visitor zooms further in
- **THEN** the name is displayed once there is room for it

#### Scenario: Names stay legible over the underlying map
- **WHEN** a restaurant name is drawn over a busy part of the underlying map imagery
- **THEN** the name remains legible against what is behind it

### Requirement: The name is an interactive target
The displayed name SHALL be interactive in the same way as the point it labels. Selecting
a restaurant's name SHALL open the same restaurant detail as selecting its point, and the
name SHALL indicate that it is selectable on devices that show a pointer.

Selecting a restaurant SHALL open that restaurant's detail in a single interaction,
whether or not another restaurant's detail is already open. A selection SHALL NOT be
consumed by the dismissal of a previously open detail.

#### Scenario: Selecting a name opens the restaurant
- **WHEN** the visitor taps or clicks a restaurant's name on the map
- **THEN** that restaurant's detail popup opens, exactly as if its point had been tapped

#### Scenario: Selecting a second restaurant switches to it in one interaction
- **WHEN** one restaurant's detail is open and the visitor taps a different restaurant's point or name
- **THEN** the first restaurant's detail closes and the second restaurant's detail opens, from that one tap

#### Scenario: Reselecting the open restaurant leaves it open
- **WHEN** one restaurant's detail is open and the visitor taps that same restaurant's point or name again
- **THEN** that restaurant's detail remains open

#### Scenario: The pointer signals a selectable name
- **WHEN** a pointing device hovers over a restaurant's name
- **THEN** the cursor indicates that the name is selectable

### Requirement: At most one restaurant detail is shown at a time
The map SHALL display the detail of at most one restaurant at any moment. Opening a
restaurant's detail SHALL close any detail already open.

#### Scenario: Opening a restaurant closes the previous one
- **WHEN** the visitor opens one restaurant's detail and then opens another's
- **THEN** only the second restaurant's detail is shown

### Requirement: An open detail is dismissed by directing attention elsewhere
An open restaurant detail SHALL be dismissed when the visitor selects part of the map
that is not a restaurant, and when the visitor selects a group of restaurants. Expanding
a group changes the view beneath the visitor, which leaves an open detail describing
something no longer in front of them.

#### Scenario: Tapping the map background dismisses the detail
- **WHEN** a restaurant's detail is open and the visitor taps a part of the map carrying no restaurant point, name, or group
- **THEN** the detail closes and no other detail opens

#### Scenario: Tapping a group dismisses the detail
- **WHEN** a restaurant's detail is open and the visitor taps a group of restaurants
- **THEN** the detail closes and the map expands the group

#### Scenario: Panning with a detail open leaves it open
- **WHEN** a restaurant's detail is open and the visitor drags the map without selecting anything
- **THEN** the detail remains open
