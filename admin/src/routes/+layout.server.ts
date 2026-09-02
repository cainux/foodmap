import { createOAuthClient } from '$lib/server/auth/client';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform, url }) => {
	if (!locals.session) {
		return { handle: null };
	}

	const client = createOAuthClient(
		platform!.env.DB,
		url.origin,
		platform!.env.SESSION_ENCRYPTION_KEY
	);
	const identity = await client.identityResolver.resolve(locals.session.did);
	const handle = identity.handle !== 'handle.invalid' ? identity.handle : null;

	return { handle };
};
