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

3. Open your browser to `http://localhost:5173`

## Building

To create a production build:

```sh
pnpm build
```

The static site will be generated in the `build/` directory.

To preview the production build:

```sh
pnpm preview
```

## Extracting Real Coordinates

The current coordinates in `src/lib/restaurants.json` are placeholders. See [COORDINATES.md](./COORDINATES.md) for instructions on how to extract real coordinates from the Google Maps URLs.

## Adding Restaurants

1. Edit `data/restaurants.md` following the format:
   ```
   Restaurant Name
   https://maps.app.goo.gl/...

   ```

2. Run the coordinate extraction script or manually add coordinates to `src/lib/restaurants.json`

3. Rebuild the site: `pnpm build`

## Deployment

The static site in the `build/` directory can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Or any static web host
