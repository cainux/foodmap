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
