import { env } from 'cloudflare:workers';
import { error, fail, redirect } from '@sveltejs/kit';
import {
	deleteRestaurant,
	getRestaurant,
	listRestaurants,
	updateRestaurant
} from '#lib/server/db/queries.js';
import { collectTags, readRestaurantInput } from '#lib/server/restaurantInput.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (Number.isNaN(id)) error(404, 'Not found');

	const [restaurant, all] = await Promise.all([
		getRestaurant(env.DB, id),
		listRestaurants(env.DB)
	]);

	if (!restaurant) error(404, 'Restaurant not found');

	return { restaurant, all, tags: collectTags(all) };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const input = readRestaurantInput(await request.formData());

		if (!input.ok) {
			return fail(400, {
				formError: input.formError,
				field: input.field,
				values: input.values
			});
		}

		await updateRestaurant(env.DB, id, input.record);

		return { saved: input.record.name };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		await deleteRestaurant(env.DB, id);
		redirect(303, '/');
	}
};
