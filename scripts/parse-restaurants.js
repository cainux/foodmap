import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the restaurants.yaml file
const dataPath = join(__dirname, '../data/restaurants.yaml');
const content = readFileSync(dataPath, 'utf-8');

// Parse the YAML content
const data = parse(content);
const restaurants = [];

for (const entry of data) {
  const { name, url, coordinates: coords } = entry;

  if (name && url && url.startsWith('http')) {
    let coordinates = null;

    // Check if coordinates are present and valid
    if (coords && typeof coords === 'string' && coords.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
      const [lat, lng] = coords.split(',').map(parseFloat);
      coordinates = { lat, lng };
    }

    restaurants.push({
      name,
      url,
      coordinates
    });
  }
}

// Save the results
const outputPath = join(__dirname, '../src/lib/restaurants.json');
writeFileSync(outputPath, JSON.stringify(restaurants, null, 2));

console.log(`✅ Parsed ${restaurants.length} restaurants`);
console.log(`✅ Found coordinates for ${restaurants.filter(r => r.coordinates).length} restaurants`);
console.log(`✅ Saved to ${outputPath}`);
