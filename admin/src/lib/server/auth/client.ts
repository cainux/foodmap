import { OAuthClient } from '@atproto/oauth-client';
import type { Key, OAuthClientMetadataInput, RuntimeImplementation } from '@atproto/oauth-client';
import { WebcryptoKey } from '@atproto/jwk-webcrypto';
import { buildAtprotoLoopbackClientMetadata } from '@atproto/oauth-types';
import { D1StateStore, D1SessionStore } from './atproto';

const DIGEST_ALG: Record<string, string> = {
	sha256: 'SHA-256',
	sha384: 'SHA-384',
	sha512: 'SHA-512'
};

const runtimeImplementation: RuntimeImplementation = {
	// extractable: true is required so the key's private JWK can be exported
	// (WebcryptoKey.fromKeypair otherwise falls back to exporting the public
	// key only, silently dropping the private "d" needed to sign).
	createKey: (algs) =>
		WebcryptoKey.generate(algs, undefined, { extractable: true }) as unknown as Promise<Key>,
	getRandomValues: (length) => crypto.getRandomValues(new Uint8Array(length)),
	digest: async (data, alg) => {
		const hash = await crypto.subtle.digest(DIGEST_ALG[alg.name], data);
		return new Uint8Array(hash);
	}
};

// AT Protocol OAuth requires a real https client_id backed by a public
// client-metadata.json - except for local development, where it defines a
// special "loopback client" mode instead (client_id "http://localhost" with
// redirect_uris on a loopback IP literal, never the "localhost" hostname -
// see @atproto/oauth-types' oauthLoopbackRedirectURISchema).
function buildClientMetadata(baseUrl: string): OAuthClientMetadataInput {
	if (!baseUrl.startsWith('https://')) {
		return buildAtprotoLoopbackClientMetadata({
			redirect_uris: [`${baseUrl}/auth/callback`]
		});
	}
	return {
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
	};
}

export function createOAuthClient(d1: D1Database, baseUrl: string, sessionEncryptionKey: string) {
	return new OAuthClient({
		responseMode: 'query',
		handleResolver: 'https://public.api.bsky.app',
		clientMetadata: buildClientMetadata(baseUrl),
		stateStore: new D1StateStore(d1),
		sessionStore: new D1SessionStore(d1, sessionEncryptionKey),
		runtimeImplementation
	});
}
