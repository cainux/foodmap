import { getPublishState } from '$lib/server/db/queries';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!locals.session) {
		return { signedIn: false, publishPending: false };
	}

	const state = await getPublishState(platform!.env.DB);
	const publishPending =
		state.lastMutatedAt !== null &&
		(state.lastPublishedAt === null || state.lastMutatedAt > state.lastPublishedAt);

	return { signedIn: true, publishPending };
};
