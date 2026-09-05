import { error, fail, redirect } from '@sveltejs/kit';
import {
	deleteRestaurant,
	getRestaurant,
	listRestaurants,
	updateRestaurant
} from '$lib/server/db/queries';
import { collectTags, readRestaurantInput } from '$lib/server/restaurantInput';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, params }) => {
	const id = Number(params.id);
	if (Number.isNaN(id)) error(404, 'Not found');

	const [restaurant, all] = await Promise.all([
		getRestaurant(platform!.env.DB, id),
		listRestaurants(platform!.env.DB)
	]);

	if (!restaurant) error(404, 'Restaurant not found');

	return { restaurant, all, tags: collectTags(all) };
};

export const actions: Actions = {
	update: async ({ request, platform, params }) => {
		const id = Number(params.id);
		const input = readRestaurantInput(await request.formData());

		if (!input.ok) {
			return fail(400, {
				formError: input.formError,
				field: input.field,
				values: input.values
			});
		}

		await updateRestaurant(platform!.env.DB, id, input.record);

		return { saved: input.record.name };
	},

	delete: async ({ platform, params }) => {
		const id = Number(params.id);
		await deleteRestaurant(platform!.env.DB, id);
		redirect(303, '/');
	}
};
