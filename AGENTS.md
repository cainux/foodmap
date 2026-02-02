# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FoodMap is a static SvelteKit website that displays restaurants on an interactive MapLibre GL map. It uses static site generation (SSG) with no backend.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (auto-generates restaurants.json)
pnpm build            # Production build (auto-generates restaurants.json)
pnpm preview          # Preview production build
pnpm check            # TypeScript type checking
pnpm check:watch      # Type checking in watch mode
```

## Architecture

### Data Flow
```
data/restaurants.yaml → scripts/parse-restaurants.js → src/lib/restaurants.json
      (SSOT)                  (auto-run on dev/build)        (generated, gitignored)
```

**Always edit `data/restaurants.yaml`** - never manually edit `restaurants.json`.

### Key Files
- `src/routes/+page.svelte` - Main page with restaurant grid and sorting logic
- `src/lib/components/RestaurantMap.svelte` - MapLibre GL map with clustering
- `data/restaurants.yaml` - Source restaurant data (SSOT)

### Restaurant Data Format
```yaml
- name: Restaurant Name
  url: https://maps.app.goo.gl/...
  coordinates: 51.5163842,-0.0693367    # lat,lng (no spaces)
  tags: tag1 tag2                        # space-separated (optional)
  comment: A note about the place        # optional
```

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
- SSR is disabled in `+layout.ts` (`export const ssr = false`)
- All layer setup happens in `handleMapLoad` after the map `load` event

## Styling

- Uses Pico CSS for base styling (class-light, semantic HTML)
- Use Pico CSS variables: `var(--pico-border-radius)`, `var(--pico-primary)`, etc.
- Scoped styles in component `<style>` blocks
- Global styles only in `src/routes/+layout.svelte`

## Tools

Use 'bd' for task tracking.

### Svelte MCP Server

Use the Svelte MCP server for documentation and code validation:
1. `list-sections` - Discover available Svelte 5/SvelteKit docs (call first)
2. `get-documentation` - Fetch specific documentation sections
3. `svelte-autofixer` - Validate Svelte code before finalizing (required before sending code to user)
