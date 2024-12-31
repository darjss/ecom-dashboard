CREATE TABLE `ecommerce-dashboard_session` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`user_id` integer,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(256),
	`google_id` text(256),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `ecommerce-dashboard_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `ecommerce-dashboard_user` (`username`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `ecommerce-dashboard_post` (`name`);