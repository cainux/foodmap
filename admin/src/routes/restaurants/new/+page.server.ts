import { env } from 'cloudflare:workers';
import { fail } from '@sveltejs/kit';
import { createRestaurant, listRestaurants } from '#lib/server/db/queries.js';
import { collectTags, readRestaurantInput } from '#lib/server/restaurantInput.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const all = await listRestaurants(env.DB);
	return { all, tags: collectTags(all) };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const input = readRestaurantInput(await request.formData());

		if (!input.ok) {
			return fail(400, {
				formError: input.formError,
				field: input.field,
				values: input.values
			});
		}

		await createRestaurant(env.DB, input.record);

		return { created: input.record.name };
	}
};
