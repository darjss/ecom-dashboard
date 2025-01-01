// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `ecommerce-dashboard_${name}`);

export const UsersTable = createTable(
  "user",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    username: text("username", { length: 256 }),
    googleId: text("google_id", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
      usernameIndex: index("username_idx").on(example.username),
  })
);

export const CustomersTable = createTable(  
  "customer",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    phone: text("phone", { length: 8 }),
    address: text("address", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({ 
    phoneIndex: index("phone_idx").on(example.phone),
  })
);

export type User=InferSelectModel<typeof UsersTable>;

