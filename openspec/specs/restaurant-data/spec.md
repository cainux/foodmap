## Purpose

Stores restaurant records in a Cloudflare D1 database as the single source of truth, and exposes them to the public site's build process.

## Requirements

### Requirement: Restaurant record schema
The system SHALL store each restaurant as a record with: a unique identifier, name,
coordinates (latitude and longitude, each with at least 15 decimal places of precision), a
Google Maps URL, zero or more freeform tags, an optional branch label, and an optional
multiline comment. Name, coordinates, and URL are required; tags, branch, and comment are
optional. The branch label is freeform text identifying one location of a restaurant that
has more than one, and the name SHALL remain the brand rather than absorbing the branch.

#### Scenario: Coordinate precision is preserved
- **WHEN** a restaurant is saved with coordinates captured at 15 decimal places
- **THEN** reading the record back returns coordinates at the same precision, unrounded

#### Scenario: Optional fields may be omitted
- **WHEN** a restaurant is created with only a name, coordinates, and a Google Maps URL
- **THEN** the record is saved successfully with the tags, branch, and comment left empty

#### Scenario: Required fields may not be omitted
- **WHEN** a restaurant is created without a name, without coordinates, or without a Google Maps URL
- **THEN** the record is not saved

#### Scenario: Two locations of one brand are distinct records
- **WHEN** two restaurants are saved with the same name, different coordinates, and different branch labels
- **THEN** both records are stored, sharing a name and differing by branch

#### Scenario: Branch is optional for a single-location restaurant
- **WHEN** a restaurant that has only one location is saved with no branch label
- **THEN** the record is stored with an empty branch, and the restaurant is identified by its name alone

#### Scenario: Existing records without a branch remain valid
- **WHEN** the branch label is introduced to a database of existing restaurant records
- **THEN** every existing record remains readable and valid with an empty branch, and no existing field value is altered

### Requirement: Restaurant records are queryable for the public build
The system SHALL allow reading all restaurant records in a form the public site's build
process can consume to generate the static restaurant listing, equivalent to what
`restaurants.yaml` provided today. The branch label SHALL be exposed as a field distinct
from the name, so that consumers can present or ignore it independently.

#### Scenario: Build reads current data
- **WHEN** the public site is built
- **THEN** the build process reads all current restaurant records from the database instead of parsing a yaml file

#### Scenario: Branch is exposed separately from name
- **WHEN** the build reads a restaurant that has a branch label
- **THEN** the generated data carries the brand name and the branch label as two distinct fields, with the branch not concatenated into the name

#### Scenario: Absent branch is distinguishable from an empty one
- **WHEN** the build reads a restaurant that has no branch label
- **THEN** the generated data marks the branch as absent rather than emitting an empty label to be rendered
