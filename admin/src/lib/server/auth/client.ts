import { OAuthClient } from '@atproto/oauth-client';
import type { Key, RuntimeImplementation } from '@atproto/oauth-client';
import { WebcryptoKey } from '@atproto/jwk-webcrypto';
import { D1StateStore, MemorySessionStore } from './atproto';

const DIGEST_ALG: Record<string, string> = {
	sha256: 'SHA-256',
	sha384: 'SHA-384',
	sha512: 'SHA-512'
};

const runtimeImplementation: RuntimeImplementation = {
	createKey: (algs) => WebcryptoKey.generate(algs) as unknown as Promise<Key>,
	getRandomValues: (length) => crypto.getRandomValues(new Uint8Array(length)),
	digest: async (data, alg) => {
		const hash = await crypto.subtle.digest(DIGEST_ALG[alg.name], data);
		return new Uint8Array(hash);
	}
};

export function createOAuthClient(d1: D1Database, baseUrl: string) {
	return new OAuthClient({
		responseMode: 'query',
		handleResolver: 'https://bsky.social',
		clientMetadata: {
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
		},
		stateStore: new D1StateStore(d1),
		sessionStore: new MemorySessionStore(),
		runtimeImplementation
	});
}
