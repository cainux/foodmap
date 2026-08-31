## Why

Restaurant data currently lives in `data/restaurants.yaml` and can only be edited by committing to git from a dev machine. The goal is to add places in the moment, while standing at the restaurant, from a phone — which requires a remote-editable, authenticated admin surface backed by a real datastore instead of a file in the repo.

## What Changes

- **BREAKING**: Replace `data/restaurants.yaml` as the source of truth with a Cloudflare D1 database. The yaml file and its build-time parse step (`scripts/parse-restaurants.js`) are retired once data is migrated.
- Add a new, separate admin app deployed as a Cloudflare Worker (`@sveltejs/adapter-cloudflare`), hosting `/admin` — server-rendered, authenticated. The existing public site keeps `adapter-static` and its current deploy shape unchanged; it becomes its own Cloudflare Pages project.
- Add a `/admin` area, gated by Bluesky (AT Protocol) OAuth, restricted to an allow-list of handles configured as a Cloudflare environment variable (set via the Cloudflare dashboard/API, not committed to the repository).
- Add restaurant CRUD (create/edit/delete) via `/admin`: a responsive single layout (form + list, stacked on mobile / side-by-side on desktop) rather than separate mobile/desktop pages.
- Add a "use current location" button on the add/edit form that fills coordinates from `navigator.geolocation` at 15 decimal places; coordinates remain manually editable.
- Add a soft duplicate warning on add: flag existing restaurants within a small radius of the entered coordinates (reusing `src/lib/geo.ts`'s distance calculation), non-blocking.
- Add a manual "publish" control in `/admin`: admin writes (create/edit/delete) do not automatically rebuild the public site; the admin explicitly triggers a call to the public site's Cloudflare Pages Deploy Hook when ready, so multiple edits can be batched before the ~30-60s rebuild, preserving the current fully-static, offline-capable public experience.
- One-time data migration: seed D1 from the existing `restaurants.yaml` via `wrangler d1 execute`.

## Capabilities

### New Capabilities
- `restaurant-data`: D1-backed restaurant storage (schema, CRUD operations, migration from yaml) replacing the yaml/generated-json pipeline.
- `atproto-admin-auth`: Bluesky OAuth sign-in restricted to an allow-list of handles, gating access to `/admin`.
- `admin-restaurant-management`: the `/admin` UI itself — add/edit/delete restaurants, geolocation capture, duplicate warning, responsive layout.
- `manual-publish`: an explicit "publish" control in `/admin` that triggers a Cloudflare Pages rebuild on demand, so the public site reflects D1 changes only when the admin chooses.

### Modified Capabilities
(none — no existing specs predate this change)

## Impact

- **Removed**: `data/restaurants.yaml`, `scripts/parse-restaurants.js`, the `parse:restaurants` pre-step in `dev`/`build` scripts.
- **Added dependencies**: `@atproto/oauth-client`, `@atproto/oauth-types`, `@atproto/jwk-webcrypto`, `@atproto/jwk-jose`, a D1 client (e.g. `drizzle-orm` + D1 driver), Cloudflare's SvelteKit adapter.
- **Patched dependencies**: `@atproto/oauth-client`, `@atproto-labs/did-resolver`, `@atproto-labs/handle-resolver` need a `redirect: 'error'` → `redirect: 'manual'` pnpm patch, since `workerd` doesn't implement `redirect: 'error'`.
- **New infra**: a Cloudflare D1 database, a new Cloudflare Worker (the admin app, separate `wrangler.jsonc`) and Cloudflare Pages Deploy Hook on the existing public site's project.
- **New deployment target**: a second deployable app (admin), alongside the existing public site — two deploy pipelines instead of one, in exchange for keeping the public site's static/offline characteristics fully unchanged.
- **Affected code**: the public site's build step (`scripts/parse-restaurants.js` or its replacement) switches its data source from parsing `restaurants.yaml` to reading D1 at build time; `src/routes/+page.svelte` and `src/lib/components/RestaurantMap.svelte` are otherwise unaffected since they still consume prerendered static output.
