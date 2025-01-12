import { sql } from "drizzle-orm";
import { 
  index, 
  int, 
  sqliteTableCreator, 
  text,
  primaryKey 
} from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const createTable = sqliteTableCreator((name) => `ecommerce-dashboard_${name}`);

// Users (Admin) Table
export const UsersTable = createTable(
  "user",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    username: text("username", { length: 256 }).notNull(),
    googleId: text("google_id", { length: 256 }).unique(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    usernameIndex: index("username_idx").on(table.username),
    googleIdIndex: index("google_id_idx").on(table.googleId),
  })
);

// Customers Table
export const CustomersTable = createTable(
  "customer",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    phone: text("phone", { length: 15 }).notNull().unique(),
    address: text("address", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    phoneIndex: index("phone_idx").on(table.phone),
  })
);

// Brands Table
export const BrandsTable = createTable(
  "brand",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }).notNull().unique(),
    logoUrl: text("logo_url", { length: 512 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    nameIndex: index("brand_name_idx").on(table.name),
  })
);

// Categories Table
export const CategoriesTable = createTable(
  "category",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }).notNull().unique(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    nameIndex: index("category_name_idx").on(table.name),
  })
);

// Products Table
export const ProductsTable = createTable(
  "product",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    sku: text("sku", { length: 50 }).notNull().unique(),
    name: text("name", { length: 256 }).notNull(),
    slug: text("slug", { length: 256 }).notNull().unique(),
    description: text("description"),
    status: text("status", { length: 20 }).default("draft").notNull(),
    hasVariants: int("has_variants", { mode: "boolean" }).default(sql`0`).notNull(),
    discount: int("discount", { mode: "number" }).default(0),
    dailyIntake: int("daily_intake", { mode: "number" }).default(0),
    categoryId: int("category_id", { mode: "number" }).references(() => CategoriesTable.id),
    brandId: int("brand_id", { mode: "number" }).references(() => BrandsTable.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    skuIndex: index("product_sku_idx").on(table.sku),
    nameIndex: index("product_name_idx").on(table.name),
    slugIndex: index("product_slug_idx").on(table.slug),
    statusIndex: index("product_status_idx").on(table.status),
    categoryIndex: index("product_category_idx").on(table.categoryId),
    brandIndex: index("product_brand_idx").on(table.brandId),
  })
);

// Product Variants Table
export const ProductVariantsTable = createTable(
  "product_variant",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    productId: int("product_id", { mode: "number" }).references(() => ProductsTable.id, { onDelete: "cascade" }).notNull(),
    sku: text("sku", { length: 50 }).notNull().unique(),
    amount: text("amount", { length: 15
     }).notNull(),
    potency: text("potency", { length: 10 }).notNull(),
    stock: int("stock", { mode: "number" }).default(0),
    price: int("price", { mode: "number" }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    productIndex: index("variant_product_idx").on(table.productId),
  })
);

// Product Images Table
export const ProductImagesTable = createTable(
  "product_image",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    productVariantId: int("product_variant_id", { mode: "number" }).references(() => ProductVariantsTable.id, { onDelete: "cascade" }).notNull(),
    url: text("url", { length: 512 }).notNull(),
    isPrimary: int("is_primary", { mode: "boolean" }).default(sql`0`).notNull(),
    displayOrder: int("display_order", { mode: "number" }).default(0),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    variantIndex: index("image_variant_idx").on(table.productVariantId),
  })
);

// Orders Table
export const OrdersTable = createTable(
  "order",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    orderNumber: text("order_number", { length: 8 }).notNull(),
    customerId: int("customer_id", { mode: "number" }).references(() => CustomersTable.id).notNull(),
    status: text("status", { length: 50 }).notNull(),
    total: int("total", { mode: "number" }).notNull(),
    notes: text("notes"),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    customerIndex: index("order_customer_idx").on(table.customerId),
  })
);

// Order Details Table
export const OrderDetailsTable = createTable(
  "order_detail",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    orderId: int("order_id", { mode: "number" }).references(() => OrdersTable.id, { onDelete: "cascade" }).notNull(),
    productVariantId: int("product_variant_id", { mode: "number" }).references(() => ProductVariantsTable.id).notNull(),
    quantity: int("quantity", { mode: "number" }).notNull(),
  },
  (table) => ({
    orderIndex: index("detail_order_idx").on(table.orderId),
    variantIndex: index("detail_variant_idx").on(table.productVariantId),
  })
);

// Payments Table
export const PaymentsTable = createTable(
  "payment",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    orderId: int("order_id", { mode: "number" }).references(() => OrdersTable.id).notNull(),
    provider: text("provider", { length: 50 }).notNull(),
    status: text("status", { length: 50 }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    orderIndex: index("payment_order_idx").on(table.orderId),
    statusIndex: index("payment_status_idx").on(table.status),
  })
);

// Cart Table
export const CartsTable = createTable(
  "cart",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    customerId: int("customer_id", { mode: "number" }).references(() => CustomersTable.id).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    customerIndex: index("cart_customer_idx").on(table.customerId),
  })
);

// Cart Items Table
export const CartItemsTable = createTable(
  "cart_item",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    cartId: int("cart_id", { mode: "number" }).references(() => CartsTable.id, { onDelete: "cascade" }).notNull(),
    productVariantId: int("product_variant_id", { mode: "number" }).references(() => ProductVariantsTable.id).notNull(),
    quantity: int("quantity", { mode: "number" }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    cartIndex: index("cart_item_cart_idx").on(table.cartId),
    variantIndex: index("cart_item_variant_idx").on(table.productVariantId),
  })
);

// Inventory History Table
export const InventoryHistoryTable = createTable(
  "inventory_history",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    productVariantId: int("product_variant_id", { mode: "number" }).references(() => ProductVariantsTable.id).notNull(),
    previousStock: int("previous_stock", { mode: "number" }).notNull(),
    newStock: int("new_stock", { mode: "number" }).notNull(),
    changeReason: text("change_reason", { length: 50 }).notNull(),
    referenceId: int("reference_id", { mode: "number" }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    variantIndex: index("inventory_variant_idx").on(table.productVariantId),
    reasonIndex: index("inventory_reason_idx").on(table.changeReason),
  })
);

export type UserSelectType = InferSelectModel<typeof UsersTable>;
export type CustomerSelectType = InferSelectModel<typeof CustomersTable>;
export type BrandSelectType = InferSelectModel<typeof BrandsTable>;
export type CategorySelectType = InferSelectModel<typeof CategoriesTable>;
export type ProductSelectType = InferSelectModel<typeof ProductsTable>;
export type ProductVariantSelectType = InferSelectModel<
  typeof ProductVariantsTable
>;
export type ProductImageSelectType = InferSelectModel<
  typeof ProductImagesTable
>;
export type OrderSelectType = InferSelectModel<typeof OrdersTable>;
export type OrderDetailSelectType = InferSelectModel<typeof OrderDetailsTable>;
export type PaymentSelectType = InferSelectModel<typeof PaymentsTable>;
export type CartSelectType = InferSelectModel<typeof CartsTable>;
export type CartItemSelectType = InferSelectModel<typeof CartItemsTable>;
export type InventoryHistorySelectType = InferSelectModel<
  typeof InventoryHistoryTable
>;
export type UserInsertType = InferInsertModel<typeof UsersTable>;
export type CustomerInsertType = InferInsertModel<typeof CustomersTable>;
export type BrandInsertType = InferInsertModel<typeof BrandsTable>;
export type CategoryInsertType = InferInsertModel<typeof CategoriesTable>;
export type ProductInsertType = InferInsertModel<typeof ProductsTable>;
export type ProductVariantInsertType = InferInsertModel<
  typeof ProductVariantsTable
>;
export type ProductImageInsertType = InferInsertModel<
  typeof ProductImagesTable
>;
export type OrderInsertType = InferInsertModel<typeof OrdersTable>;
export type OrderDetailInsertType = InferInsertModel<typeof OrderDetailsTable>;
export type PaymentInsertType = InferInsertModel<typeof PaymentsTable>;
export type CartInsertType = InferInsertModel<typeof CartsTable>;
export type CartItemInsertType = InferInsertModel<typeof CartItemsTable>;
export type InventoryHistoryInsertType = InferInsertModel<
  typeof InventoryHistoryTable
>;
