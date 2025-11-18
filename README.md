# 🍽️ Food Map

A static website built with SvelteKit that displays restaurants on an interactive map. Restaurant data is sourced from `data/restaurants.md` and rendered as pins using Leaflet maps.

## Features

- 🗺️ Interactive map using Leaflet
- 📍 Restaurant pins with popups showing names and links to Google Maps
- 🎨 Clean, minimal styling with Pico CSS
- 📱 Responsive design
- ⚡ Static site generation for fast loading
- 🔗 Restaurant list with clickable cards

## Tech Stack

- **SvelteKit** - Framework
- **Leaflet** - Interactive maps
- **Pico CSS** - Minimal styling
- **TypeScript** - Type safety
- **Vite** - Build tool

## Getting Started

1. Install dependencies:
```sh
pnpm install
```

2. Start the development server:
```sh
pnpm dev
```

The development server automatically generates `src/lib/restaurants.json` from `data/restaurants.md` before starting.

3. Open your browser to `http://localhost:5173`

## Building

To create a production build:

```sh
pnpm build
```

The build process automatically:
1. Parses `data/restaurants.md` and generates `src/lib/restaurants.json`
2. Builds the static site to the `build/` directory

To preview the production build:

```sh
pnpm preview
```

**Note:** `src/lib/restaurants.json` is a generated file and not tracked in git. It's automatically created during development and build processes.

## Extracting Real Coordinates

See [COORDINATES.md](./COORDINATES.md) for instructions on how to extract real coordinates from the Google Maps URLs in `data/restaurants.md`.

## Adding Restaurants

1. Edit `data/restaurants.md` following the format:
   ```
   Restaurant Name
   https://maps.app.goo.gl/...
   51.5163842,-0.0693367

   ```

2. Extract coordinates using one of the methods in [COORDINATES.md](./COORDINATES.md)

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
