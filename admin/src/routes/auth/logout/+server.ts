import { redirect } from '@sveltejs/kit';
import { createOAuthClient } from '$lib/server/auth/client';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, platform, url }) => {
	const did = cookies.get('foodmap_admin_session');
	if (did) {
		const client = createOAuthClient(platform!.env.DB, url.origin, platform!.env.SESSION_ENCRYPTION_KEY);
		await client.revoke(did).catch(() => {});
	}

	cookies.delete('foodmap_admin_session', { path: '/' });
	redirect(302, '/auth/login');
};
