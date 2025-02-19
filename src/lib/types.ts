import { getAllBrands } from "@/server/actions/brand";
import { getAllCategories } from "@/server/actions/category";
import { getProductById } from "@/server/actions/product";
import { paymentProvider, paymentStatus } from "./constants";
import { ResultSet } from "@libsql/client";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations, getTableColumns, Table } from "drizzle-orm";
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
export type FilterOptions<T> = Partial<Record<keyof T, any>>;

export type SortingState<T> = {
  id: keyof T;
  desc: boolean;
}[];

export type PaginationOptions = {
  page: number;
  pageSize: number;
};

export type QueryOptions<T> = {
  filters?: FilterOptions<T>;
  sorting?: SortingState<T>;
  pagination?: PaginationOptions;
};
export type PaginatedResponse<T> = {
  data: T[]; // The paginated data
  pagination: {
    page: number; // Current page number
    pageSize: number; // Number of items per page
    total: number; // Total number of items
    totalPages: number; // Total number of pages
  };
};
export type PaginatedQueryOptions<T> = {
  // The base query built with Drizzle
  baseQuery: any; // Use `any` for flexibility, or define a more specific type
  // Available sort fields and their corresponding columns
  sortableFields: Record<string, any>; // Maps field names to Drizzle column references
  // Optional transform function for the results
  transform?: (row: Record<string, any>) => T;
};
type TableColumns<T extends Table> = keyof ReturnType<typeof getTableColumns<T>>;
export type SortableFields<T extends Table> = {
  [K in TableColumns<T>]: any; // Replace `any` with the specific Drizzle column type if available
};

