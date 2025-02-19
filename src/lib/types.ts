import { getAllBrands } from "@/server/actions/brand";
import { getAllCategories } from "@/server/actions/category";
import { getProductById } from "@/server/actions/product";
import { paymentProvider, paymentStatus } from "./constants";
import { ResultSet } from "@libsql/client";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
export type BrandType = Awaited<ReturnType<typeof getAllBrands>>;
export type CategoryType = Awaited<ReturnType<typeof getAllCategories>>;
export type ProductType = Exclude<
  Exclude<Awaited<ReturnType<typeof getProductById>>, null>,
  { message: string; error: string }
>;
export type PaymentProviderType = (typeof paymentProvider)[number];
export type PaymentStatusType = (typeof paymentStatus)[number];
export type TransactionType = SQLiteTransaction<
  "async",
  ResultSet,
  typeof import("@/server/db/schema"),
  ExtractTablesWithRelations<
    typeof import("@/server/db/schema")
  >
>;
export interface ProductImageType {
  id: number;
  url: string;
}
export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}
