import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const raw = execFileSync(
	'npx',
	['wrangler', 'd1', 'execute', 'foodmap', '--remote', '--json', '--command', 'SELECT * FROM restaurants'],
	{ encoding: 'utf-8' }
);

const result = JSON.parse(raw);
const rows = result[0]?.results ?? [];

const restaurants = rows.map((row) => ({
	name: row.name,
	url: row.url,
	coordinates: row.lat !== null && row.lng !== null ? { lat: row.lat, lng: row.lng } : null,
	tags: row.tags ? row.tags.split(/\s+/).filter(Boolean) : [],
	...(row.comment && { comment: row.comment })
}));

const outputPath = join(__dirname, '../src/lib/restaurants.json');
writeFileSync(outputPath, JSON.stringify(restaurants, null, 2));

console.log(`Fetched ${restaurants.length} restaurants from D1`);
console.log(`Found coordinates for ${restaurants.filter((r) => r.coordinates).length} restaurants`);
console.log(`Saved to ${outputPath}`);
