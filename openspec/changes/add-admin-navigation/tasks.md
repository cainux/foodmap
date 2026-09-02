## 1. Logout

- [ ] 1.1 Add a logout route/action (`POST /auth/logout`) that calls `client.revoke(did)`, deletes the `foodmap_admin_session` cookie, and redirects to `/auth/login`
- [ ] 1.2 Add a `MODIFIED`/covered scenario check: confirm a logged-out admin hitting any gated page is redirected to login via the existing `hooks.server.ts` check (no change expected, just verify)

## 2. Identity for the nav

- [ ] 2.1 Add `admin/src/routes/+layout.server.ts` that resolves the signed-in handle (mirroring `identityResolver.resolve` in `auth/callback/+server.ts`) and returns it to the layout
- [ ] 2.2 Ensure the layout load is skipped/harmless on `/auth/login` (already a public path in `hooks.server.ts`)

## 3. Navigation bar

- [ ] 3.1 Build the nav markup in `admin/src/routes/+layout.svelte`: brand/title, links to Restaurants (`/`) and Publish (`/publish`), signed-in handle, and a logout form/button posting to the logout route
- [ ] 3.2 Mark the active link based on `page.url.pathname`
- [ ] 3.3 Hide the nav entirely on `/auth/login`
- [ ] 3.4 Add the hamburger toggle for viewports narrower than `900px`, using a `$state` boolean; try open/close animation approaches in-browser and pick one (native disclosure, CSS transition, or instant toggle) per design.md's Open Questions
- [ ] 3.5 Close the mobile panel on navigation (e.g. via SvelteKit's `afterNavigate`)
- [ ] 3.6 Single-row layout at `900px` and above, matching the breakpoint used in `+page.svelte`

## 4. Cleanup

- [ ] 4.1 Remove the inline "Publish changes to the public site" link from `admin/src/routes/+page.svelte`
- [ ] 4.2 Remove the "Back to list" link from `admin/src/routes/publish/+page.svelte`
- [ ] 4.3 Remove the "Back to list" link from `admin/src/routes/restaurants/[id]/edit/+page.svelte`

## 5. Verification

- [ ] 5.1 Manually verify nav appears on restaurant list, edit, and publish pages, and not on login
- [ ] 5.2 Manually verify active-link indication on each page
- [ ] 5.3 Manually verify hamburger collapse below 900px and single-row layout at/above 900px
- [ ] 5.4 Manually verify logout clears the session and redirects to login, and that a subsequent visit to `/` redirects back to login
- [ ] 5.5 Run `pnpm check` in `admin/`
