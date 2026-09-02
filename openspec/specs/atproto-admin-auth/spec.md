## Purpose

Restricts access to the admin area to a single owner-controlled allow-list of Bluesky (AT Protocol) handles, using Bluesky sign-in as the identity check rather than a separate password.

## Requirements

### Requirement: Sign-in via Bluesky OAuth
The system SHALL let a visitor authenticate using their Bluesky account via AT Protocol OAuth, without requiring a separate username/password for this site. The resulting session SHALL persist independently of any single server process, so it survives that process being recycled or restarted.

#### Scenario: Successful sign-in
- **WHEN** a visitor completes the Bluesky OAuth flow with a valid Bluesky account
- **THEN** the system resolves their DID and handle and establishes a session for them

#### Scenario: Session survives a server process restart
- **WHEN** an admin has an active, unexpired session and the server process handling their requests is restarted or replaced
- **THEN** their next request is still recognized as signed in, without being redirected to the Bluesky sign-in flow

#### Scenario: Expired session requires re-authentication
- **WHEN** an admin's session has passed its expiry
- **THEN** they are redirected to the Bluesky sign-in flow, whether or not the underlying server process was restarted

### Requirement: Admin access restricted to an allow-list
The system SHALL grant access to `/admin` only to handles present in a configured allow-list, and SHALL deny access to any other authenticated handle.

#### Scenario: Allow-listed handle is granted access
- **WHEN** a visitor signs in with a Bluesky handle present in the allow-list
- **THEN** they are granted access to `/admin`

#### Scenario: Non-allow-listed handle is denied access
- **WHEN** a visitor signs in with a Bluesky handle not present in the allow-list
- **THEN** they are denied access to `/admin` and are not granted an admin session

#### Scenario: Unauthenticated visitor is redirected
- **WHEN** an unauthenticated visitor requests `/admin`
- **THEN** they are redirected to the Bluesky sign-in flow

### Requirement: Allow-list is environment configuration, not source code
The system SHALL read the allow-list from environment configuration (not the database, and not a file committed to the source repository), so that who has admin access is never visible in the public codebase.

#### Scenario: Allow-list is absent from the repository
- **WHEN** the source repository is inspected
- **THEN** no file in it lists the allow-listed handles

#### Scenario: Allow-list change takes effect without a code change
- **WHEN** a handle is added to or removed from the allow-list configuration
- **THEN** that change takes effect without requiring a commit or source code change

### Requirement: Explicit sign-out
The system SHALL allow a signed-in admin to explicitly end their session, clearing the session cookie and revoking the underlying OAuth session.

#### Scenario: Admin logs out
- **WHEN** a signed-in admin activates logout
- **THEN** the session cookie is cleared, the OAuth session is revoked, and the admin is redirected to the login page

#### Scenario: Logged-out admin cannot access admin pages
- **WHEN** an admin who has logged out attempts to view an authenticated admin page
- **THEN** they are redirected to the login page, as with any unauthenticated visitor
