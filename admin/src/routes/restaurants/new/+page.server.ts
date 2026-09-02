import { fail } from '@sveltejs/kit';
import { createRestaurant, listRestaurants } from '$lib/server/db/queries';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const all = await listRestaurants(platform!.env.DB);
	return { all };
};

function parseCoordinates(input: string): { lat: number | null; lng: number | null } {
	const match = input.trim().match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
	if (!match) return { lat: null, lng: null };
	return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
}

export const actions: Actions = {
	create: async ({ request, platform }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const url = String(data.get('url') ?? '').trim();
		const coordinates = String(data.get('coordinates') ?? '');
		const tags = String(data.get('tags') ?? '').trim();
		const comment = String(data.get('comment') ?? '').trim();

		if (!name || !url) {
			return fail(400, { formError: 'Name and URL are required' });
		}

		const { lat, lng } = parseCoordinates(coordinates);

		await createRestaurant(platform!.env.DB, {
			name,
			url,
			lat,
			lng,
			tags,
			comment: comment || null
		});

		return { success: true };
	}
};
