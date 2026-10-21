# public-app-shell Specification

## Purpose

Defines how the public site is installed and launched as an app, and guarantees that it
never serves restaurant data from an offline cache, so a visitor always sees what was
most recently published.

## Requirements

### Requirement: Installable as a standalone app
The public site SHALL publish a web app manifest that allows it to be installed to a
device home screen and launched in standalone display mode, without browser navigation
chrome.

#### Scenario: Installed site launches without browser chrome
- **WHEN** a visitor installs the public site to their device and launches it from the home screen
- **THEN** the site opens in standalone display mode with no browser address bar or navigation controls

#### Scenario: Site remains usable in a normal browser tab
- **WHEN** a visitor opens the public site in an ordinary browser tab instead of installing it
- **THEN** the map and restaurant list are available and behave identically to the installed app

### Requirement: No offline caching of the site or its data
The public site SHALL NOT register a service worker or otherwise serve its pages or
restaurant data from an offline cache. The restaurant list is the site's content, and a
cache that outlives a publish would show visitors restaurants that have since been
removed or changed, with no indication that the list is out of date.

#### Scenario: A publish is visible on the next load
- **WHEN** a new version of the site has been published and a visitor who has previously used the site, installed or not, next loads it while online
- **THEN** the site shows the newly published restaurants rather than a previously cached list

#### Scenario: No service worker is registered
- **WHEN** a visitor loads the public site
- **THEN** no service worker is registered for the site's origin

#### Scenario: Offline load fails visibly
- **WHEN** a visitor opens the public site with no network connection and the browser has no ordinary HTTP-cached copy
- **THEN** the site does not present a stored restaurant list as current, and the browser's own offline failure is shown
