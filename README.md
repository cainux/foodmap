# 🍽️ Food Map

A static website built with SvelteKit that displays restaurants on an interactive map. Restaurant data is stored in Cloudflare D1 and rendered as interactive markers using MapLibre GL maps.

## Features

- 🗺️ Interactive map using MapLibre GL (WebGL-based)
- 📍 Restaurant markers with popups showing names and links to Google Maps
- 🔵 Marker clustering for better visualization when zoomed out
- 🧭 Geolocation support with "Find My Location" button
- 🎯 Auto-navigation to nearest restaurant
- 📏 Dynamic distance-based sorting from map center or user location
- 🎨 Clean, minimal styling with Pico CSS
- 📱 Responsive design with mobile-optimized interactions
- ⚡ Static site generation for fast loading
- 📲 Installable PWA that caches map tiles for offline use
- 🔗 Restaurant list with clickable cards that navigate the map
- 📤 Social media preview metadata for sharing

## Tech Stack

- **SvelteKit 2.50.1** - Full-stack framework with static adapter
- **Svelte 5.49.1** - Reactive UI components (using latest runes API)
- **MapLibre GL 4.7.1** - Interactive WebGL-based mapping library
- **svelte-maplibre-gl** - Svelte components for MapLibre GL integration
- **Pico CSS 2.1.1** - Minimal styling framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool and dev server
- **pnpm** - Fast, disk-efficient package manager

## Getting Started

1. Install dependencies:
```sh
pnpm install
```

2. Set up environment variables:
```sh
cp .env.example .env
```

`PUBLIC_CARTO_API_KEY` is the CARTO key used for the basemap raster tiles.

The dev and build steps also fetch `src/lib/restaurants.json` from Cloudflare D1 via `wrangler`, which needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment. In CI these are Cloudflare Pages project secrets.

3. Start the development server:
```sh
pnpm dev
```

4. Open your browser to `http://localhost:5173`

## Building

To create a production build:

```sh
pnpm build
```

The build process automatically:
1. Fetches restaurant data from Cloudflare D1 and generates `src/lib/restaurants.json`
2. Builds the static site to the `build/` directory

To preview the production build:

```sh
pnpm preview
```

**Note:** `src/lib/restaurants.json` is a generated file and not tracked in git. It's automatically created during development and build processes.

## Adding Restaurants

Restaurants are added, edited, and deleted through the `admin/` app (Bluesky OAuth-gated), which writes directly to the D1 database. It also has a manual "publish" control that triggers a rebuild/redeploy of this site.

## Deployment

The site is deployed to **Cloudflare Pages**, and the stack is Cloudflare-specific end to end:

- Restaurant data is the `restaurants` table in **Cloudflare D1**, the single source of truth.
- The build runs `wrangler d1 execute --remote` to snapshot D1 into `src/lib/restaurants.json`, so it needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set as Pages project secrets.
- The `admin/` app deploys separately as its own **Cloudflare Worker**, holds the only runtime D1 binding, and owns the schema migrations.
- Publishing is a Pages deploy hook that the admin POSTs to, which rebuilds and redeploys this site.

The `build/` output is plain static files, but a different host would still need the D1 snapshot step to run somewhere with Cloudflare credentials.
