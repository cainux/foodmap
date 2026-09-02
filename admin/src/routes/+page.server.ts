import { listRestaurants } from '$lib/server/db/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
	const all = await listRestaurants(platform!.env.DB);
	const q = url.searchParams.get('q')?.trim().toLowerCase() ?? '';

	const restaurants = q
		? all.filter((r) => r.name.toLowerCase().includes(q) || r.tags.toLowerCase().includes(q))
		: all;

	return { restaurants, q };
};
