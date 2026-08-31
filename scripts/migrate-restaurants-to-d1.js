import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, '../data/restaurants.yaml');
const content = readFileSync(dataPath, 'utf-8');
const data = parse(content);

function escapeSql(value) {
	return value.replace(/'/g, "''");
}

const statements = [];

for (const entry of data) {
	const { name, url, coordinates: coords, tags, comment } = entry;

	if (!name || !url || !url.startsWith('http')) continue;

	let lat = null;
	let lng = null;
	if (coords && typeof coords === 'string' && coords.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/)) {
		[lat, lng] = coords.split(/,\s*/).map(parseFloat);
	}

	const tagsStr = tags && typeof tags === 'string' ? tags.trim() : '';

	const columns = ['name', 'url', 'lat', 'lng', 'tags'];
	const values = [
		`'${escapeSql(name)}'`,
		`'${escapeSql(url)}'`,
		lat === null ? 'NULL' : lat,
		lng === null ? 'NULL' : lng,
		`'${escapeSql(tagsStr)}'`
	];

	if (comment) {
		columns.push('comment');
		values.push(`'${escapeSql(comment)}'`);
	}

	statements.push(`INSERT INTO restaurants (${columns.join(', ')}) VALUES (${values.join(', ')});`);
}

const outputPath = join(__dirname, '../drizzle/seed-from-yaml.sql');
writeFileSync(outputPath, statements.join('\n') + '\n');

console.log(`Wrote ${statements.length} INSERT statements to ${outputPath}`);
console.log('Run: npx wrangler d1 execute foodmap --remote --file=drizzle/seed-from-yaml.sql');
