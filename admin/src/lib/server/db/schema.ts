import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const restaurants = sqliteTable('restaurants', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	url: text('url').notNull(),
	lat: real('lat'),
	lng: real('lng'),
	tags: text('tags').notNull().default(''),
	comment: text('comment')
});

export const atprotoOauthState = sqliteTable('atproto_oauth_state', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	createdAt: integer('created_at').notNull()
});

export const atprotoOauthSession = sqliteTable('atproto_oauth_session', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	createdAt: integer('created_at').notNull()
});

/**
 * Single-row table (id is always 1) tracking how the public site relates to the
 * database. Deliberately not an `updated_at` column on `restaurants`: a deleted
 * row leaves no timestamp behind, so a delete would go unnoticed.
 */
export const publishState = sqliteTable('publish_state', {
	id: integer('id').primaryKey(),
	lastMutatedAt: integer('last_mutated_at'),
	lastPublishedAt: integer('last_published_at'),
	lastDeploymentId: text('last_deployment_id')
});
