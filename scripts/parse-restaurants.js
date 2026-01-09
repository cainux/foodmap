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
  const { name, url, coordinates: coords, tags, comment } = entry;

  if (name && url && url.startsWith('http')) {
    let coordinates = null;

    // Check if coordinates are present and valid (allows optional space after comma)
    if (coords && typeof coords === 'string' && coords.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/)) {
      const [lat, lng] = coords.split(/,\s*/).map(parseFloat);
      coordinates = { lat, lng };
    }

    // Parse tags (space-separated string to array)
    const parsedTags = tags && typeof tags === 'string' ? tags.split(/\s+/).filter(t => t) : [];

    restaurants.push({
      name,
      url,
      coordinates,
      tags: parsedTags,
      ...(comment && { comment })
    });
  }
}

// Save the results
const outputPath = join(__dirname, '../src/lib/restaurants.json');
writeFileSync(outputPath, JSON.stringify(restaurants, null, 2));

console.log(`✅ Parsed ${restaurants.length} restaurants`);
console.log(`✅ Found coordinates for ${restaurants.filter(r => r.coordinates).length} restaurants`);
console.log(`✅ Saved to ${outputPath}`);
