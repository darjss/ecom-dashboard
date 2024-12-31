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

export const SessionsTable= createTable(
  "session",
  {
    id: text("id", { length: 256 }).primaryKey(),
    userId: int("user_id", { mode: "number" }),
    expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
  },
  (example) => ({
    userIdIndex: index("user_id_idx").on(example.userId),
  })
);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  })
);

export type User=InferSelectModel<typeof UsersTable>;
export type Session=InferSelectModel<typeof SessionsTable>;
