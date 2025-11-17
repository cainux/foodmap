# Extracting Real Coordinates

The current `src/lib/restaurants.json` file contains **placeholder coordinates**. To extract real coordinates from the Google Maps URLs, you have a few options:

## Option 1: Use the Helper Tool (Easiest)

1. Open `coordinate-extractor.html` in your browser
2. Click each restaurant link to open in Google Maps
3. Look for coordinates in the URL (format: `@51.5155,-0.0922`)
4. Copy and paste the coordinates into the input field
5. Click "Generate JSON" and copy the output
6. Replace the contents of `src/lib/restaurants.json` with the generated JSON
7. Rebuild: `pnpm build`

## Option 2: Browser-based Extraction Script (Recommended)

This script will automatically extract coordinates and output a new `restaurants.md` format with coordinates included:

1. Open any webpage in your browser
2. Open the browser console (F12 → Console tab)
3. Copy and paste the entire contents of `scripts/extract-coordinates-browser.js`
4. Press Enter and wait (takes about 15 seconds)
5. Copy the output between `=== NEW restaurants.md FORMAT ===` and `=== END ===`
6. Save to `data/restaurants.md`
7. Run `pnpm parse:restaurants` to generate `src/lib/restaurants.json`
8. Run `pnpm build` to rebuild the site

The script already contains all your restaurant URLs and will output in this format:
```
Restaurant Name
https://maps.app.goo.gl/...
51.5155,-0.0922

```

## Option 3: Manual Extraction

1. Open each Google Maps URL from `data/restaurants.md` in your browser
2. Right-click on the map and select "What's here?"
3. Copy the coordinates shown at the bottom
4. Add them to `data/restaurants.md` as a third line under each URL
5. Run `pnpm parse:restaurants` to generate `src/lib/restaurants.json`

## Option 4: Using Node.js Script (If Network Access Available)

If you're running this locally with unrestricted network access:

```bash
node scripts/extract-coordinates.js
```

This script will attempt to geocode the restaurants using OpenStreetMap's Nominatim service.
