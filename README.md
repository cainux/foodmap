# 🍽️ Food Map

A static website built with SvelteKit that displays restaurants on an interactive map. Restaurant data is sourced from `data/restaurants.yaml` and rendered as interactive markers using MapLibre GL maps.

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

2. Start the development server:
```sh
pnpm dev
```

The development server automatically generates `src/lib/restaurants.json` from `data/restaurants.yaml` before starting.

3. Open your browser to `http://localhost:5173`

## Building

To create a production build:

```sh
pnpm build
```

The build process automatically:
1. Parses `data/restaurants.yaml` and generates `src/lib/restaurants.json`
2. Builds the static site to the `build/` directory

To preview the production build:

```sh
pnpm preview
```

**Note:** `src/lib/restaurants.json` is a generated file and not tracked in git. It's automatically created during development and build processes.

## Adding Restaurants

1. Edit `data/restaurants.yaml` following the format:
   ```yaml
   - name: Restaurant Name
     url: https://maps.app.goo.gl/...
     coordinates: 51.5163842,-0.0693367
     tags: optional-tag
   ```

2. Get coordinates by opening the Google Maps link in a browser — the lat/lng appear in the URL (e.g. `@51.5163842,-0.0693367`).

3. Start dev server or build - `restaurants.json` is automatically generated:
   ```sh
   pnpm dev   # or pnpm build
   ```

## Deployment

The static site in the `build/` directory can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Or any static web host
