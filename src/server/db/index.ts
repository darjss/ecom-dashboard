import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { Redis } from "@upstash/redis";
import * as schema from "./schema";

/**
 * Cache the database connection in development to avoid creating
 * a new connection on every HMR update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

const isDevelopment = process.env.NODE_ENV !== "production";

const getDbUrl = () => {
  if (isDevelopment) {
    return "file:dev.db";
  }

  if (!process.env.TURSO_CONNECTION_URL) {
    throw new Error(
      "TURSO_CONNECTION_URL environment variable is not defined in production",
    );
  }
  return process.env.TURSO_CONNECTION_URL;
};

export const client =
  globalForDb.client ??
  createClient({
    url: getDbUrl(),
    ...(isDevelopment ? {} : { authToken: process.env.TURSO_AUTH_TOKEN }),
  });

if (isDevelopment) globalForDb.client = client;

export const db = drizzle(client, { schema: schema, logger: true });
export let redis: Redis;

if (process.env.NODE_ENV === "development") {
  redis = new Redis({
    url:  "http://localhost:6379", // Default local URL
    token: "", // Empty token if no auth
  });
} else {
  redis = Redis.fromEnv(); // Use Upstash Redis in other environments (production)
}
