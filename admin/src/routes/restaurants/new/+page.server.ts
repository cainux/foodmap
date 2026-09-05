import { fail } from '@sveltejs/kit';
import { createRestaurant, listRestaurants } from '$lib/server/db/queries';
import { collectTags, readRestaurantInput } from '$lib/server/restaurantInput';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const all = await listRestaurants(platform!.env.DB);
	return { all, tags: collectTags(all) };
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		const input = readRestaurantInput(await request.formData());

		if (!input.ok) {
			return fail(400, {
				formError: input.formError,
				field: input.field,
				values: input.values
			});
		}

		await createRestaurant(platform!.env.DB, input.record);

		return { created: input.record.name };
	}
};
