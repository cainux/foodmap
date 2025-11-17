# Extracting Real Coordinates

The current `src/lib/restaurants.json` file contains placeholder coordinates. To extract real coordinates from the Google Maps URLs, you have a few options:

## Option 1: Manual Extraction (Most Accurate)

1. Open each Google Maps URL from `data/restaurants.md` in your browser
2. Right-click on the map and select "What's here?"
3. Copy the coordinates shown at the bottom
4. Update the coordinates in `src/lib/restaurants.json`

## Option 2: Browser-based Extraction Script

Open the browser console on any page and run this script after updating the URLs array:

```javascript
const urls = [
  'https://maps.app.goo.gl/mTG2MTWQWzVsuGE89',
  'https://maps.app.goo.gl/E6s3Tma5Y9ii5Wpu5',
  // ... add all your URLs
];

async function extractCoords(url) {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const finalUrl = response.url;

    // Try different coordinate patterns
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
      /place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/
    ];

    for (const pattern of patterns) {
      const match = finalUrl.match(pattern);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
    }
    return null;
  } catch (e) {
    console.error('Error:', e);
    return null;
  }
}

// Run extraction with delay to avoid rate limiting
for (let i = 0; i < urls.length; i++) {
  setTimeout(async () => {
    const coords = await extractCoords(urls[i]);
    console.log(`URL ${i+1}: ${coords ? `${coords.lat}, ${coords.lng}` : 'No coords found'}`);
  }, i * 1000);
}
```

## Option 3: Using Node.js Script (If Network Access Available)

If you're running this locally with unrestricted network access:

```bash
node scripts/extract-coordinates.js
```

This script will attempt to geocode the restaurants using OpenStreetMap's Nominatim service.

## After Updating Coordinates

1. Update `src/lib/restaurants.json` with the real coordinates
2. Rebuild the site: `pnpm build`
3. Preview: `pnpm preview`
