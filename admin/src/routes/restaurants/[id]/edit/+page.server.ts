import { error, fail, redirect } from '@sveltejs/kit';
import { deleteRestaurant, getRestaurant, listRestaurants, updateRestaurant } from '$lib/server/db/queries';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, params }) => {
	const id = Number(params.id);
	if (Number.isNaN(id)) error(404, 'Not found');

	const [restaurant, all] = await Promise.all([
		getRestaurant(platform!.env.DB, id),
		listRestaurants(platform!.env.DB)
	]);

	if (!restaurant) error(404, 'Restaurant not found');

	return { restaurant, all };
};

function parseCoordinates(input: string): { lat: number | null; lng: number | null } {
	const match = input.trim().match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
	if (!match) return { lat: null, lng: null };
	return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
}

export const actions: Actions = {
	update: async ({ request, platform, params }) => {
		const id = Number(params.id);
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

		await updateRestaurant(platform!.env.DB, id, {
			name,
			url,
			lat,
			lng,
			tags,
			comment: comment || null
		});

		redirect(303, '/');
	},

	delete: async ({ platform, params }) => {
		const id = Number(params.id);
		await deleteRestaurant(platform!.env.DB, id);
		redirect(303, '/');
	}
};
