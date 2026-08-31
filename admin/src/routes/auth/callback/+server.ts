import { error, redirect } from '@sveltejs/kit';
import { createOAuthClient } from '$lib/server/auth/client';
import { isHandleAllowed } from '$lib/server/auth/atproto';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform, cookies }) => {
	const client = createOAuthClient(platform!.env.DB, url.origin, platform!.env.SESSION_ENCRYPTION_KEY);

	const { session } = await client.callback(url.searchParams).catch(() => {
		error(400, 'Sign-in failed');
	});

	const identity = await client.identityResolver.resolve(session.did);
	const handle = identity.handle !== 'handle.invalid' ? identity.handle : null;
	if (!handle || !isHandleAllowed(handle, platform!.env)) {
		await client.revoke(session.did).catch(() => {});
		error(403, 'This Bluesky account is not authorized to access foodmap admin');
	}

	cookies.set('foodmap_admin_session', session.did, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});

	redirect(302, '/');
};
