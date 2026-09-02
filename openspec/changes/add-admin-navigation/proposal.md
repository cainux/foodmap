## Why

The admin app has no persistent navigation: the only way to reach Publish is a single inline text link on the home page, there's no way back from Publish or the edit page except a duplicated "Back to list" link, and there's no way to log out at all. As more admin tasks accumulate, this ad-hoc linking won't scale and is already unclear to use.

## What Changes

- Add a persistent top navigation bar, rendered in `+layout.svelte` on every authenticated page (not on `/auth/login`), linking Restaurants (`/`) and Publish (`/publish`), with the current page indicated.
- Add a logout control to the navigation, showing the signed-in identity and a "Log out" action.
- Add a logout route/action that clears the `foodmap_admin_session` cookie and revokes the OAuth session (mirroring the existing revoke path in the callback route), since no logout mechanism currently exists.
- Navigation is mobile-first and responsive: collapses behind a hamburger toggle below the existing `900px` breakpoint (matching the breakpoint already used in `+page.svelte`), single-row above it.
- Remove the now-redundant inline "Publish changes to the public site" and "Back to list" links once the nav covers that navigation.
- "Add restaurant" remains inline on the Restaurants page, not a nav destination.

## Capabilities

### New Capabilities
- `admin-navigation`: persistent, responsive top navigation for the admin app (links, active-page indication, mobile hamburger collapse, signed-in identity display).

### Modified Capabilities
- `atproto-admin-auth`: adds a requirement for an explicit logout action that clears the session cookie and revokes the OAuth session.

## Impact

- `admin/src/routes/+layout.svelte` - add nav markup/logic.
- `admin/src/routes/+page.svelte`, `admin/src/routes/publish/+page.svelte`, `admin/src/routes/restaurants/[id]/edit/+page.svelte` - remove redundant inline links.
- New logout route (e.g. `admin/src/routes/auth/logout/+server.ts`) plus a call into `client.revoke` / cookie deletion.
- No changes to the public site or D1 schema.
