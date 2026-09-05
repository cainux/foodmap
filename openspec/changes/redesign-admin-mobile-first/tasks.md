## 1. Publish-state data layer

- [ ] 1.1 Add a `publish_state` table to `admin/src/lib/server/db/schema.ts`: `id` (integer PK, always 1), `last_mutated_at`, `last_published_at`, `last_deployment_id`, all nullable
- [ ] 1.2 Generate the migration into `admin/drizzle/migrations/` and seed the single row with null timestamps, so the admin reports "never published" until the first publish
- [ ] 1.3 Add `getPublishState`, `touchMutation`, and `recordPublish(deploymentId)` to `admin/src/lib/server/db/queries.ts`
- [ ] 1.4 Bump the mutation timestamp inside `createRestaurant`, `updateRestaurant`, and `deleteRestaurant` themselves — not at their call sites — so a future write path cannot omit it
- [ ] 1.5 Apply the migration to the local D1 and confirm a create, an edit, and a delete each move `last_mutated_at`

## 2. Shared coordinate parsing

- [ ] 2.1 Move coordinate parsing into `admin/src/lib/geo.ts`, returning an explicit valid/invalid result rather than a null pair, so callers cannot mistake a parse failure for absent data
- [ ] 2.2 Delete the duplicate `parseCoordinates` from `restaurants/new/+page.server.ts` and `restaurants/[id]/edit/+page.server.ts` and call the shared parser
- [ ] 2.3 Replace the inline regex in `RestaurantForm.svelte` with the shared parser so client and server agree by construction

## 3. App shell

- [ ] 3.1 Create `admin/static/` with `icon.svg` — the public site's rounded-square structure with the 🍽️ glyph on `#37474f` — and a favicon, resolving the `favicon.png` 404 `app.html` already has
- [ ] 3.2 Add a web app manifest (name, `display: standalone`, `theme_color`, icon) and link it from `app.html`
- [ ] 3.3 Add `viewport-fit=cover` and a `theme-color` meta to `app.html`
- [ ] 3.4 Confirm no service worker is registered and no runtime caching is introduced
- [ ] 3.5 Rewrite `+layout.svelte` as a persistent header plus a fixed bottom tab bar (Restaurants, Add, Publish)
- [ ] 3.6 Delete the hamburger toggle, `menuOpen` state, `afterNavigate` reset, `.admin-nav-links.open` logic, the `display: flex !important` override, and the `min-width: 900px` block
- [ ] 3.7 Drive the header's screen title per route
- [ ] 3.8 Add a compact logout control to the header; do not render the signed-in handle anywhere in persistent chrome
- [ ] 3.9 Inset the tab bar clear of device safe areas
- [ ] 3.10 Constrain content to a centred column so wide viewports show the same layout rather than a stretched one
- [ ] 3.11 Confirm the login page renders without header or tab bar

## 4. Submission feedback

- [ ] 4.1 Add `use:enhance` to the create action with a pending state that disables the submit control
- [ ] 4.2 Add a creation-success `<dialog>` naming the saved restaurant, with "Add another" and "Back to list" in its footer
- [ ] 4.3 Make "Add another" present an empty form retaining no previous values
- [ ] 4.4 Add `use:enhance` and success confirmation to the edit action
- [ ] 4.5 Replace the inline delete confirmation with a `<dialog>` that takes focus, with cancel as the dominant option and dismissal leaving the record intact
- [ ] 4.6 Add `use:enhance` with a pending state to the publish and sign-in actions
- [ ] 4.7 On failure, re-enable controls and preserve entered values on every form
- [ ] 4.8 Verify each form still submits and reports its outcome with client-side scripting disabled, including a server-rendered open dialog

## 5. Restaurant form

- [ ] 5.1 Reject submissions missing name, URL, or coordinates in both the create and update actions with `fail(400)` identifying the missing field
- [ ] 5.2 Reject unparseable coordinates server-side; never store empty latitude/longitude in place of an unparsed value
- [ ] 5.3 Mark the coordinate field `aria-invalid` with a message when parsing fails, and block submission client-side
- [ ] 5.4 Keep coordinates as a single `lat,lng` field with one validation message
- [ ] 5.5 Offer the tags already used by existing restaurants via a native `<datalist>`, still accepting new tags
- [ ] 5.6 Demote the duplicate-proximity warning from `role="alert"` to advisory presentation, leaving it non-blocking

## 6. Restaurant list

- [ ] 6.1 Filter by name in the browser as the admin types; delete the `q` search-param handling from `+page.server.ts`
- [ ] 6.2 Stop matching tags in search
- [ ] 6.3 Show the number of restaurants currently listed
- [ ] 6.4 Show an explicit no-matches state instead of an empty list
- [ ] 6.5 Render rows as `<article>` tap targets
- [ ] 6.6 Remove the `<h1>` that duplicates the header title

## 7. Publish screen

- [ ] 7.1 Load publish state and derive never-published, up-to-date, or changes-pending
- [ ] 7.2 Render the derived state with the last-changed and last-published times, keeping publish available when up to date
- [ ] 7.3 Record the publish timestamp only when the deploy hook accepts the request, leaving it unchanged on failure
- [ ] 7.4 Parse the deployment identifier from the hook response and store it; treat the field as optional and never fail a publish over it
- [ ] 7.5 Reword the confirmation to claim only that a publish was requested, dropping the assertion that the site will finish rebuilding
- [ ] 7.6 Show a pending-changes indicator on the Publish tab, cleared once a publish is recorded with no later mutation

## 8. Visual consistency

- [ ] 8.1 Assign button variants by intent across every screen so prominence no longer follows from `button[type=submit]`
- [ ] 8.2 Make destructive actions visually distinct from constructive ones using `--pico-del-color`
- [ ] 8.3 Demote "Search" so it is not the most prominent element on the list page
- [ ] 8.4 Split the global `[role='alert']` rule into distinct error, advisory, and confirmation treatments, reserving `role="alert"` for errors
- [ ] 8.5 Remove the remaining per-page `<h1>`s now carried by the header

## 9. Verification and documentation

- [ ] 9.1 Run `pnpm check` in `admin/` with no new errors
- [ ] 9.2 Walk every screen at a phone viewport: add, edit, delete, search, publish, sign out
- [ ] 9.3 Confirm no file under the repo-root `src/` changed and the public site still builds
- [ ] 9.4 Verify an existing restaurant with all fields populated still saves unchanged
- [ ] 9.5 Add the now-true structural facts (bottom tab bar, header title, manifest, publish timestamps) to `AGENTS.md` when archiving
