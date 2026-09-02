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
- Global styles only in `src/routes/+layout.svelte`

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
- Reference: https://picocss.com/docs (v2)
