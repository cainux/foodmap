CREATE TABLE IF NOT EXISTS `publish_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`last_mutated_at` integer,
	`last_published_at` integer,
	`last_deployment_id` text
);
--> statement-breakpoint
INSERT OR IGNORE INTO `publish_state` (`id`, `last_mutated_at`, `last_published_at`, `last_deployment_id`)
VALUES (1, NULL, NULL, NULL);
