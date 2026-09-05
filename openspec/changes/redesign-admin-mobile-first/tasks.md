## 1. Publish-state data layer

- [x] 1.1 Add a `publish_state` table to `admin/src/lib/server/db/schema.ts`: `id` (integer PK, always 1), `last_mutated_at`, `last_published_at`, `last_deployment_id`, all nullable
- [x] 1.2 Generate the migration into `admin/drizzle/migrations/` and seed the single row with null timestamps, so the admin reports "never published" until the first publish
- [x] 1.3 Add `getPublishState`, `touchMutation`, and `recordPublish(deploymentId)` to `admin/src/lib/server/db/queries.ts`
- [x] 1.4 Bump the mutation timestamp inside `createRestaurant`, `updateRestaurant`, and `deleteRestaurant` themselves — not at their call sites — so a future write path cannot omit it
- [x] 1.5 Apply the migration to the local D1 and confirm a create, an edit, and a delete each move `last_mutated_at`

## 2. Shared coordinate parsing

- [x] 2.1 Move coordinate parsing into `admin/src/lib/geo.ts`, returning an explicit valid/invalid result rather than a null pair, so callers cannot mistake a parse failure for absent data
- [x] 2.2 Delete the duplicate `parseCoordinates` from `restaurants/new/+page.server.ts` and `restaurants/[id]/edit/+page.server.ts` and call the shared parser
- [x] 2.3 Replace the inline regex in `RestaurantForm.svelte` with the shared parser so client and server agree by construction

## 3. App shell

- [x] 3.1 Create `admin/static/` with `icon.svg` — the public site's rounded-square structure with the 🍽️ glyph on `#37474f` — and a favicon, resolving the `favicon.png` 404 `app.html` already has
- [x] 3.2 Add a web app manifest (name, `display: standalone`, `theme_color`, icon) and link it from `app.html`
- [x] 3.3 Add `viewport-fit=cover` and a `theme-color` meta to `app.html`
- [x] 3.4 Confirm no service worker is registered and no runtime caching is introduced
- [x] 3.5 Rewrite `+layout.svelte` as a persistent header plus a fixed bottom tab bar (Restaurants, Add, Publish)
- [x] 3.6 Delete the hamburger toggle, `menuOpen` state, `afterNavigate` reset, `.admin-nav-links.open` logic, the `display: flex !important` override, and the `min-width: 900px` block
- [x] 3.7 Drive the header's screen title per route
- [x] 3.8 Add a compact logout control to the header; do not render the signed-in handle anywhere in persistent chrome
- [x] 3.9 Inset the tab bar clear of device safe areas
- [x] 3.10 Constrain content to a centred column so wide viewports show the same layout rather than a stretched one
- [x] 3.11 Confirm the login page renders without header or tab bar

## 4. Submission feedback

- [x] 4.1 Add `use:enhance` to the create action with a pending state that disables the submit control
- [x] 4.2 Add a creation-success `<dialog>` naming the saved restaurant, with "Add another" and "Back to list" in its footer
- [x] 4.3 Make "Add another" present an empty form retaining no previous values
- [x] 4.4 Add `use:enhance` and success confirmation to the edit action
- [x] 4.5 Replace the inline delete confirmation with a `<dialog>` that takes focus, with cancel as the dominant option and dismissal leaving the record intact
- [x] 4.6 Add `use:enhance` with a pending state to the publish and sign-in actions
- [x] 4.7 On failure, re-enable controls and preserve entered values on every form
- [ ] 4.8 Verify each form still submits and reports its outcome with client-side scripting disabled, including a server-rendered open dialog

## 5. Restaurant form

- [x] 5.1 Reject submissions missing name, URL, or coordinates in both the create and update actions with `fail(400)` identifying the missing field
- [x] 5.2 Reject unparseable coordinates server-side; never store empty latitude/longitude in place of an unparsed value
- [x] 5.3 Mark the coordinate field `aria-invalid` with a message when parsing fails, and block submission client-side
- [x] 5.4 Keep coordinates as a single `lat,lng` field with one validation message
- [x] 5.5 Offer the tags already used by existing restaurants via a native `<datalist>`, still accepting new tags
- [x] 5.6 Demote the duplicate-proximity warning from `role="alert"` to advisory presentation, leaving it non-blocking

## 6. Restaurant list

- [x] 6.1 Filter by name in the browser as the admin types; delete the `q` search-param handling from `+page.server.ts`
- [x] 6.2 Stop matching tags in search
- [x] 6.3 Show the number of restaurants currently listed
- [x] 6.4 Show an explicit no-matches state instead of an empty list
- [x] 6.5 Render rows as `<article>` tap targets
- [x] 6.6 Remove the `<h1>` that duplicates the header title

## 7. Publish screen

- [x] 7.1 Load publish state and derive never-published, up-to-date, or changes-pending
- [x] 7.2 Render the derived state with the last-changed and last-published times, keeping publish available when up to date
- [x] 7.3 Record the publish timestamp only when the deploy hook accepts the request, leaving it unchanged on failure
- [x] 7.4 Parse the deployment identifier from the hook response and store it; treat the field as optional and never fail a publish over it
- [x] 7.5 Reword the confirmation to claim only that a publish was requested, dropping the assertion that the site will finish rebuilding
- [x] 7.6 Show a pending-changes indicator on the Publish tab, cleared once a publish is recorded with no later mutation

## 8. Visual consistency

- [x] 8.1 Assign button variants by intent across every screen so prominence no longer follows from `button[type=submit]`
- [x] 8.2 Make destructive actions visually distinct from constructive ones using `--pico-del-color`
- [x] 8.3 Demote "Search" so it is not the most prominent element on the list page
- [x] 8.4 Split the global `[role='alert']` rule into distinct error, advisory, and confirmation treatments, reserving `role="alert"` for errors
- [x] 8.5 Remove the remaining per-page `<h1>`s now carried by the header

## 9. Verification and documentation

- [x] 9.1 Run `pnpm check` in `admin/` with no new errors
- [ ] 9.2 Walk every screen at a phone viewport: add, edit, delete, search, publish, sign out
- [x] 9.3 Confirm no file under the repo-root `src/` changed and the public site still builds
- [x] 9.4 Verify an existing restaurant with all fields populated still saves unchanged
- [ ] 9.5 Add the now-true structural facts (bottom tab bar, header title, manifest, publish timestamps) to `AGENTS.md` when archiving
