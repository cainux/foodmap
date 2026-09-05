# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FoodMap is a static SvelteKit website that displays restaurants on an interactive MapLibre GL map. Restaurant data lives in Cloudflare D1; a separate admin app (Bluesky-OAuth-gated) provides CRUD and triggers rebuilds. The public site itself has no backend - it's static site generation (SSG) fed by a D1 snapshot taken at build time.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (fetches restaurants.json from D1)
pnpm build            # Production build (fetches restaurants.json from D1)
pnpm preview          # Preview production build
pnpm check            # TypeScript type checking
pnpm check:watch      # Type checking in watch mode
```

## Architecture

### Data Flow
```
Cloudflare D1 (foodmap.restaurants) → scripts/build-restaurants-data.js → src/lib/restaurants.json
              (SSOT)                        (auto-run on dev/build)          (generated, gitignored)
```

Restaurant data is edited via the admin app (Bluesky OAuth-gated CRUD against D1), which also exposes a manual "publish" control that triggers a rebuild/redeploy of the public site. The public site's build step runs `wrangler d1 execute` to snapshot D1 into `restaurants.json`; it requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be set (Cloudflare Pages project secrets).

### Key Files
- `src/routes/+page.svelte` - Main page with restaurant grid and sorting logic
- `src/lib/components/RestaurantMap.svelte` - MapLibre GL map with clustering
- `scripts/build-restaurants-data.js` - Fetches restaurants from D1 at build time
- `admin/` - Separate SvelteKit app (Bluesky OAuth, CRUD, manual publish) deployed as its own Cloudflare Worker

### Running the admin app locally

```bash
cd admin
cp .dev.vars.example .dev.vars    # then fill it in
pnpm dev
```

`.dev.vars` (gitignored; see `.dev.vars.example`) supplies what are Cloudflare secrets in production:

- `ALLOWED_HANDLES` - comma-separated Bluesky handles permitted to sign in. **Must include your own handle**, or the OAuth callback rejects you with a 403.
- `SESSION_ENCRYPTION_KEY` - encrypts stored OAuth sessions; any `openssl rand -base64 32` value works locally.
- `PAGES_DEPLOY_HOOK_URL` - the deploy hook the publish page POSTs to.

Browse to **`127.0.0.1`, not `localhost`** - AT Protocol's loopback client requires the IP literal, and signing in via `localhost` fails.

The `restaurants` table isn't in `admin/drizzle/migrations` (those cover only the OAuth tables), so a fresh local D1 needs it applied from the root project:

```bash
cd admin
npx wrangler d1 execute foodmap --local --file=../drizzle/migrations/0000_yummy_stardust.sql
```

## Admin App

The admin is used primarily on a phone. There is one layout at all widths - no
desktop-specific navigation, no responsive breakpoints. Desktop shows the same
phone-shaped column, centred.

### Forms

- All form actions use `use:enhance` with a pending state: disable submit buttons while in flight to prevent double submission, then show explicit success feedback. Never leave a successful write silent.
- `name`, `url`, and coordinates are all required. Coordinates must parse before submit - never save `null` lat/lng, since the public build drops any restaurant without coordinates.
- Coordinate parsing lives only in `admin/src/lib/geo.ts`. Do NOT re-inline the regex in route handlers.
- Preserve full coordinate precision. Do NOT round or reformat lat/lng.
- Tag inputs offer existing tags for reuse. The vocabulary is small and closed; near-synonyms fragment it.

### Data

- All restaurant writes go through `admin/src/lib/server/db/queries.ts`. That module owns the "data last mutated" timestamp - bump it there, never at call sites, so a new write path cannot forget it.

### PWA

- The admin is installable (`display: standalone`) but must NOT cache application data offline. It is auth-gated and write-heavy, so a stale cache is a correctness risk, not a feature. No workbox/runtime caching - unlike the public site.

## Svelte 5 Runes Syntax

This project uses Svelte 5 with runes - do NOT use Svelte 4 syntax:

```svelte
// Props (NOT export let)
let { value, onChange }: Props = $props();

// State (NOT let count = 0)
let count = $state(0);

// Derived (NOT $: doubled = count * 2)
let doubled = $derived(count * 2);

// Effects
$effect(() => { /* side effects */ });
```

## Map Implementation

The map uses `svelte-maplibre-gl` components with GeoJSON clustering:
- Three layers: `clusters`, `cluster-count`, `unclustered-point`
- Clustering enabled via GeoJSON source (`cluster: true`)
- Prerendering is enabled in `+layout.ts` (`export const prerender = true`)
- All layer setup happens in `handleMapLoad` after the map `load` event

## Styling

- Uses Pico CSS for base styling (class-light, semantic HTML)
- Use Pico CSS variables: `var(--pico-border-radius)`, `var(--pico-primary)`, etc.
- Scoped styles in component `<style>` blocks
- Global styles only in the app's root layout - `src/routes/+layout.svelte` for the public site, `admin/src/routes/+layout.svelte` for the admin

### Svelte MCP Server

Use the Svelte MCP server for documentation and code validation:
1. `list-sections` - Discover available Svelte 5/SvelteKit docs (call first)
2. `get-documentation` - Fetch specific documentation sections
3. `svelte-autofixer` - Validate Svelte code before finalizing (required before sending code to user)

## Pico CSS Rules

- ALWAYS use Pico CSS v2 as the styling framework. NEVER use Tailwind, Bootstrap, or any other CSS framework.
- Write semantic HTML. Do NOT add utility classes or BEM-style class names. Pico styles native elements directly.
- Allowed Pico classes (sparingly): .container, .grid, .group, .secondary, .contrast, .outline, .stack, .card
- For layout containers, use <main class="container"> or the classless variant where <header>/<main>/<footer> act as containers.
- Use CSS custom properties (--primary, --primary-hover, --primary-inverse, etc.) for any theming overrides. Do NOT hardcode colors.
- Dark mode is automatic via prefers-color-scheme. Do NOT add manual dark-mode logic unless explicitly asked.
- Use <article> for cards, <nav> for navigation, <section> for content blocks, <aside> for sidebars.
- Forms: use native form elements. Inputs are width:100% by default. Use .grid inside forms for multi-column layouts.
- Buttons: <button> for actions, <a role="button"> for inline links. Variants: .secondary, .contrast, .outline.
- For customization beyond Pico's defaults, add a small <style> block or separate CSS file overriding CSS variables — do NOT write new utility classes.
- Button prominence must express intent, not markup. Pico sets `width: 100%` on `button[type=submit]` only, so submit buttons always render full-width — never let that decide hierarchy. Destructive actions use `--pico-del-color`; the safe choice (Cancel/dismiss) stays the visually dominant default.
- `role="alert"` is for errors only. It is an ARIA live region — do NOT use it for advisory notices, inline hints, or confirmation questions. Advisories use plain text or `<small>`; confirmations use `<dialog>`.
- Use native `<dialog>` for modals. Pico v2 styles `dialog > article` including `header`/`footer` — write no custom modal CSS.
- Reference: https://picocss.com/docs (v2)
