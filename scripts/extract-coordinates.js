import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function extractCoordinates() {
  // Read the restaurants.md file
  const dataPath = join(__dirname, '../data/restaurants.md');
  const content = readFileSync(dataPath, 'utf-8');

  // Parse the content
  const lines = content.split('\n');
  const restaurants = [];

  for (let i = 0; i < lines.length; i += 3) {
    const name = lines[i]?.trim();
    const url = lines[i + 1]?.trim();

    if (name && url && url.startsWith('http')) {
      restaurants.push({ name, url, coordinates: null });
    }
  }

  console.log(`Found ${restaurants.length} restaurants`);
  console.log('Geocoding restaurants using Nominatim (OpenStreetMap)...\n');

  // Use Nominatim geocoding service
  for (const restaurant of restaurants) {
    try {
      console.log(`Geocoding: ${restaurant.name}`);

      // Clean up the name for better geocoding results
      const searchName = restaurant.name + ', London, UK';

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchName)}` +
        `&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'FoodMap-SvelteKit/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        restaurant.coordinates = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log(`  ✓ Coordinates: ${restaurant.coordinates.lat}, ${restaurant.coordinates.lng}\n`);
      } else {
        console.log(`  ✗ No results found\n`);
      }

      // Respect Nominatim's usage policy - max 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1100));
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}\n`);
    }
  }

  // Save the results
  const outputPath = join(__dirname, '../src/lib/restaurants.json');
  writeFileSync(outputPath, JSON.stringify(restaurants, null, 2));

  console.log(`\nSaved ${restaurants.length} restaurants to ${outputPath}`);
  console.log(`Successfully extracted coordinates for ${restaurants.filter(r => r.coordinates).length} restaurants`);
}

extractCoordinates().catch(console.error);
