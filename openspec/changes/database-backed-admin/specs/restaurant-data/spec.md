## Purpose

Stores restaurant records in a Cloudflare D1 database as the single source of truth, replacing the git-committed `restaurants.yaml` file, and exposes them to the public site's build process.

## ADDED Requirements

### Requirement: Restaurant record schema
The system SHALL store each restaurant as a record with: a unique identifier, name, coordinates (latitude and longitude, each with at least 15 decimal places of precision), an optional Google Maps URL, zero or more freeform tags, and an optional multiline comment.

#### Scenario: Coordinate precision is preserved
- **WHEN** a restaurant is saved with coordinates captured at 15 decimal places
- **THEN** reading the record back returns coordinates at the same precision, unrounded

#### Scenario: Optional fields may be omitted
- **WHEN** a restaurant is created with only a name and coordinates
- **THEN** the record is saved successfully with the URL, tags, and comment left empty

### Requirement: Restaurant records are queryable for the public build
The system SHALL allow reading all restaurant records in a form the public site's build process can consume to generate the static restaurant listing, equivalent to what `restaurants.yaml` provided today.

#### Scenario: Build reads current data
- **WHEN** the public site is built
- **THEN** the build process reads all current restaurant records from the database instead of parsing a yaml file

### Requirement: One-time migration from yaml
The system SHALL provide a way to migrate all existing restaurants from `data/restaurants.yaml` into the database, preserving name, url, coordinates, tags, and comment for every entry, including duplicate names at different coordinates.

#### Scenario: Migration preserves duplicate names
- **WHEN** the yaml source contains two entries both named "Pizza Union" at different coordinates
- **THEN** the migration creates two distinct database records, one per coordinate pair
