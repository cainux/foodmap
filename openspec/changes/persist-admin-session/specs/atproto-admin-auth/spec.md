## MODIFIED Requirements

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
