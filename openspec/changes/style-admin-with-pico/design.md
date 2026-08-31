## Context

See proposal.md - Why. Per CLAUDE.md, the public site uses Pico CSS (class-light, semantic HTML, `var(--pico-*)` variables) loaded globally in its root layout. The admin app's `+layout.svelte` currently has no styling at all.

## Goals / Non-Goals

**Goals:**
- Admin pages pick up Pico's default styling with minimal markup churn, using markup that's already semantic.

**Non-Goals:**
- Custom theming, dark mode toggle, or any design work beyond Pico's defaults.
- Restructuring admin page layout/IA — this is a styling pass only.

## Decisions

**Load Pico via the same mechanism the public site uses**, in `admin/src/routes/+layout.svelte`, rather than duplicating a separate copy or config. Check `src/routes/+layout.svelte` (public site) for the exact import/link approach and mirror it, so both apps stay on the same Pico version and convention.

**Wrap page content in a `<main class="container">`** (Pico's standard container class) in the admin layout, since none of the existing admin pages currently wrap their content — this is required for Pico's spacing/typography to apply sensibly rather than stretching full-bleed.

**No component-level style changes beyond what Pico's semantic defaults already provide.** Existing markup (`<form>`, `<label>`, `<input>`, `<button>`, `role="alert"`) already matches Pico's class-light conventions per CLAUDE.md, so no per-page CSS is expected — only add scoped `<style>` blocks if a specific page looks broken after the global load.

## Risks / Trade-offs

- **[Risk]** `RestaurantForm.svelte` may have many fields/inputs whose current unstyled layout accidentally "worked" (e.g. no wrapping needed) — Pico's form spacing could reveal layout issues. → **Mitigation**: visually check the form after the change; this is exactly what pnpm dev / a browser check is for.
