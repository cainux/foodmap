## Why

Five brands in the database now have two locations each — Pizza Union, JWD Lamian, Ippudo,
Haidilao Hot Pot and Grounded — and more are being added. The schema has no way to express
"same brand, different location", so the problem has been worked around three different ways
at once:

- **Identical names.** Those five pairs are stored as two records with byte-identical `name`
  and `tags`. In the admin list they render as two indistinguishable rows; the only way to
  tell which is which is to open one.
- **A parenthetical suffix.** `CoCo Ichibanya` and `CoCo Ichibanya (Bond St)` — where the
  first branch is left anonymous, an asymmetry that gets worse with a third.
- **A bare suffix.** `Kova Aldgate`, with the location welded into the brand name.

The map is also affected: the popup reads only `name` from the GeoJSON feature properties, so
the two Ippudo pins produce two identical popups. The form's only existing duplicate check is
a 50 m proximity warning, which never fires for real branches because they are kilometres
apart.

## What Changes

- Add a nullable `branch` column to `restaurants`, holding a freeform location label such as
  `Soho` or `Bond St`. `name` stays the brand.
- Add an optional Branch field to the admin add/edit form, below Name.
- Order the admin restaurant list by name then branch, and render each row as
  `<name> — <branch>` (em dash) when a branch is set, so branches sort adjacently and read
  distinctly.
- Emit `branch` as its own field in the generated `src/lib/restaurants.json`, rather than
  concatenating it into `name`.
- Show the branch on the public site: as a sub-label on the sidebar card, and in the map
  popup — the latter being a correctness fix, since branch pins are currently
  indistinguishable once opened.

Explicitly **not** changing:

- **No backfill.** The thirteen affected rows keep their current values until edited by hand
  through the admin. This change delivers the mechanism, not the cleanup, so the five
  existing pairs stay indistinguishable in the admin list and rows 51 and 11 keep their
  baked-in suffixes until touched.
- **No search change.** Public site search continues to match name and tags only; admin
  search continues to match name only. A branch label will not surface a restaurant.
- **No enforcement.** Nothing will require a branch when a name collides, so a future
  `Ippudo` with no branch can still sit beside `Ippudo — Soho`. Accepted deliberately; the
  workflow stays manual.

## Capabilities

### New Capabilities

None. In particular, this change does **not** introduce a capability for the public site's
map and sidebar rendering. No such spec exists today, and creating one here would mean
documenting a large amount of existing unspecified behaviour as a side effect of adding one
field. The public-site rendering work is carried in `design.md` and `tasks.md` instead.

### Modified Capabilities

- `restaurant-data`: the restaurant record schema gains an optional branch label, and the
  data exposed to the public build carries it as a distinct field.
- `admin-restaurant-management`: the add and edit forms gain an optional branch field, and
  the restaurant list distinguishes records that share a name.

## Impact

**Depends on `consolidate-d1-schema`**, which gives `restaurants` a tracked migration path.
Without it there is nowhere safe to put the migration below.

**Database**
- `admin/drizzle/migrations/0004_add_branch.sql` — `ALTER TABLE restaurants ADD COLUMN
  branch TEXT`. Purely additive: no data statements, no backfill, no rewrite of existing
  rows.

**Admin**
- `admin/src/lib/server/db/schema.ts` — new column
- `admin/src/lib/server/db/queries.ts` — `listRestaurants` orders by name then branch
- `admin/src/lib/server/restaurantInput.ts` — parse, trim, echo back on failure, empty to
  `null`
- `admin/src/lib/components/RestaurantForm.svelte` — one optional text input
- `admin/src/routes/+page.svelte` — list row rendering

**Public site**
- `scripts/build-restaurants-data.js` — emit `branch`
- `src/lib/components/Sidebar.svelte` — card sub-label, and the local `Restaurant` interface
- `src/lib/components/RestaurantMap.svelte` — GeoJSON feature properties, popup, and the
  local `Restaurant` interface

**Deployment**
- Migration must be applied before the admin worker is deployed, per `AGENTS.md`: the
  layout's server load runs on every authenticated page, so a worker reading a column that
  does not yet exist fails the whole admin.
- The public site only picks up the new field on its next publish.
