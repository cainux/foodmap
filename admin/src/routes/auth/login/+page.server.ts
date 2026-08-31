import { fail, redirect } from '@sveltejs/kit';
import { createOAuthClient } from '$lib/server/auth/client';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, url, platform }) => {
		const data = await request.formData();
		const handle = String(data.get('handle') ?? '').trim();
		if (!handle) return fail(400, { error: 'Enter your Bluesky handle' });

		const client = createOAuthClient(platform!.env.DB, url.origin, platform!.env.SESSION_ENCRYPTION_KEY);

		let authorizeUrl: URL;
		try {
			authorizeUrl = await client.authorize(handle);
		} catch {
			return fail(400, { error: 'Could not start sign-in for that handle' });
		}

		redirect(302, authorizeUrl.toString());
	}
};
