import { eq } from 'drizzle-orm';
import { getDb } from './index';
import { publishState, restaurants } from './schema';

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;
export type PublishState = typeof publishState.$inferSelect;

/** `publish_state` holds exactly one row. */
const PUBLISH_STATE_ID = 1;

export async function listRestaurants(d1: D1Database): Promise<Restaurant[]> {
	const db = getDb(d1);
	return db.select().from(restaurants).orderBy(restaurants.name).all();
}

export async function getRestaurant(d1: D1Database, id: number): Promise<Restaurant | undefined> {
	const db = getDb(d1);
	return db.query.restaurants.findFirst({ where: eq(restaurants.id, id) });
}

export async function createRestaurant(d1: D1Database, values: Omit<NewRestaurant, 'id'>): Promise<void> {
	const db = getDb(d1);
	await db.insert(restaurants).values(values);
	await touchMutation(d1);
}

export async function updateRestaurant(
	d1: D1Database,
	id: number,
	values: Omit<NewRestaurant, 'id'>
): Promise<void> {
	const db = getDb(d1);
	await db.update(restaurants).set(values).where(eq(restaurants.id, id));
	await touchMutation(d1);
}

export async function deleteRestaurant(d1: D1Database, id: number): Promise<void> {
	const db = getDb(d1);
	await db.delete(restaurants).where(eq(restaurants.id, id));
	await touchMutation(d1);
}

export async function getPublishState(d1: D1Database): Promise<PublishState> {
	const db = getDb(d1);
	const row = await db.query.publishState.findFirst({
		where: eq(publishState.id, PUBLISH_STATE_ID)
	});

	return (
		row ?? {
			id: PUBLISH_STATE_ID,
			lastMutatedAt: null,
			lastPublishedAt: null,
			lastDeploymentId: null
		}
	);
}

/**
 * Records that restaurant data changed. Called by the write functions above
 * rather than by their callers, so a future write path cannot omit it.
 */
export async function touchMutation(d1: D1Database, at = Date.now()): Promise<void> {
	const db = getDb(d1);
	await db
		.insert(publishState)
		.values({ id: PUBLISH_STATE_ID, lastMutatedAt: at })
		.onConflictDoUpdate({ target: publishState.id, set: { lastMutatedAt: at } });
}

/**
 * Records an accepted publish trigger. `deploymentId` is stored but never
 * interpreted — it exists so a publish can be traced to a deployment by hand.
 */
export async function recordPublish(
	d1: D1Database,
	deploymentId: string | null,
	at = Date.now()
): Promise<void> {
	const db = getDb(d1);
	await db
		.insert(publishState)
		.values({ id: PUBLISH_STATE_ID, lastPublishedAt: at, lastDeploymentId: deploymentId })
		.onConflictDoUpdate({
			target: publishState.id,
			set: { lastPublishedAt: at, lastDeploymentId: deploymentId }
		});
}
