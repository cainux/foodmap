## ADDED Requirements

### Requirement: Explicit sign-out
The system SHALL allow a signed-in admin to explicitly end their session, clearing the session cookie and revoking the underlying OAuth session.

#### Scenario: Admin logs out
- **WHEN** a signed-in admin activates logout
- **THEN** the session cookie is cleared, the OAuth session is revoked, and the admin is redirected to the login page

#### Scenario: Logged-out admin cannot access admin pages
- **WHEN** an admin who has logged out attempts to view an authenticated admin page
- **THEN** they are redirected to the login page, as with any unauthenticated visitor
