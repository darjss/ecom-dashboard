"use server";
import "server-only";
import { db } from "../db";
import { redis } from "../db/redis";
import {
  OrdersTable,
  ProductsTable,
  SalesTable,
  CustomersTable,
  PaymentsTable,
  OrderDetailsTable,
  BrandsTable,
  CategoriesTable,
  ProductImagesTable,
} from "../db/schema";
import { AnalyticsData, TimeRange } from "@/lib/types";
import { and, eq, gte, sql, count, lt, or, desc } from "drizzle-orm";
import { calculateExpiration, getDaysFromTimeRange } from "./utils";
import { connection } from "next/server";

// Get average order value
export const getAverageOrderValue = async (timeRange: TimeRange) => {
  const orders = await db
    .select({
      avg: sql<number>`AVG(${OrdersTable.total})`,
    })
    .from(OrdersTable)
    .where(gte(OrdersTable.createdAt, await getDaysFromTimeRange(timeRange)));

  return orders[0]?.avg || 0;
};

// Get total profit
export const getTotalProfit = async (timeRange: TimeRange) => {
  const sales = await db
    .select({
      totalRevenue: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
      totalCost: sql<number>`SUM(${SalesTable.productCost} * ${SalesTable.quantitySold})`,
      totalDiscount: sql<number>`SUM(${SalesTable.discountApplied})`,
    })
    .from(SalesTable)
    .where(gte(SalesTable.createdAt, await getDaysFromTimeRange(timeRange)));

  const revenue = sales[0]?.totalRevenue || 0;
  const cost = sales[0]?.totalCost || 0;
  const discount = sales[0]?.totalDiscount || 0;

  return revenue - cost - discount;
};

// Get sales by category and brand
export const getSalesByCategory = async (timeRange: TimeRange) => {
  return await db
    .select({
      categoryName: CategoriesTable.name,
      brandName: BrandsTable.name,
      total: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
      quantity: sql<number>`SUM(${SalesTable.quantitySold})`,
    })
    .from(SalesTable)
    .leftJoin(ProductsTable, eq(SalesTable.productId, ProductsTable.id))
    .leftJoin(CategoriesTable, eq(ProductsTable.categoryId, CategoriesTable.id))
    .leftJoin(BrandsTable, eq(ProductsTable.brandId, BrandsTable.id))
    .where(gte(SalesTable.createdAt,await getDaysFromTimeRange(timeRange)))
    .groupBy(CategoriesTable.name, BrandsTable.name);
};

// Get customer lifetime value
export const getCustomerLifetimeValue = async () => {
  const result = await db
    .select({
      averageLifetimeValue: sql<number>`ROUND(AVG(total_spent), 2)`.as(
        "average_lifetime_value"
      ),
      totalCustomers: sql<number>`COUNT(DISTINCT ${OrdersTable.customerPhone})`.as(
        "total_customers"
      ),
      maxLifetimeValue: sql<number>`MAX(total_spent)`.as("max_lifetime_value"),
      minLifetimeValue: sql<number>`MIN(total_spent)`.as("min_lifetime_value"),
    })
    .from(
      db
        .select({
          customerPhone: OrdersTable.customerPhone,
          total_spent: sql<number>`SUM(${OrdersTable.total})`.as("total_spent"),
        })
        .from(OrdersTable)
        .groupBy(OrdersTable.customerPhone)
        .as("customer_totals")
    );
    if(result[0] === undefined){
      return {
        averageLifetimeValue: 0,
        totalCustomers: 0,
        maxLifetimeValue: 0,
        minLifetimeValue: 0,
      };
    }

  return {
    averageLifetimeValue: result[0].averageLifetimeValue,
    totalCustomers: result[0].totalCustomers,
    maxLifetimeValue: result[0].maxLifetimeValue,
    minLifetimeValue: result[0].minLifetimeValue,
  };
}

// Get repeat customers count
export const getRepeatCustomersCount = async (timeRange: TimeRange) => {
  const repeatCustomers = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${OrdersTable.customerPhone})`,
    })
    .from(OrdersTable)
    .where(
      and(
        gte(OrdersTable.createdAt,await getDaysFromTimeRange(timeRange)),
        sql`${OrdersTable.customerPhone} IN (
          SELECT customer_phone 
          FROM ecom_vit_order 
          GROUP BY customer_phone 
          HAVING COUNT(*) > 1
        )`,
      ),
    );

  return repeatCustomers[0]?.count || 0;
};

// Get inventory status
export const getInventoryStatus = async () => {
  return await db
    .select({
      productId: ProductsTable.id,
      name: ProductsTable.name,
      stock: ProductsTable.stock,
      status: sql<string>`CASE 
        WHEN ${ProductsTable.stock} = 0 THEN 'Out of Stock'
        WHEN ${ProductsTable.stock} < 10 THEN 'Low Stock'
        ELSE 'In Stock'
      END`,
    })
    .from(ProductsTable);
};

// Get failed payments
export const getFailedPayments = async (timeRange: TimeRange) => {
  return await db
    .select({
      count: sql<number>`COUNT(*)`,
      total: sql<number>`SUM(${OrdersTable.total})`,
    })
    .from(PaymentsTable)
    .leftJoin(OrdersTable, eq(PaymentsTable.orderId, OrdersTable.id))
    .where(
      and(
        gte(PaymentsTable.createdAt,await getDaysFromTimeRange(timeRange)),
        eq(PaymentsTable.status, "failed"),
      ),
    ).get();
};

export const getLowInventoryProducts = async () => {
  return await db
    .select({
      productId: ProductsTable.id,
      name: ProductsTable.name,
      stock: ProductsTable.stock,
      price: ProductsTable.price,
      imageUrl: ProductImagesTable.url,
      status: sql<string>`CASE 
        WHEN ${ProductsTable.stock} = 0 THEN 'Out of Stock'
        WHEN ${ProductsTable.stock} < 10 THEN 'Low Stock'
        ELSE 'In Stock'
      END`,
    })
    .from(ProductsTable)
    .leftJoin(
      ProductImagesTable,
      and(
        eq(ProductsTable.id, ProductImagesTable.productId),
        eq(ProductImagesTable.isPrimary, true),
      ),
    )
    .where(or(eq(ProductsTable.stock, 0), lt(ProductsTable.stock, 10)))
    .orderBy(ProductsTable.stock);
};

export const getTopBrandsBySales = async (timeRange: TimeRange) => {
  return await db
    .select({
      brandName: BrandsTable.name,
      total: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
      quantity: sql<number>`SUM(${SalesTable.quantitySold})`,
    })
    .from(SalesTable)
    .leftJoin(ProductsTable, eq(SalesTable.productId, ProductsTable.id))
    .leftJoin(BrandsTable, eq(ProductsTable.brandId, BrandsTable.id))
.where(gte(SalesTable.createdAt, await getDaysFromTimeRange(timeRange)))
    .groupBy(BrandsTable.name)
    .orderBy(
      sql`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`
    )
    .limit(5);
};

export const getCurrentProductsValue = async () => {
  const result = await db
    .select({
      total: sql<number>`SUM(${ProductsTable.price} * ${ProductsTable.stock})`,
    })
    .from(ProductsTable);
  return result[0]?.total || 0;
}

export const getAnalyticsData = async (timeRange: TimeRange) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const cacheKey = `analytics:${timeRange}`;

    // Check cache only in production
    if (isProd) {
      const cached = (await redis.get(cacheKey)) as string;
      if (cached) {
        return JSON.parse(cached) as AnalyticsData;
      }
    }

    const [
      averageOrderValue,
      totalProfit,
      salesByCategory,
      customerLifetimeValue,
      repeatCustomers,
      inventoryStatus,
      failedPayments,
      lowInventoryProducts,
      topBrands,
      currentProductsValue,
    ] = await Promise.all([
      getAverageOrderValue(timeRange),
      getTotalProfit(timeRange),
      getSalesByCategory(timeRange),
      getCustomerLifetimeValue(),
      getRepeatCustomersCount(timeRange),
      getInventoryStatus(),
      getFailedPayments(timeRange),
      getLowInventoryProducts(),
      getTopBrandsBySales(timeRange),
      getCurrentProductsValue(),
    ]);

    const analytics = {
      // Key metrics
      averageOrderValue,
      totalProfit,

      // Sales data
      salesByCategory,
      topBrands,

      // Customer metrics
      customerLifetimeValue: customerLifetimeValue || 0,
      repeatCustomers,

      // Inventory data
      inventoryStatus,
      lowInventoryProducts,

      // Payment data
      failedPayments,

      // Metadata
      lastUpdated: new Date().toISOString(),
      timeRange,

      // Add any computed metrics
      metrics: {
        totalProducts: inventoryStatus.length,
        lowStockCount: lowInventoryProducts.length,
        topBrandRevenue: topBrands.reduce((acc, brand) => acc + brand.total, 0),
        currentProductsValue,
      },
    };

    // Only cache in production
    if (isProd) {
      await redis.set(cacheKey, JSON.stringify(analytics), {
        ex: calculateExpiration(timeRange),
      });
    }

    return analytics;
  } catch (error) {
    console.error("Error fetching analytics:", error);
  }
};
