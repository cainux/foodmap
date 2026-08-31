import { eq } from 'drizzle-orm';
import { getDb } from './index';
import { restaurants } from './schema';

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;

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
}

export async function updateRestaurant(
	d1: D1Database,
	id: number,
	values: Omit<NewRestaurant, 'id'>
): Promise<void> {
	const db = getDb(d1);
	await db.update(restaurants).set(values).where(eq(restaurants.id, id));
}

export async function deleteRestaurant(d1: D1Database, id: number): Promise<void> {
	const db = getDb(d1);
	await db.delete(restaurants).where(eq(restaurants.id, id));
}
