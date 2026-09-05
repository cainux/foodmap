## Why

The admin app works, but every screen does the minimum version of itself. It is used
primarily on a phone, yet its most common action ("Add Restaurant") sits two taps behind a
hamburger menu, a successful save produces no feedback at all, and nothing in the UI can
answer the workflow's central question: *does the live site reflect the current data?*

Visual hierarchy is accidental rather than intended. Pico sets `width: 100%` on
`button[type=submit]` only, so markup — not intent — decides prominence: eight of the ten
buttons in the app render as the identical solid primary, "Search" is the boldest element on
the list page, and the delete confirmation presents the destructive action as the large
default with "Cancel" as the small alternative beside it. Separately, one global
`role="alert"` rule paints errors, advisory duplicate warnings, and confirmation questions in
the same bold red.

## What Changes

**Shell and navigation**

- **BREAKING** Replace the responsive hamburger navigation with a persistent bottom tab bar
  (Restaurants · Add · Publish) at all viewport widths. The tablet breakpoint, hamburger
  toggle, and desktop single-row layout are removed; desktop renders the same phone-shaped
  column, centred.
- Make the admin installable as a PWA (`display: standalone`) with safe-area handling, so it
  runs without browser chrome. Deliberately no offline/runtime caching — the admin is
  auth-gated and write-heavy, so a stale cache is a correctness risk.
- Replace the five inconsistent per-page `<h1>`s with a sticky header carrying the screen
  title.

**Submission feedback**

- Every admin form action (create, update, delete, publish, sign-in) gains a pending state
  that disables its submit control to prevent double submission, followed by explicit success
  feedback. Creating a restaurant currently returns silently with the form still populated;
  it will confirm the save and offer to add another.

**Publish visibility**

- Track two timestamps — when restaurant data was last mutated, and when publish last
  succeeded — and surface the derived state (never published / up to date / changes pending)
  on the publish screen and as an indicator on the Publish tab.
- Stop asserting that the public site *will* rebuild. A deploy-hook `200` means Cloudflare
  accepted the request, not that the build succeeded.

**Data entry**

- **BREAKING** Coordinates and Google Maps URL both become required, and coordinates must
  parse before submit. Malformed coordinates are currently accepted and stored as `null`,
  which silently removes the restaurant from the public map.
- Offer the existing tag vocabulary when tagging. 23 distinct tags across 57 restaurants have
  already fragmented into near-synonyms (`coffee`/`cafe`, `bakery`/`patisserie`/`pastry`).

**List**

- **BREAKING** Search filters on name only, not name-or-tags, and filters instantly in the
  browser rather than round-tripping a GET form. The full dataset is already loaded on every
  page view.
- Add a result count and an empty state; render rows as tap targets.

**Consistency**

- Assign button variants by intent rather than by `type`: destructive actions use
  `--pico-del-color`, and the safe choice stays the visually dominant default.
- Split the single `role="alert"` rule into distinct error, advisory, and confirmation
  treatments. `role="alert"` is reserved for errors; confirmations move to native `<dialog>`,
  which Pico v2 already styles.

## Capabilities

### New Capabilities

- `admin-app-shell`: The admin's phone-first application shell — installability as a
  standalone PWA, safe-area handling, the sticky screen-title header, and the single
  non-responsive layout that replaces per-viewport variants.
- `admin-form-submission`: Cross-cutting submission behaviour for every admin form — pending
  state, submit-control disabling to prevent double submission, and explicit success
  confirmation.

### Modified Capabilities

- `admin-navigation`: The "Responsive, mobile-first layout" requirement is replaced. Navigation
  becomes a persistent bottom tab bar at all widths with no hamburger and no breakpoint, and
  the Publish destination carries a pending-changes indicator.
- `admin-ui-styling`: Extends beyond "base styling is applied" to require intentional button
  hierarchy, severity-differentiated alerts, and `<dialog>`-based confirmations.
- `admin-restaurant-management`: The Google Maps URL becomes required rather than optional;
  coordinates must be present and parseable; search matches names only; tagging offers the
  existing vocabulary. The "Responsive single layout" requirement's wide-viewport scenario is
  removed.
- `manual-publish`: Adds requirements for publish-state visibility and for not claiming a
  rebuild succeeded when only the trigger was accepted.
- `restaurant-data`: The record schema's "optional Google Maps URL" becomes required, and the
  "Optional fields may be omitted" scenario changes accordingly.

## Impact

**Scope**: `admin/` only. No files under the repo-root `src/` are touched, and the public
site's behaviour is unchanged.

**Code**

- `admin/src/routes/+layout.svelte` — bottom tab bar; removal of the hamburger toggle,
  `menuOpen` state, `afterNavigate` reset, and the `min-width: 900px` block
- `admin/src/routes/+page.svelte`, `+page.server.ts` — client-side name filter; removal of the
  `q` search-param handling
- `admin/src/lib/components/RestaurantForm.svelte` — validation surfacing, tag reuse, pending
  state
- `admin/src/routes/restaurants/{new,[id]/edit}/+page.server.ts` — required-field validation;
  removal of two duplicate `parseCoordinates` implementations
- `admin/src/lib/geo.ts` — becomes the single home for coordinate parsing
- `admin/src/lib/server/db/queries.ts` — owns the data-mutation timestamp
- `admin/src/routes/publish/` — publish-state display
- `admin/src/app.html`, `admin/vite.config.ts` — `viewport-fit=cover`, PWA manifest

**Data**: one additive migration for a single-row publish-state table. The `restaurants` table
is unchanged.

**Dependencies**: none added. The PWA manifest is authored directly rather than pulling in the
public site's `@vite-pwa/sveltekit`, since no service worker or runtime caching is wanted.

**Documentation**: `AGENTS.md` already carries the directive conventions from this change; the
structural facts (tab bar, sticky header, manifest, publish timestamps) should be added when
this change is archived.
