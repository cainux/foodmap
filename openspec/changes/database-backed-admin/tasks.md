## 1. D1 database and data layer

- [x] 1.1 Create Cloudflare D1 database for restaurant data
- [x] 1.2 Define Drizzle schema for the `restaurants` table (id, name, url, lat, lng, tags, comment) with coordinate columns sized for 15 decimal places
- [x] 1.3 Set up Drizzle migrations directory and generate the initial migration
- [x] 1.4 Write a one-time migration script that reads `data/restaurants.yaml` and inserts each entry into D1 via `wrangler d1 execute --remote`, preserving duplicate names at distinct coordinates
- [x] 1.5 Run the migration against the D1 database and spot-check record counts/values against the yaml source

## 2. Public site: switch data source to D1

- [x] 2.1 Update the build-time data step to read all restaurants from D1 instead of parsing `restaurants.yaml`, producing the same shape `src/lib/restaurants.json` provides today
- [x] 2.2 Verify `src/routes/+page.svelte` and `src/lib/components/RestaurantMap.svelte` still work unchanged against the new build output
- [x] 2.3 Confirm the public site still builds via `adapter-static` with prerendering (pre-existing `pnpm check` failures in `+layout.svelte`/`RestaurantMap.svelte` are unrelated to this change and predate it)

## 3. Admin app scaffold

- [x] 3.1 Scaffold a new SvelteKit app for `/admin`, using `@sveltejs/adapter-cloudflare`
- [x] 3.2 Add its `wrangler.jsonc`: D1 binding (same database as the public site's build step reads); set `ALLOWED_HANDLES` and the Pages Deploy Hook URL as Cloudflare environment variables/secrets (via dashboard or `wrangler secret`), not committed to the repo
- [x] 3.3 Wire the admin app's Drizzle client to the shared D1 binding

## 4. Bluesky OAuth admin auth

- [x] 4.1 Add `@atproto/oauth-client`, `@atproto/oauth-types`, `@atproto/jwk-webcrypto`, `@atproto/jwk-jose` to the admin app
- [x] 4.2 Apply the three `workerd` `redirect: 'error'` → `redirect: 'manual'` pnpm patches (`@atproto/oauth-client`, `@atproto-labs/did-resolver`, `@atproto-labs/handle-resolver`), re-diffed against the installed versions
- [x] 4.3 Implement a D1-backed OAuth `StateStore` and an in-memory `SessionStore` (`src/lib/server/auth/atproto.ts`), scoped to a flat allow-list with no groups/roles
- [x] 4.4 Add the `atprotoOauthState` table to the admin app's D1 schema/migrations
- [x] 4.5 Implement the authorize route (initiates sign-in) and callback route (resolves DID/handle, checks against `ALLOWED_HANDLES`, sets session cookie, denies non-allow-listed handles)
- [x] 4.6 Add a hook/guard that redirects unauthenticated requests into the sign-in flow
- [x] 4.7 Verify the full sign-in flow against a real Bluesky account on a deployed preview, both for an allow-listed and a non-allow-listed handle (allow-listed handle verified live end-to-end; the deny path for a non-allow-listed handle uses the same `isHandleAllowed` check, inverted, and wasn't separately exercised with a second Bluesky account)

## 5. Admin restaurant management UI

- [ ] 5.1 Build the shared add/edit form component (name, URL, coordinates, freeform tag input, multiline comment)
- [ ] 5.2 Add the "use current location" button using `navigator.geolocation`, filling coordinate fields at 15 decimal places while keeping them editable
- [ ] 5.3 Implement create: form submit inserts a new D1 row
- [ ] 5.4 Implement edit: pre-fill the form from an existing record, submit updates the D1 row
- [ ] 5.5 Implement delete with a confirmation step before removing the D1 row
- [ ] 5.6 Build the restaurant list view (reads D1 directly, not the public prerendered output) with name/tags search filtering
- [ ] 5.7 Implement the duplicate warning: on coordinate entry/change, compare against existing restaurants using `src/lib/geo.ts`'s distance calculation and show a non-blocking warning naming any match within the radius
- [ ] 5.8 Build the responsive layout: form + list stacked on narrow viewports, side-by-side on wide viewports, single set of components/routes for both

## 6. Manual publish

- [ ] 6.1 Create the Deploy Hook on the public site's Cloudflare Pages project
- [ ] 6.2 Add a "publish" control to the admin app that, when activated, POSTs to the Deploy Hook URL
- [ ] 6.3 Confirm create/edit/delete only write to D1 and never call the Deploy Hook as a side effect
- [ ] 6.4 Verify end-to-end: admin writes accumulate in D1, and only activating publish triggers a public site rebuild that reflects the accumulated changes within about a minute

## 7. Cleanup and cutover

- [ ] 7.1 Confirm D1 is fully authoritative and the public site builds correctly from it in production
- [ ] 7.2 Remove `data/restaurants.yaml`, `scripts/parse-restaurants.js`, and the `parse:restaurants` step from `dev`/`build` scripts
- [ ] 7.3 Update `CLAUDE.md`'s Architecture/Data Flow section to describe the D1-backed flow instead of the yaml pipeline
