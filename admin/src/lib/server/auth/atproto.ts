import { eq } from 'drizzle-orm';
import type { InternalStateData, StateStore } from '@atproto/oauth-client';
import type { Session, SessionStore } from '@atproto/oauth-client';
import { JoseKey } from '@atproto/jwk-jose';
import { atprotoOauthState } from '../db/schema';
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

/**
 * Signed-in sessions, kept in memory only: the admin re-authenticates via
 * Bluesky if the Worker instance recycles, which is an acceptable trade-off
 * for a single-owner admin area with no offline-write requirement.
 */
const sessions = new Map<string, Session>();

export class MemorySessionStore implements SessionStore {
	async get(key: string): Promise<Session | undefined> {
		return sessions.get(key);
	}
	async set(key: string, value: Session): Promise<void> {
		sessions.set(key, value);
	}
	async del(key: string): Promise<void> {
		sessions.delete(key);
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
