## 1. Logout

- [ ] 1.1 Add a logout route/action (`POST /auth/logout`) that calls `client.revoke(did)`, deletes the `foodmap_admin_session` cookie, and redirects to `/auth/login`
- [ ] 1.2 Confirm a logged-out admin hitting any gated page is redirected to login via the existing `hooks.server.ts` check (no change expected, just verify)

## 2. Identity for the nav

- [ ] 2.1 Add `admin/src/routes/+layout.server.ts` that resolves the signed-in handle (mirroring `identityResolver.resolve` in `auth/callback/+server.ts`) and returns it to the layout
- [ ] 2.2 Ensure the layout load is skipped/harmless on `/auth/login` (already a public path in `hooks.server.ts`)

## 3. Split add-restaurant onto its own route

- [ ] 3.1 Create `admin/src/routes/restaurants/new/+page.server.ts` with the `load` (restaurants list, for duplicate checking) and `create` action moved from `admin/src/routes/+page.server.ts`
- [ ] 3.2 Create `admin/src/routes/restaurants/new/+page.svelte` rendering `RestaurantForm` (moved from the home page)
- [ ] 3.3 Trim `admin/src/routes/+page.svelte` and `+page.server.ts` to search/list only, removing the add-form section and `create` action

## 4. Navigation bar

- [ ] 4.1 Build the nav markup in `admin/src/routes/+layout.svelte`: brand/title, links to Restaurants (`/`), Add Restaurant (`/restaurants/new`), and Publish (`/publish`), signed-in handle, and a logout form/button posting to the logout route
- [ ] 4.2 Mark the active link based on `page.url.pathname`
- [ ] 4.3 Hide the nav entirely on `/auth/login`
- [ ] 4.4 Add the hamburger toggle for viewports narrower than `900px`, using a `$state` boolean; try open/close animation approaches in-browser and pick one (native disclosure, CSS transition, or instant toggle) per design.md's Open Questions
- [ ] 4.5 Close the mobile panel on navigation (e.g. via SvelteKit's `afterNavigate`)
- [ ] 4.6 Single-row layout at `900px` and above, matching the breakpoint used in `+page.svelte`

## 5. Cleanup

- [ ] 5.1 Remove the "Back to list" link from `admin/src/routes/publish/+page.svelte`
- [ ] 5.2 Remove the "Back to list" link from `admin/src/routes/restaurants/[id]/edit/+page.svelte`

## 6. Verification

- [ ] 6.1 Manually verify nav appears on restaurant list, add-restaurant, edit, and publish pages, and not on login
- [ ] 6.2 Manually verify active-link indication on each page
- [ ] 6.3 Manually verify hamburger collapse below 900px and single-row layout at/above 900px
- [ ] 6.4 Manually verify logout clears the session and redirects to login, and that a subsequent visit to `/` redirects back to login
- [ ] 6.5 Manually verify adding a restaurant from `/restaurants/new` works, including duplicate warning
- [ ] 6.6 Run `pnpm check` in `admin/`
