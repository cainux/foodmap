import { env } from 'cloudflare:workers';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { createOAuthClient } from '#lib/server/auth/client.js';

const PUBLIC_PATHS = ['/auth/login', '/auth/callback', '/client-metadata.json'];

export const handle: Handle = async ({ event, resolve }) => {
	if (PUBLIC_PATHS.some((path) => event.url.pathname.startsWith(path))) {
		return resolve(event);
	}

	const did = event.cookies.get('foodmap_admin_session');
	if (!did) {
		redirect(302, '/auth/login');
	}

	const client = createOAuthClient(env.DB, event.url.origin, env.SESSION_ENCRYPTION_KEY);
	try {
		event.locals.session = await client.restore(did);
	} catch {
		event.cookies.delete('foodmap_admin_session', { path: '/' });
		redirect(302, '/auth/login');
	}

	return resolve(event);
};
