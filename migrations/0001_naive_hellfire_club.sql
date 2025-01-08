CREATE TABLE `ecommerce-dashboard_brand` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`logo_url` text(512),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_cart_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cart_id` integer NOT NULL,
	`product_variant_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`cart_id`) REFERENCES `ecommerce-dashboard_cart`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_variant_id`) REFERENCES `ecommerce-dashboard_product_variant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_cart` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `ecommerce-dashboard_customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_customer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text(15) NOT NULL,
	`address` text(256),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_inventory_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_variant_id` integer NOT NULL,
	`previous_stock` integer NOT NULL,
	`new_stock` integer NOT NULL,
	`change_reason` text(50) NOT NULL,
	`reference_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_variant_id`) REFERENCES `ecommerce-dashboard_product_variant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_order_detail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_variant_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `ecommerce-dashboard_order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_variant_id`) REFERENCES `ecommerce-dashboard_product_variant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_order` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`total` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `ecommerce-dashboard_customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_payment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`provider` text(50) NOT NULL,
	`status` text(50) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `ecommerce-dashboard_order`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_product_image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_variant_id` integer NOT NULL,
	`url` text(512) NOT NULL,
	`is_primary` integer DEFAULT 0 NOT NULL,
	`display_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_variant_id`) REFERENCES `ecommerce-dashboard_product_variant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_product_variant` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`sku` text(50) NOT NULL,
	`name` text(256) NOT NULL,
	`stock` integer DEFAULT 0,
	`price` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `ecommerce-dashboard_product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text(50) NOT NULL,
	`name` text(256) NOT NULL,
	`slug` text(256) NOT NULL,
	`description` text,
	`status` text(20) DEFAULT 'draft' NOT NULL,
	`has_variants` integer DEFAULT 0 NOT NULL,
	`discount` integer DEFAULT 0,
	`category_id` integer,
	`brand_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `ecommerce-dashboard_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brand_id`) REFERENCES `ecommerce-dashboard_brand`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `ecommerce-dashboard_session`;--> statement-breakpoint
DROP TABLE `ecommerce-dashboard_post`;--> statement-breakpoint
/*
 SQLite does not support "Set not null to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `ecommerce-dashboard_user` ADD `role` text(20) DEFAULT 'admin' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_brand_name_unique` ON `ecommerce-dashboard_brand` (`name`);--> statement-breakpoint
CREATE INDEX `brand_name_idx` ON `ecommerce-dashboard_brand` (`name`);--> statement-breakpoint
CREATE INDEX `cart_item_cart_idx` ON `ecommerce-dashboard_cart_item` (`cart_id`);--> statement-breakpoint
CREATE INDEX `cart_item_variant_idx` ON `ecommerce-dashboard_cart_item` (`product_variant_id`);--> statement-breakpoint
CREATE INDEX `cart_customer_idx` ON `ecommerce-dashboard_cart` (`customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_category_name_unique` ON `ecommerce-dashboard_category` (`name`);--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `ecommerce-dashboard_category` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_customer_phone_unique` ON `ecommerce-dashboard_customer` (`phone`);--> statement-breakpoint
CREATE INDEX `phone_idx` ON `ecommerce-dashboard_customer` (`phone`);--> statement-breakpoint
CREATE INDEX `inventory_variant_idx` ON `ecommerce-dashboard_inventory_history` (`product_variant_id`);--> statement-breakpoint
CREATE INDEX `inventory_reason_idx` ON `ecommerce-dashboard_inventory_history` (`change_reason`);--> statement-breakpoint
CREATE INDEX `detail_order_idx` ON `ecommerce-dashboard_order_detail` (`order_id`);--> statement-breakpoint
CREATE INDEX `detail_variant_idx` ON `ecommerce-dashboard_order_detail` (`product_variant_id`);--> statement-breakpoint
CREATE INDEX `order_customer_idx` ON `ecommerce-dashboard_order` (`customer_id`);--> statement-breakpoint
CREATE INDEX `payment_order_idx` ON `ecommerce-dashboard_payment` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_status_idx` ON `ecommerce-dashboard_payment` (`status`);--> statement-breakpoint
CREATE INDEX `image_variant_idx` ON `ecommerce-dashboard_product_image` (`product_variant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_product_variant_sku_unique` ON `ecommerce-dashboard_product_variant` (`sku`);--> statement-breakpoint
CREATE INDEX `variant_product_idx` ON `ecommerce-dashboard_product_variant` (`product_id`);--> statement-breakpoint
CREATE INDEX `variant_name_idx` ON `ecommerce-dashboard_product_variant` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_product_sku_unique` ON `ecommerce-dashboard_product` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_product_slug_unique` ON `ecommerce-dashboard_product` (`slug`);--> statement-breakpoint
CREATE INDEX `product_sku_idx` ON `ecommerce-dashboard_product` (`sku`);--> statement-breakpoint
CREATE INDEX `product_name_idx` ON `ecommerce-dashboard_product` (`name`);--> statement-breakpoint
CREATE INDEX `product_slug_idx` ON `ecommerce-dashboard_product` (`slug`);--> statement-breakpoint
CREATE INDEX `product_status_idx` ON `ecommerce-dashboard_product` (`status`);--> statement-breakpoint
CREATE INDEX `product_category_idx` ON `ecommerce-dashboard_product` (`category_id`);--> statement-breakpoint
CREATE INDEX `product_brand_idx` ON `ecommerce-dashboard_product` (`brand_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_user_google_id_unique` ON `ecommerce-dashboard_user` (`google_id`);--> statement-breakpoint
CREATE INDEX `google_id_idx` ON `ecommerce-dashboard_user` (`google_id`);