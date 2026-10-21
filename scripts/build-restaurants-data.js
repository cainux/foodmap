import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ATTEMPTS = 3;

// One `pnpm build` once died here with no usable error, then three identical runs passed.
// Retry, and print wrangler's own output so a repeat failure says why. With --json wrangler
// reports errors as JSON on stdout, not stderr, so both streams are needed.
function fetchRows() {
	for (let attempt = 1; ; attempt++) {
		try {
			const raw = execFileSync(
				'pnpm',
				['exec', 'wrangler', 'd1', 'execute', 'foodmap', '--remote', '--json', '--command', 'SELECT * FROM restaurants'],
				{ encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }
			);
			const rows = JSON.parse(raw)[0]?.results;
			// An empty array is a valid table; anything else is wrangler output we misread, and
			// publishing that as "no restaurants" would blank the site.
			if (!Array.isArray(rows)) throw new Error('wrangler output had no results array');
			return rows;
		} catch (err) {
			const detail =
				[err.stdout, err.stderr].map((s) => s?.toString().trim()).filter(Boolean).join('\n') || err.message;
			console.error(`D1 fetch failed (attempt ${attempt}/${ATTEMPTS}, exit ${err.status ?? 'n/a'}):\n${detail}`);
			if (attempt === ATTEMPTS) throw err;
			execFileSync('sleep', [String(attempt * 2)]);
		}
	}
}

const rows = fetchRows();

const restaurants = rows.map((row) => ({
	name: row.name,
	...(row.branch && { branch: row.branch }),
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
