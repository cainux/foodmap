import { eq } from 'drizzle-orm';
import type { InternalStateData, StateStore } from '@atproto/oauth-client';
import type { Session, SessionStore } from '@atproto/oauth-client';
import { JoseKey } from '@atproto/jwk-jose';
import { atprotoOauthState, atprotoOauthSession } from '../db/schema';
import { getDb } from '../db';

/**
 * `InternalStateData`/`Session` carry a `dpopKey: Key` class instance (its
 * `algorithms`/`alg`/etc. getters live on the prototype, and for sessions
 * `tokenSet` is plain data alongside it). A plain JSON.stringify/parse
 * round-trip silently drops the prototype, leaving a dead object whose
 * getters read as undefined. Store the key as its JWK and reconstruct it
 * with JoseKey.fromJWK on the way back out.
 */
function serialize(value: unknown): string {
	return JSON.stringify(value, (_key, val) =>
		val && typeof val === 'object' && 'jwk' in val && typeof val.createJwt === 'function'
			? { __jwk: val.jwk }
			: val
	);
}

async function deserialize<T>(text: string): Promise<T> {
	const raw = JSON.parse(text);
	return reviveKeys(raw) as Promise<T>;
}

async function reviveKeys(value: unknown): Promise<unknown> {
	if (Array.isArray(value)) {
		return Promise.all(value.map(reviveKeys));
	}
	if (value && typeof value === 'object') {
		if ('__jwk' in value) {
			return JoseKey.fromJWK((value as { __jwk: Record<string, unknown> }).__jwk);
		}
		const entries = await Promise.all(
			Object.entries(value).map(async ([k, v]) => [k, await reviveKeys(v)] as const)
		);
		return Object.fromEntries(entries);
	}
	return value;
}

/**
 * OAuth authorize->callback state, persisted in D1 so it survives across
 * requests to different Worker instances during the redirect round-trip.
 */
export class D1StateStore implements StateStore {
	constructor(private d1: D1Database) {}

	async get(key: string): Promise<InternalStateData | undefined> {
		const db = getDb(this.d1);
		const row = await db.query.atprotoOauthState.findFirst({
			where: eq(atprotoOauthState.key, `state:${key}`)
		});
		return row ? await deserialize<InternalStateData>(row.value) : undefined;
	}

	async set(key: string, value: InternalStateData): Promise<void> {
		const db = getDb(this.d1);
		const serialized = serialize(value);
		await db
			.insert(atprotoOauthState)
			.values({ key: `state:${key}`, value: serialized, createdAt: Date.now() })
			.onConflictDoUpdate({
				target: atprotoOauthState.key,
				set: { value: serialized, createdAt: Date.now() }
			});
	}

	async del(key: string): Promise<void> {
		const db = getDb(this.d1);
		await db.delete(atprotoOauthState).where(eq(atprotoOauthState.key, `state:${key}`));
	}
}

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

async function importSessionKey(base64Key: string): Promise<CryptoKey> {
	const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
	return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptSession(value: Session, base64Key: string): Promise<string> {
	const key = await importSessionKey(base64Key);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const plaintext = new TextEncoder().encode(serialize(value));
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
	return JSON.stringify({
		iv: btoa(String.fromCharCode(...iv)),
		ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
	});
}

async function decryptSession(stored: string, base64Key: string): Promise<Session> {
	const { iv, ciphertext } = JSON.parse(stored) as { iv: string; ciphertext: string };
	const key = await importSessionKey(base64Key);
	const plaintext = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: Uint8Array.from(atob(iv), (c) => c.charCodeAt(0)) },
		key,
		Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
	);
	return deserialize<Session>(new TextDecoder().decode(plaintext));
}

/**
 * Signed-in sessions, persisted in D1 (encrypted at rest with
 * SESSION_ENCRYPTION_KEY) so they survive a Worker instance recycling instead
 * of forcing a re-login every time, mirroring D1StateStore. Rows past
 * SESSION_MAX_AGE_MS (matching the session cookie's own maxAge) are treated
 * as absent and cleaned up; a decrypt failure degrades the same way, to a
 * normal re-login rather than an uncaught error.
 */
export class D1SessionStore implements SessionStore {
	constructor(
		private d1: D1Database,
		private encryptionKey: string
	) {}

	async get(key: string): Promise<Session | undefined> {
		const db = getDb(this.d1);
		const row = await db.query.atprotoOauthSession.findFirst({
			where: eq(atprotoOauthSession.key, key)
		});
		if (!row) return undefined;
		if (Date.now() - row.createdAt > SESSION_MAX_AGE_MS) {
			await this.del(key);
			return undefined;
		}
		try {
			return await decryptSession(row.value, this.encryptionKey);
		} catch {
			await this.del(key);
			return undefined;
		}
	}

	async set(key: string, value: Session): Promise<void> {
		const db = getDb(this.d1);
		const encrypted = await encryptSession(value, this.encryptionKey);
		await db
			.insert(atprotoOauthSession)
			.values({ key, value: encrypted, createdAt: Date.now() })
			.onConflictDoUpdate({
				target: atprotoOauthSession.key,
				set: { value: encrypted, createdAt: Date.now() }
			});
	}

	async del(key: string): Promise<void> {
		const db = getDb(this.d1);
		await db.delete(atprotoOauthSession).where(eq(atprotoOauthSession.key, key));
	}
}

export function getAllowedHandles(env: { ALLOWED_HANDLES: string }): string[] {
	return env.ALLOWED_HANDLES.split(',')
		.map((h) => h.trim().toLowerCase())
		.filter(Boolean);
}

export function isHandleAllowed(handle: string, env: { ALLOWED_HANDLES: string }): boolean {
	return getAllowedHandles(env).includes(handle.toLowerCase());
}
