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

const EC_CURVE: Record<string, string> = {
	ES256: 'P-256',
	ES384: 'P-384',
	ES512: 'P-521'
};

// WebcryptoKey.generate() delegates key generation to "jose", which resolves to
// its Node build under `vite dev` and returns a KeyObject rather than the
// CryptoKey that WebcryptoKey requires ("Invalid CryptoKeyPair"). Generating via
// crypto.subtle directly behaves identically on Node and workerd.
async function createKey(algs: readonly string[]): Promise<Key> {
	const alg = algs.find((a) => a in EC_CURVE);
	if (!alg) {
		throw new TypeError(`Unsupported algorithms: ${algs.join(', ')}`);
	}

	// extractable: true is required so the key's private JWK can be exported
	// (WebcryptoKey.fromKeypair otherwise falls back to exporting the public
	// key only, silently dropping the private "d" needed to sign).
	const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: EC_CURVE[alg] }, true, [
		'sign',
		'verify'
	]);

	return WebcryptoKey.fromKeypair(keyPair, crypto.randomUUID()) as unknown as Promise<Key>;
}

const runtimeImplementation: RuntimeImplementation = {
	createKey,
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
