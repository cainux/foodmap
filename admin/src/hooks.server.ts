import { redirect, type Handle } from '@sveltejs/kit';
import { createOAuthClient } from '$lib/server/auth/client';

const PUBLIC_PATHS = ['/auth/login', '/auth/callback', '/client-metadata.json'];

export const handle: Handle = async ({ event, resolve }) => {
	if (PUBLIC_PATHS.some((path) => event.url.pathname.startsWith(path))) {
		return resolve(event);
	}

	const did = event.cookies.get('foodmap_admin_session');
	if (!did) {
		redirect(302, '/auth/login');
	}

	const client = createOAuthClient(event.platform!.env.DB, event.url.origin);
	try {
		event.locals.session = await client.restore(did);
	} catch {
		event.cookies.delete('foodmap_admin_session', { path: '/' });
		redirect(302, '/auth/login');
	}

	return resolve(event);
};
