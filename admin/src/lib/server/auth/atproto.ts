import { eq } from 'drizzle-orm';
import type { InternalStateData, StateStore } from '@atproto/oauth-client';
import type { Session, SessionStore } from '@atproto/oauth-client';
import { atprotoOauthState } from '../db/schema';
import { getDb } from '../db';

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
		return row ? JSON.parse(row.value) : undefined;
	}

	async set(key: string, value: InternalStateData): Promise<void> {
		const db = getDb(this.d1);
		await db
			.insert(atprotoOauthState)
			.values({ key: `state:${key}`, value: JSON.stringify(value), createdAt: Date.now() })
			.onConflictDoUpdate({
				target: atprotoOauthState.key,
				set: { value: JSON.stringify(value), createdAt: Date.now() }
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
