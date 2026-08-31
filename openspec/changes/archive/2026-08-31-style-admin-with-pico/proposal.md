## Why

The admin app ships with no styling at all — `+layout.svelte` is just `{@render children()}`, no CSS is loaded anywhere. Every admin page (login, restaurant form, publish, edit) renders as unstyled raw HTML, making the tool unpleasant to use day-to-day. The public site already uses Pico CSS as its base styling per project convention; the admin app should match rather than introduce a second styling approach.

## What Changes

- Load Pico CSS globally in the admin app's root layout (`admin/src/routes/+layout.svelte`), the same way the public site does.
- Apply Pico's semantic-HTML conventions (`class-light` usage, container wrapping, `<pico-*>` variables) across existing admin markup where it's already semantic (`<form>`, `<label>`, `<button>`, `role="alert"`) so it picks up Pico's default styling with minimal markup changes.
- No new visual design system, no custom component library — reuse the same base styling the public site already has.

## Capabilities

### New Capabilities
- `admin-ui-styling`: the admin app SHALL apply consistent base styling (Pico CSS) across its pages, matching the public site's styling approach.

### Modified Capabilities
(none)

## Impact

- `admin/src/routes/+layout.svelte` — add Pico CSS import/link and any base page structure (e.g. `<main class="container">`).
- `admin/src/routes/auth/login/+page.svelte`, `admin/src/routes/publish/+page.svelte`, `admin/src/routes/restaurants/[id]/edit/+page.svelte`, `admin/src/lib/components/RestaurantForm.svelte` — no functional changes, but markup may need minor adjustment (wrapping, semantic tags) to render well under Pico's defaults.
