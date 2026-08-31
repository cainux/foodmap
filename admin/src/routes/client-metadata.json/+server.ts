import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const baseUrl = url.origin;
	return json({
		client_id: `${baseUrl}/client-metadata.json`,
		client_name: 'foodmap admin',
		client_uri: baseUrl,
		redirect_uris: [`${baseUrl}/auth/callback`],
		grant_types: ['authorization_code', 'refresh_token'],
		response_types: ['code'],
		scope: 'atproto',
		token_endpoint_auth_method: 'none',
		application_type: 'web',
		dpop_bound_access_tokens: true
	});
};
