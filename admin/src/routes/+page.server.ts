import { listRestaurants } from '$lib/server/db/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	// The whole list is loaded on every view, so filtering happens in the browser.
	return { restaurants: await listRestaurants(platform!.env.DB) };
};
