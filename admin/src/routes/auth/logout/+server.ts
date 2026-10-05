import { env } from 'cloudflare:workers';
import { redirect } from '@sveltejs/kit';
import { createOAuthClient } from '#lib/server/auth/client.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, url }) => {
	const did = cookies.get('foodmap_admin_session');
	if (did) {
		const client = createOAuthClient(env.DB, url.origin, env.SESSION_ENCRYPTION_KEY);
		await client.revoke(did).catch(() => {});
	}

	cookies.delete('foodmap_admin_session', { path: '/' });
	redirect(302, '/auth/login');
};
