## MODIFIED Requirements

### Requirement: Restaurant record schema
The system SHALL store each restaurant as a record with: a unique identifier, name,
coordinates (latitude and longitude, each with at least 15 decimal places of precision), a
Google Maps URL, zero or more freeform tags, and an optional multiline comment. Name,
coordinates, and URL are required; tags and comment are optional.

#### Scenario: Coordinate precision is preserved
- **WHEN** a restaurant is saved with coordinates captured at 15 decimal places
- **THEN** reading the record back returns coordinates at the same precision, unrounded

#### Scenario: Optional fields may be omitted
- **WHEN** a restaurant is created with only a name, coordinates, and a Google Maps URL
- **THEN** the record is saved successfully with the tags and comment left empty

#### Scenario: Required fields may not be omitted
- **WHEN** a restaurant is created without a name, without coordinates, or without a Google Maps URL
- **THEN** the record is not saved
