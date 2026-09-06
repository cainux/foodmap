## 1. Database

- [x] 1.1 Confirm `consolidate-d1-schema` has landed and been applied to remote — this
      change's migration has no tracked home without it.
- [x] 1.2 Create `admin/drizzle/migrations/0004_add_branch.sql` containing
      `ALTER TABLE restaurants ADD COLUMN branch TEXT;`. No data statements, no backfill.
- [x] 1.3 Add `branch: text('branch')` to the `restaurants` table in
      `admin/src/lib/server/db/schema.ts`. Nullable — do not add `.notNull()` or a default.
- [x] 1.4 Apply the migration to a local D1 and confirm the column exists and existing rows
      read back with a null branch.

## 2. Admin data layer

- [x] 2.1 In `admin/src/lib/server/db/queries.ts`, change `listRestaurants` to order by
      `restaurants.name` then `restaurants.branch`. `NewRestaurant` and `Restaurant` pick
      the column up from `$inferInsert`/`$inferSelect` and need no edit.
- [x] 2.2 In `admin/src/lib/server/restaurantInput.ts`, add `branch` to
      `RestaurantFormValues`, read and trim it from the `FormData` alongside the other
      fields, and map an empty string to `null` in the returned `record` — matching how
      `comment` is already handled. Do not add it to `RestaurantInputField`: branch is never
      a validation failure.

## 3. Admin form

- [ ] 3.1 In `admin/src/lib/components/RestaurantForm.svelte`, add `branch` to the `start`
      snapshot and a `let branch = $state(start.branch)` alongside the existing fields.
- [ ] 3.2 Add an optional Branch text input immediately below the Name input. No `required`
      attribute and no `aria-invalid` binding. Label it so its purpose is clear on a phone —
      it names one location of a restaurant that has several.
- [ ] 3.3 Confirm the field round-trips on validation failure: submit the form with an
      invalid coordinate value and check the typed branch is echoed back rather than lost.

## 4. Admin list

- [ ] 4.1 In `admin/src/routes/+page.svelte`, render each row as `<name> — <branch>` using an
      em dash when a branch is set, and the name alone when it is not — no trailing
      separator, no empty branch.
- [ ] 4.2 Leave the search filter matching names only. Verify a query matching a branch label
      but not a name returns no results.
- [ ] 4.3 Verify two records sharing a name appear consecutively, ordered by branch.

## 5. Public site data

- [ ] 5.1 In `scripts/build-restaurants-data.js`, add `branch` to the mapped output using the
      same conditional-spread form as `comment`, so the key is omitted entirely when there is
      no branch.
- [ ] 5.2 Run `pnpm build:restaurants` and confirm `src/lib/restaurants.json` carries
      `branch` for branched records and omits the key otherwise.

## 6. Public site rendering

- [ ] 6.1 Add `branch?: string` to the local `Restaurant` interface in
      `src/lib/components/Sidebar.svelte` and render it as a sub-label next to the name in
      the card header. Style it as secondary to the name — the brand stays dominant.
- [ ] 6.2 Add `branch?: string` to the local `Restaurant` interface in
      `src/lib/components/RestaurantMap.svelte` and include the branch in the GeoJSON feature
      `properties`.
- [ ] 6.3 Use the branch in the map popup, so the two Ippudo pins no longer open identical
      popups. Handle the absent case without rendering a stray separator.
- [ ] 6.4 Leave the search filter in `src/routes/+page.svelte` matching name and tags only.

## 7. Verify

- [ ] 7.1 Run `pnpm check` at the root and in `admin/` — all three `Restaurant` type
      declarations must be in step.
- [ ] 7.2 Add a branch to one record locally, rebuild, and confirm it appears in the sidebar
      card and the map popup, and that unbranched records render unchanged.
- [ ] 7.3 Confirm a record saved with an empty branch is stored as null rather than an empty
      string, and renders with no trailing separator anywhere.

## 8. Deploy

- [ ] 8.1 Apply the migration to remote — `npx wrangler d1 migrations apply foodmap --remote`
      from `admin/` — BEFORE deploying the worker. The layout's server load runs on every
      authenticated page, so a worker selecting a missing column fails the whole admin.
- [ ] 8.2 Deploy the admin with `pnpm run deploy` from `admin/`. Note `run` is required.
- [ ] 8.3 Publish the public site so `restaurants.json` regenerates with the new field.
