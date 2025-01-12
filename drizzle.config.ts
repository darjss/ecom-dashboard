import { type Config } from "drizzle-kit";

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  schema: './src/server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: isDevelopment ? {
    url: 'file:local.db'  // Match the URL used in database client
  } : {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;