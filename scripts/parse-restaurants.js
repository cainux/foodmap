import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the restaurants.md file
const dataPath = join(__dirname, '../data/restaurants.md');
const content = readFileSync(dataPath, 'utf-8');

// Parse the content
const lines = content.split('\n').filter(line => line.trim() !== '');
const restaurants = [];

for (let i = 0; i < lines.length; i += 3) {
  const name = lines[i]?.trim();
  const url = lines[i + 1]?.trim();
  const coords = lines[i + 2]?.trim();

  if (name && url && url.startsWith('http')) {
    let coordinates = null;

    // Check if coordinates are present
    if (coords && coords.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
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
