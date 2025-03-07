import { getAllBrands } from "@/server/actions/brand";
import { getAllCategories } from "@/server/actions/category";
import { getProductById } from "@/server/actions/product";
import { orderStatus, paymentProvider, paymentStatus } from "./constants";
import { ResultSet } from "@libsql/client";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { getOrderById } from "@/server/actions/order";
export type BrandType = Awaited<ReturnType<typeof getAllBrands>>;
export type CategoryType = Awaited<ReturnType<typeof getAllCategories>>;
export type ProductType = Exclude<
  Exclude<Awaited<ReturnType<typeof getProductById>>, null>,
  { message: string; error: string }
>;
export type OrderType = Exclude<
  Exclude<Awaited<ReturnType<typeof getOrderById>>, null>,
  { message: string; error: string }
>;
export type PaymentProviderType = (typeof paymentProvider)[number];
export type PaymentStatusType = (typeof paymentStatus)[number] ;
export type TransactionType = SQLiteTransaction<
  "async",
  ResultSet,
  typeof import("@/server/db/schema"),
  ExtractTablesWithRelations<typeof import("@/server/db/schema")>
>;
export interface ProductImageType {
  id: number;
  url: string;
  isPrimary: boolean
}
export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}
export type FilterOptions<T> = Partial<Record<keyof T, any>>;

export type SortingState<T> = Array<{
  id: keyof T;
  desc?: boolean;
}>;

export interface PaginationOptions<T> {
  page: number;
  pageSize: number;
  sortBy?: keyof T;
  sortDirection?: "asc" | "desc";
  filters?: FilterOptions<T>;
}

export interface PaginatedResult<T> {
  data: T[];
  hasNextPage: boolean;
  nextPage?: number;
  previousPage?: number;
}
export type OrderStatusType=typeof orderStatus[number];
