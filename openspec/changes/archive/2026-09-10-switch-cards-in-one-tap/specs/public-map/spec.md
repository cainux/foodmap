## MODIFIED Requirements

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

## ADDED Requirements

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
