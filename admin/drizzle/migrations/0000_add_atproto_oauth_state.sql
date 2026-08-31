CREATE TABLE IF NOT EXISTS `atproto_oauth_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` integer NOT NULL
);
