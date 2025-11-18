# CLAUDE.md - AI Assistant Guide for FoodMap

> **Last Updated**: 2025-11-17
> **Project**: FoodMap - Interactive Restaurant Map
> **Current Branch**: `claude/claude-md-mi3neouiixqay9n9-01MPLHfKcQGWvtJQoer9fkHz`

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Codebase Structure](#codebase-structure)
4. [Development Workflow](#development-workflow)
5. [Code Conventions](#code-conventions)
6. [Git Workflow](#git-workflow)
7. [Data Management](#data-management)
8. [Common Tasks](#common-tasks)
9. [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## Project Overview

FoodMap is a **static website** built with SvelteKit that displays curated restaurants on an interactive Leaflet map. The project focuses on:

- **Purpose**: Personal restaurant map for tracking favorite dining locations
- **Architecture**: Static site generation (SSG) with no backend
- **Key Features**:
  - Interactive map with restaurant markers (red circles with white borders)
  - Geolocation support to find user's current location (blue marker)
  - Dynamic distance-based sorting from map center or user location
  - Responsive grid layout for restaurant cards
  - Clean, minimal UI using Pico CSS

**Target Deployment**: Static hosting (GitHub Pages, Netlify, Vercel, Cloudflare Pages)

---

## Tech Stack

### Core Framework
- **SvelteKit 2.47.1** - Full-stack framework with static adapter
- **Svelte 5.41.0** - Reactive UI components (using latest runes API: `$state`, `$props`)
- **TypeScript 5.9.3** - Type safety throughout

### Build Tools
- **Vite 7.1.10** - Fast build tool and dev server
- **pnpm** - Package manager (fast, disk-efficient)
- **@sveltejs/adapter-static** - Static site generation

### UI & Styling
- **Pico CSS 2.1.1** - Minimal, class-light CSS framework
- **Leaflet 1.9.4** - Interactive mapping library
- **OpenStreetMap** - Tile layer provider

### Development
- **svelte-check** - Type checking for Svelte components
- **ES Modules** - Modern JavaScript module system
- **Node.js** - Runtime for build scripts

---

## Codebase Structure

```
/home/user/foodmap/
├── src/                              # Source code
│   ├── app.html                      # HTML shell template
│   ├── app.d.ts                      # TypeScript app definitions
│   ├── lib/                          # Reusable code & assets
│   │   ├── components/
│   │   │   └── RestaurantMap.svelte  # Main map component
│   │   ├── assets/
│   │   │   └── favicon.svg           # Site favicon
│   │   ├── restaurants.json          # GENERATED restaurant data
│   │   └── index.ts                  # Library exports
│   └── routes/                       # SvelteKit pages
│       ├── +layout.svelte            # Root layout (CSS imports)
│       ├── +layout.ts                # Layout config (SSR off, prerender on)
│       └── +page.svelte              # Home page (main app)
│
├── data/
│   └── restaurants.txt               # SOURCE restaurant data (SSOT)
│
├── scripts/
│   ├── parse-restaurants.js          # Parse .md → .json
│   ├── extract-coordinates.js        # OSM Nominatim geocoding
│   ├── extract-coordinates-browser.js # Browser-based extraction
│   └── extract-coords.sh             # Shell wrapper
│
├── static/
│   └── robots.txt                    # SEO directives
│
├── build/                            # Production output (generated, gitignored)
│
├── Configuration
│   ├── package.json                  # Dependencies & scripts
│   ├── pnpm-lock.yaml                # Locked dependencies
│   ├── pnpm-workspace.yaml           # Monorepo config
│   ├── tsconfig.json                 # TypeScript config
│   ├── vite.config.ts                # Vite build config
│   ├── svelte.config.js              # SvelteKit config
│   └── .mcp.json                     # MCP servers (Claude integration)
│
└── Documentation
    ├── README.md                     # User-facing docs
    ├── COORDINATES.md                # Coordinate extraction guide
    └── CLAUDE.md                     # This file
```

### Key Files Reference

| File Path | Purpose | Key Exports/Features |
|-----------|---------|---------------------|
| `src/routes/+page.svelte` | Main app page | Renders map + restaurant grid, handles sorting |
| `src/lib/components/RestaurantMap.svelte` | Map component | Leaflet integration, geolocation, markers |
| `src/lib/restaurants.json` | Restaurant data (GENERATED) | Array of `{name, url, coordinates}` |
| `data/restaurants.txt` | Source data (SSOT) | Human-editable restaurant list |
| `scripts/parse-restaurants.js` | Data parser | Converts .md → .json format |
| `src/routes/+layout.ts` | Route config | `export const prerender = true; export const ssr = false;` |
| `svelte.config.js` | SvelteKit config | Static adapter, build output to `build/` |

---

## Development Workflow

### Initial Setup

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
# Automatically parses restaurant data before starting
pnpm dev
```

### Development Cycle

```bash
# 1. Make code changes in src/
# 2. Hot Module Replacement (HMR) updates browser automatically
# 3. Type check (optional during dev)
pnpm check

# 4. Build for production (automatically parses restaurant data first)
pnpm build

# 5. Preview production build
pnpm preview
```

**Note:** `src/lib/restaurants.json` is automatically generated from `data/restaurants.txt` when you run `pnpm dev` or `pnpm build`. You never need to manually run `pnpm parse:restaurants`.

### Adding Restaurants

1. **Edit source data**: `data/restaurants.txt`
   ```
   Restaurant Name
   https://maps.app.goo.gl/...
   51.5163842,-0.0693367

   ```
   - Format: name, URL, coordinates (lat,lng) on separate lines
   - Blank line separates entries

2. **Start dev or build**: `pnpm dev` or `pnpm build`
   - Automatically generates `src/lib/restaurants.json` from source data
   - Validates coordinate format
   - Reports count of parsed/geocoded restaurants

**Note:** The `pnpm parse:restaurants` script still exists for manual parsing if needed, but it's automatically run during dev and build.

### Coordinate Extraction

See `COORDINATES.md` for detailed instructions. Key methods:

- **Automated**: `node scripts/extract-coordinates.js` (uses OSM Nominatim API)
- **Browser Console**: `scripts/extract-coordinates-browser.js` (follow redirects)
- **Manual UI**: Open `coordinate-extractor.html` in browser

---

## Code Conventions

### TypeScript

- **Strict Mode**: Enabled in `tsconfig.json`
- **Type Safety**: All components use TypeScript
- **Interface Definitions**: Define types inline or in component script blocks

```typescript
// Example: Restaurant interface
interface Restaurant {
  name: string;
  url: string;
  coordinates: { lat: number; lng: number } | null;
}
```

### Svelte 5 Runes (Modern Syntax)

This project uses **Svelte 5** with the new runes API:

```svelte
<script lang="ts">
  // State management
  let count = $state(0);  // NOT: let count = 0;

  // Props
  let { value, onChange }: { value: number; onChange: (n: number) => void } = $props();

  // Derived state (auto-updates)
  let doubled = $derived(count * 2);

  // Effects
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

**Key Differences from Svelte 4:**
- Use `$state()` for reactive variables
- Use `$props()` for component props
- Use `$derived()` for computed values
- Use `$effect()` for side effects
- NO more `export let` for props

### Component Structure

Standard Svelte component order:

```svelte
<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte';

  // 2. Type definitions
  interface Props { ... }

  // 3. Props
  let { propName }: Props = $props();

  // 4. State
  let count = $state(0);

  // 5. Lifecycle & effects
  onMount(() => { ... });

  // 6. Functions
  function handleClick() { ... }
</script>

<!-- 7. Template -->
<div>...</div>

<!-- 8. Scoped styles -->
<style>
  div { ... }
</style>
```

### Styling Conventions

- **Use Pico CSS variables**: `var(--pico-border-radius)`, `var(--pico-primary)`, etc.
- **Scoped styles**: Keep styles in component `<style>` blocks
- **Global styles**: Only in `src/routes/+layout.svelte`
- **Responsive design**: Mobile-first with `@media` queries

```css
/* Example: Mobile-first responsive */
.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  section h2 {
    text-align: center;
  }
}
```

### Leaflet Integration

**Client-side only** (avoid SSR issues):

```typescript
onMount(async () => {
  // Dynamic import to prevent SSR errors
  const L = await import('leaflet');

  // Initialize map
  map = L.map(mapContainer).setView([lat, lng], zoom);

  // Add tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '...'
  }).addTo(map);
});
```

**Marker Styling**:
- **Restaurant markers**: Red circles (`#ff6b6b`) with white border
  ```typescript
  L.circleMarker([lat, lng], {
    radius: 8,
    fillColor: '#ff6b6b',
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
  })
  ```
- **User location marker**: Blue circle (`#4285f4`) with white border, larger radius (10)

### Distance Calculations

Use **Haversine formula** for accurate distance calculations:

```typescript
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

**Implementation** (see `src/routes/+page.svelte:28-42`):
- Calculate distance from map center/user location to each restaurant
- Sort restaurants by distance (ascending)
- Update grid order in real-time

---

## Git Workflow

### Branch Strategy

**IMPORTANT**: All development occurs on feature branches starting with `claude/`

- **Current branch**: `claude/claude-md-mi3neouiixqay9n9-01MPLHfKcQGWvtJQoer9fkHz`
- **Never push to**: `main` or `master` without explicit permission
- **Branch naming**: `claude/description-sessionId`

### Commit Messages

Follow recent commit style from project history:

```bash
# Good examples from git log:
✅ "Add dynamic restaurant sorting based on map center position"
✅ "Add geolocation button with distance-based sorting"
✅ "Remove restaurant count from heading"
✅ "Replace pin markers with circle markers with white border"

# Format: Imperative mood, clear description of what changed
git commit -m "Add feature X"        # Good
git commit -m "Added feature X"      # Avoid past tense
git commit -m "Adds feature X"       # Avoid present tense
git commit -m "WIP"                  # Avoid vague messages
```

### Git Operations

**Pushing changes**:
```bash
# Always use -u flag for new branches
git push -u origin claude/claude-md-mi3neouiixqay9n9-01MPLHfKcQGWvtJQoer9fkHz

# CRITICAL: Branch MUST start with 'claude/' and end with session ID
# Otherwise push will fail with 403 HTTP error

# Network retry logic (if push fails):
# Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
```

**Fetching/Pulling**:
```bash
# Prefer specific branch fetches
git fetch origin claude/branch-name
git pull origin claude/branch-name

# Same retry logic applies for network failures
```

### Commit Workflow

When committing changes:

1. **Check status**: `git status` - see untracked/modified files
2. **Review changes**: `git diff` - see what will be committed
3. **Stage files**: `git add <files>` - add relevant files
4. **Commit**:
   ```bash
   git commit -m "$(cat <<'EOF'
   Clear, concise commit message here

   Optional additional context if needed
   EOF
   )"
   ```
5. **Verify**: `git status` - confirm commit succeeded
6. **Push**: `git push -u origin <branch-name>`

**Important**:
- DO NOT commit generated files: `build/`, `node_modules/`, `.svelte-kit/`, `src/lib/restaurants.json`
- DO commit source data changes: `data/restaurants.txt`
- `src/lib/restaurants.json` is a build artifact (auto-generated, not tracked in git)
- NO secrets: Never commit `.env`, `credentials.json`, API keys

---

## Data Management

### Single Source of Truth (SSOT)

**`data/restaurants.txt`** is the SSOT for restaurant data:

```
Restaurant Name
https://maps.app.goo.gl/shortUrl
51.5163842,-0.0693367

Next Restaurant
https://maps.app.goo.gl/anotherUrl
51.5139088,-0.0728799
```

**Format Rules**:
1. Line 1: Restaurant name (free text, can include notes in parentheses)
2. Line 2: Google Maps short URL (`maps.app.goo.gl`)
3. Line 3: Coordinates in `lat,lng` format (decimal degrees)
4. Blank line separates entries

### Data Flow

```
Source Data                Parser                   Application
─────────────────         ─────────────            ─────────────
data/restaurants.txt  →  parse-restaurants.js  →  src/lib/restaurants.json
(human-editable)        (auto-run on dev/build)    (generated build artifact)
```

**Automatic Generation**: The parser runs automatically when you execute `pnpm dev` or `pnpm build`. The JSON file is not tracked in git and is regenerated fresh each time.

**Generated JSON Schema**:
```json
[
  {
    "name": "Grounded London",
    "url": "https://maps.app.goo.gl/mTG2MTWQWzVsuGE89",
    "coordinates": {
      "lat": 51.5163842,
      "lng": -0.0693367
    }
  }
]
```

### Coordinate Validation

Parser validates coordinates using regex:
```javascript
coords.match(/^-?\d+\.\d+,-?\d+\.\d+$/)
```

- Accepts negative values (for southern/western hemispheres)
- Requires decimal format (not DMS)
- Comma-separated, no spaces

**Invalid examples**:
- `51° 30' N, 0° 4' W` (DMS format - not supported)
- `51.5163842, -0.0693367` (space after comma)
- `51.5163842` (missing longitude)

---

## Common Tasks

### Task: Add New Restaurants

**File locations**:
- Source: `data/restaurants.txt`
- Script: `scripts/parse-restaurants.js` (auto-run on dev/build)
- Output: `src/lib/restaurants.json` (generated build artifact)

**Steps**:
1. Edit `data/restaurants.txt` (add new entries)
2. Run `pnpm dev` or `pnpm build`
   - Parser runs automatically
   - Verify output in console: `✅ Parsed X restaurants`
3. Test: `pnpm preview` (if you ran build)

### Task: Update Map Styling

**File location**: `src/lib/components/RestaurantMap.svelte`

**Common changes**:
- **Marker colors**: Lines 55, 112 (`fillColor`)
- **Marker size**: Lines 54, 111 (`radius`)
- **Border**: Lines 56-57, 113-114 (`color`, `weight`)
- **Default zoom**: Line 43 (`setView` second argument)
- **Map height**: Line 160 (`.map-container` height)

### Task: Modify Restaurant Grid

**File location**: `src/routes/+page.svelte`

**Common changes**:
- **Grid columns**: Line 107 (`grid-template-columns`)
- **Card spacing**: Line 108 (`gap`)
- **Card content**: Lines 60-65 (template)
- **Sorting logic**: Lines 8-26 (`handleLocationUpdate`)

### Task: Add Type Checking

```bash
# One-time check
pnpm check

# Watch mode (continuous)
pnpm check:watch
```

**Common errors**:
- Missing type annotations on props
- Incorrect Svelte 5 syntax (`export let` instead of `$props()`)
- Leaflet type mismatches (ensure `@types/leaflet` is installed)

### Task: Debug Map Issues

**Common issues**:

1. **Map not rendering**:
   - Check browser console for errors
   - Verify `leaflet` CSS is imported in `+layout.svelte`
   - Ensure dynamic import in `onMount` (no SSR)

2. **Markers not showing**:
   - Verify `restaurants.json` has valid coordinates
   - Check map bounds with `map.fitBounds()`
   - Inspect network tab for tile loading errors

3. **Geolocation not working**:
   - HTTPS required (or localhost)
   - Browser permissions must be granted
   - Check `hasGeolocation` state value

### Task: Deploy to Production

**Prerequisites**:
1. All restaurants have valid coordinates
2. Build succeeds without errors
3. Preview works correctly

**Steps**:
```bash
# 1. Parse latest data
pnpm parse:restaurants

# 2. Build production bundle
pnpm build

# 3. Preview (optional)
pnpm preview

# 4. Deploy build/ folder to hosting service
# - GitHub Pages: Push build/ to gh-pages branch
# - Netlify: Drag build/ folder to deploy
# - Vercel: Connect repo and set output to build/
# - Cloudflare Pages: Set build output to build/
```

**Build output**: `/home/user/foodmap/build/`

---

## Important Notes for AI Assistants

### Before Making Changes

1. **Read existing code first**: Use `Read` tool to understand current implementation
2. **Check dependencies**: Review `package.json` for available packages
3. **Understand data flow**: Source data → parser → JSON → components
4. **Respect conventions**: Follow Svelte 5 runes syntax, TypeScript strict mode

### When Modifying Components

1. **Use Svelte 5 syntax**:
   - `$state()` for reactive variables
   - `$props()` for component props
   - `$derived()` for computed values
   - NO `export let` syntax

2. **Type everything**: Add TypeScript types to all functions, props, state

3. **Client-side only for Leaflet**: Always use dynamic imports in `onMount`

4. **Test responsively**: Check mobile view (grid, button placement)

### When Working with Data

1. **NEVER manually edit** `src/lib/restaurants.json` - it's auto-generated
2. **ALWAYS edit** `data/restaurants.txt` as the source of truth
3. **Parser runs automatically**: `pnpm dev` and `pnpm build` generate the JSON
4. **VALIDATE coordinates**: Ensure lat,lng format with no spaces

### When Committing

1. **Review diffs**: Check `git diff` before staging (should only see `data/restaurants.txt` changes)
2. **Clear messages**: Follow imperative mood commit style
3. **Test build**: Run `pnpm build` before committing (auto-generates JSON)
4. **Push to feature branch**: Never push to main without permission
5. **Don't commit** `src/lib/restaurants.json` - it's in `.gitignore`

### Common Pitfalls to Avoid

1. **SSR Issues**:
   - Leaflet requires browser APIs (window, document)
   - Always use dynamic imports: `const L = await import('leaflet')`
   - Set `ssr: false` in `+layout.ts`

2. **Svelte 4 vs 5 Confusion**:
   - OLD: `export let value` → NEW: `let { value } = $props()`
   - OLD: `$: doubled = value * 2` → NEW: `let doubled = $derived(value * 2)`

3. **Missing CSS**:
   - Leaflet CSS must be imported in layout
   - Pico CSS imported for base styling
   - Check global vs scoped styles

4. **Coordinate Format**:
   - Use decimal degrees: `51.5163842,-0.0693367`
   - NOT DMS: `51° 30' 59" N, 0° 4' 10" W`
   - NO spaces after comma

5. **Generated Files**:
   - `build/` is gitignored (don't commit)
   - `.svelte-kit/` is gitignored
   - `node_modules/` is gitignored
   - `src/lib/restaurants.json` is gitignored (auto-generated build artifact)

### Performance Considerations

1. **Static Generation**:
   - All pages pre-rendered at build time
   - No server-side processing at runtime
   - Fast loading, minimal JavaScript

2. **Map Optimization**:
   - Use `CircleMarker` instead of `Marker` (lighter weight)
   - Debounce map movement events (500ms in code)
   - Fit bounds on load to show all markers

3. **Sorting Efficiency**:
   - Haversine calculations are CPU-intensive
   - Only recalculate on location change (not on every render)
   - Filter out null coordinates before sorting

### Recent Feature History

Understanding recent commits helps maintain consistency:

1. **Dynamic Sorting** (`e71853f`): Restaurants sort by distance from map center
2. **Geolocation** (`3936811`): "Find My Location" button with distance sorting
3. **Circle Markers** (`f35bbdc`): Changed from pins to circles with white borders
4. **Mobile Responsive** (`ba1bb43`, `ffeabdd`): Centered headings, adjusted spacing

**Key insight**: Project evolved from static map → interactive map → location-aware sorting

### File Modification Frequency

**Frequently modified**:
- `data/restaurants.txt` - adding/updating restaurants
- `src/routes/+page.svelte` - main UI changes
- `src/lib/components/RestaurantMap.svelte` - map features

**Rarely modified**:
- `svelte.config.js` - stable build config
- `tsconfig.json` - stable TypeScript config
- `vite.config.ts` - stable build config
- `src/routes/+layout.svelte` - global styles set

**Never modify** (generated):
- `build/` directory
- `.svelte-kit/` directory
- `pnpm-lock.yaml` (only via package manager)

### Helpful References

- **Svelte 5 Docs**: https://svelte.dev/docs/svelte/overview
- **SvelteKit Docs**: https://kit.svelte.dev/docs
- **Leaflet Docs**: https://leafletjs.com/reference.html
- **Pico CSS**: https://picocss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## Project-Specific Architecture Decisions

### Why Static Site Generation?

**Rationale**:
- No backend needed (simple deployment)
- Fast loading (pre-rendered HTML)
- No server costs (static hosting is free/cheap)
- SEO friendly (fully rendered HTML)

**Tradeoffs**:
- All data in client bundle (not ideal for 1000s of restaurants)
- No real-time updates (must rebuild to change data)
- No user-specific content (same for all visitors)

**Suitable for**: Personal restaurant lists, curated collections (<100 items)

### Why Leaflet over Google Maps?

**Rationale**:
- Free (no API key required)
- Open source
- OpenStreetMap tiles (community-driven)
- Lightweight library
- Customizable styling

**Tradeoffs**:
- Fewer features than Google Maps API
- Tiles may have less detail in some regions
- No built-in places/reviews

### Why Pico CSS?

**Rationale**:
- Minimal framework (easy to override)
- Class-light (semantic HTML styling)
- Beautiful defaults (no design work needed)
- Small footprint (~20KB)

**Tradeoffs**:
- Less flexible than Tailwind
- Fewer components than Bootstrap
- Must write custom CSS for complex layouts

---

## Debugging Checklist

When something breaks, check these in order:

1. **Browser Console**: Look for errors (red text)
2. **Network Tab**: Check if map tiles are loading (200 OK status)
3. **Build Output**: Verify `pnpm build` succeeds without warnings
4. **Data Validation**: Run `pnpm parse:restaurants` to check JSON generation
5. **Type Checking**: Run `pnpm check` to catch TypeScript errors
6. **Git Status**: Ensure no uncommitted changes interfering
7. **Node Modules**: Try `pnpm install` to refresh dependencies
8. **Clean Build**: Delete `build/` and `.svelte-kit/`, then rebuild

### Specific Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `Cannot read properties of undefined (reading 'lat')` | Missing coordinates in data | Check `restaurants.json`, rerun parser |
| `Uncaught ReferenceError: L is not defined` | Leaflet not imported | Add `import 'leaflet/dist/leaflet.css'` in layout |
| `document is not defined` | SSR issue | Use `onMount` with dynamic import for Leaflet |
| `Failed to fetch` (map tiles) | Network issue or incorrect tile URL | Check internet connection, verify OSM URL |
| `Type 'X' is not assignable to type 'Y'` | TypeScript error | Add proper type annotations, check Svelte 5 syntax |

---

**End of CLAUDE.md**

*This document is maintained as a living reference for AI assistants. Update it when architecture, conventions, or workflows change significantly.*
