CREATE TABLE `ecommerce-dashboard_brand` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`logo_url` text(512),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_brand_name_unique` ON `ecommerce-dashboard_brand` (`name`);--> statement-breakpoint
CREATE INDEX `brand_name_idx` ON `ecommerce-dashboard_brand` (`name`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_cart_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cart_id` integer NOT NULL,
	`product_variant_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`cart_id`) REFERENCES `ecommerce-dashboard_cart`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_variant_id`) REFERENCES `ecommerce-dashboard_product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cart_item_cart_idx` ON `ecommerce-dashboard_cart_item` (`cart_id`);--> statement-breakpoint
CREATE INDEX `cart_item_variant_idx` ON `ecommerce-dashboard_cart_item` (`product_variant_id`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_cart` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `ecommerce-dashboard_customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cart_customer_idx` ON `ecommerce-dashboard_cart` (`customer_id`);--> statement-breakpoint
CREATE INDEX `cart_id_idx` ON `ecommerce-dashboard_cart` (`id`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_category_name_unique` ON `ecommerce-dashboard_category` (`name`);--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `ecommerce-dashboard_category` (`name`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_customer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text(15) NOT NULL,
	`address` text(256),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_customer_phone_unique` ON `ecommerce-dashboard_customer` (`phone`);--> statement-breakpoint
CREATE INDEX `phone_idx` ON `ecommerce-dashboard_customer` (`phone`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_order_detail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_variant_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `ecommerce-dashboard_order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_variant_id`) REFERENCES `ecommerce-dashboard_product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `detail_order_idx` ON `ecommerce-dashboard_order_detail` (`order_id`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_order` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text(8) NOT NULL,
	`customer_id` integer NOT NULL,
	`status` text NOT NULL,
	`total` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `ecommerce-dashboard_customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_customer_idx` ON `ecommerce-dashboard_order` (`customer_id`);--> statement-breakpoint
CREATE INDEX `order_number_idx` ON `ecommerce-dashboard_order` (`order_number`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_payment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`provider` text(50) NOT NULL,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `ecommerce-dashboard_order`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payment_order_idx` ON `ecommerce-dashboard_payment` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_status_idx` ON `ecommerce-dashboard_payment` (`status`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_product_image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_variant_id` integer NOT NULL,
	`url` text(512) NOT NULL,
	`is_primary` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_variant_id`) REFERENCES `ecommerce-dashboard_product`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `image_variant_idx` ON `ecommerce-dashboard_product_image` (`product_variant_id`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`slug` text(256) NOT NULL,
	`description` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`discount` integer DEFAULT 0,
	`amount` text(15),
	`potency` text(10),
	`stock` integer DEFAULT 0,
	`price` integer NOT NULL,
	`daily_intake` integer DEFAULT 0,
	`category_id` integer,
	`brand_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `ecommerce-dashboard_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brand_id`) REFERENCES `ecommerce-dashboard_brand`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_product_slug_unique` ON `ecommerce-dashboard_product` (`slug`);--> statement-breakpoint
CREATE INDEX `product_name_idx` ON `ecommerce-dashboard_product` (`name`);--> statement-breakpoint
CREATE INDEX `product_slug_idx` ON `ecommerce-dashboard_product` (`slug`);--> statement-breakpoint
CREATE INDEX `product_status_idx` ON `ecommerce-dashboard_product` (`status`);--> statement-breakpoint
CREATE INDEX `product_category_idx` ON `ecommerce-dashboard_product` (`category_id`);--> statement-breakpoint
CREATE INDEX `product_brand_idx` ON `ecommerce-dashboard_product` (`brand_id`);--> statement-breakpoint
CREATE TABLE `ecommerce-dashboard_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(256) NOT NULL,
	`google_id` text(256),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ecommerce-dashboard_user_google_id_unique` ON `ecommerce-dashboard_user` (`google_id`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `ecommerce-dashboard_user` (`username`);--> statement-breakpoint
CREATE INDEX `google_id_idx` ON `ecommerce-dashboard_user` (`google_id`);