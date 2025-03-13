import { getAllBrands } from "@/server/actions/brand";
import { getAllCategories } from "@/server/actions/category";
import { getProductById, searchProductByNameForOrder } from "@/server/actions/product";
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
export type ProductSearchForOrderType=Awaited<ReturnType<typeof searchProductByNameForOrder>>[number]
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

export type OrderStatusType=typeof orderStatus[number];

export interface AddSalesType{
  productCost:number,
  quantitySold:number,
  orderId:number,
  sellingPrice:number,
  productId:number
  createdAt?:Date
}
export type TimeRange = "daily" | "weekly" | "monthly";
