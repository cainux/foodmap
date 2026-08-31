CREATE TABLE `restaurants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`lat` real,
	`lng` real,
	`tags` text DEFAULT '' NOT NULL,
	`comment` text
);
