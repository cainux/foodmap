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
