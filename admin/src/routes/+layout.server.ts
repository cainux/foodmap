import { env } from 'cloudflare:workers';
import { getPublishState } from '#lib/server/db/queries.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.session) {
		return { signedIn: false, publishPending: false };
	}

	const state = await getPublishState(env.DB);
	const publishPending =
		state.lastMutatedAt !== null &&
		(state.lastPublishedAt === null || state.lastMutatedAt > state.lastPublishedAt);

	return { signedIn: true, publishPending };
};
