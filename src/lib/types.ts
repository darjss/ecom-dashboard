import { getAllBrands } from "@/server/actions/brand";
import { getAllCategories } from "@/server/actions/category";
import {
  getProductById,
  searchProductByNameForOrder,
} from "@/server/actions/product";
import {
  deliveryProvider,
  orderStatus,
  paymentProvider,
  paymentStatus,
  status,
} from "./constants";
import { ResultSet } from "@libsql/client";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { getOrderById } from "@/server/actions/order";
import { UserSelectType } from "@/server/db/schema";
export type BrandType = Awaited<ReturnType<typeof getAllBrands>>;
export type CategoryType = Awaited<ReturnType<typeof getAllCategories>>;
export type ProductStatusType = (typeof status)[number];
export type ProductType = Exclude<
  Exclude<Awaited<ReturnType<typeof getProductById>>, null>,
  { message: string; error: string }
>;
export type ProductSearchForOrderType = Awaited<
  ReturnType<typeof searchProductByNameForOrder>
>[number];
export type OrderType = Exclude<
  Exclude<Awaited<ReturnType<typeof getOrderById>>, null>,
  { message: string; error: string }
>;
export type PaymentProviderType = (typeof paymentProvider)[number];
export type PaymentStatusType = (typeof paymentStatus)[number];
export type OrderDeliveryProviderType = (typeof deliveryProvider)[number];
export type TransactionType = SQLiteTransaction<
  "async",
  ResultSet,
  typeof import("@/server/db/schema"),
  ExtractTablesWithRelations<typeof import("@/server/db/schema")>
>;
export interface ProductImageType {
  id: number;
  url: string;
  isPrimary: boolean;
}
export interface Session {
  id: string;
  user: UserSelectType;
  expiresAt: Date;
}

export type OrderStatusType = (typeof orderStatus)[number];

export interface AddSalesType {
  productCost: number;
  quantitySold: number;
  orderId: number;
  sellingPrice: number;
  productId: number;
  createdAt?: Date;
}
export type TimeRange = "daily" | "weekly" | "monthly";

// Interface for the structure of items in the salesByCategory array
export interface SalesByCategoryItem {
  categoryName: string | null; // Nullable due to LEFT JOIN
  brandName: string | null; // Nullable due to LEFT JOIN
  total: number;
  quantity: number;
}

// Interface for the structure of items in the topBrands array
export interface TopBrandItem {
  brandName: string | null; // Nullable due to LEFT JOIN
  total: number;
  quantity: number;
}

// Interface for the structure of the customerLifetimeValue object
export interface CustomerLifetimeValue {
  averageLifetimeValue: number;
  totalCustomers: number;
  maxLifetimeValue: number;
  minLifetimeValue: number;
}

// Interface for the structure of items in the inventoryStatus array
export interface InventoryStatusItem {
  productId: string; // Assuming product ID is a string, adjust if number
  name: string;
  stock: number;
  status: "Out of Stock" | "Low Stock" | "In Stock"; // More specific type based on CASE
}

// Interface for the structure of items in the lowInventoryProducts array
export interface LowInventoryProductItem {
  productId: number; // Assuming product ID is a string, adjust if number
  name: string;
  stock: number;
  price: number; // Assuming price is a number
  imageUrl: string | null; // Nullable due to LEFT JOIN
  status: string; // More specific type based on CASE
}

// Interface for the structure of items in the failedPayments array
export interface FailedPaymentItem {
  count: number;
  total: number | null; // SUM can be null if count is 0
}

// Interface for the nested metrics object
interface AnalyticsMetrics {
  totalProducts: number;
  lowStockCount: number;
  topBrandRevenue: number;
  currentProductsValue: number;
}

// The main interface for the entire analytics data structure
export interface AnalyticsData {
  // Key metrics
  averageOrderValue: number;
  totalProfit: number;

  // Sales data
  salesByCategory: SalesByCategoryItem[];
  topBrands: TopBrandItem[];

  // Customer metrics
  customerLifetimeValue: CustomerLifetimeValue;
  repeatCustomers: number;

  // Inventory data
  inventoryStatus: InventoryStatusItem[];
  lowInventoryProducts: LowInventoryProductItem[];

  // Payment data
  failedPayments: FailedPaymentItem; // It returns an array, usually with one item

  // Metadata
  lastUpdated: string; // ISO date string
  timeRange: TimeRange;

  // Computed metrics
  metrics: AnalyticsMetrics;
}

// --- Added types for Dashboard Home Page Data ---

interface SalesAnalytics {
  sum: number;
  salesCount: number;
  profit: number;
}

interface MostSoldProduct {
  productId: number;
  totalSold: number;
  name: string | null;
  imageUrl: string | null;
}

interface OrderCount {
  count: number;
}

export interface DashboardHomePageData {
  salesData: {
    daily: SalesAnalytics;
    weekly: SalesAnalytics;
    monthly: SalesAnalytics;
  };
  mostSoldProducts: {
    daily: MostSoldProduct[];
    weekly: MostSoldProduct[];
    monthly: MostSoldProduct[];
  };
  orderCounts: {
    daily: OrderCount;
    weekly: OrderCount;
    monthly: OrderCount;
  };
  pendingOrders: OrderType[]; // Assuming pendingOrders are of OrderType, adjust if necessary
  lastFetched: string; // ISO date string
  error?: string; // Optional error field
}

// Type for the error structure returned by getDashboardHomePageData
export interface DashboardHomePageErrorData {
  salesData: {
    daily: SalesAnalytics;
    weekly: SalesAnalytics;
    monthly: SalesAnalytics;
  };
  mostSoldProducts: {
    daily: MostSoldProduct[];
    weekly: MostSoldProduct[];
    monthly: MostSoldProduct[];
  };
  orderCounts: {
    daily: OrderCount;
    weekly: OrderCount;
    monthly: OrderCount;
  };
  pendingOrders: []; // Empty array for pending orders on error
  lastFetched: string; // ISO date string
  error: string; // Required error field
}
