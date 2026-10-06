import { env } from 'cloudflare:workers';
import { listRestaurants } from '#lib/server/db/queries.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// The whole list is loaded on every view, so filtering happens in the browser.
	return { restaurants: await listRestaurants(env.DB) };
};
