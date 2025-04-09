"use server";
import "server-only";
import { db } from "../db";
import {
  OrdersTable,
  ProductImagesTable,
  ProductsTable,
  SalesTable,
} from "../db/schema";
import {
  AddSalesType,
  DashboardHomePageData,
  DashboardHomePageErrorData,
  TimeRange,
  TransactionType,
} from "@/lib/types";
import { and, between, eq, gte, sql } from "drizzle-orm";
import {
  calculateExpiration,
  getDaysFromTimeRange,
  getStartAndEndofDayAgo,
} from "./utils";
import { redis } from "../db/redis";
import { getCachedOrderCount, getPendingOrders, getOrderCount } from "./order";

export const addSale = async (sale: AddSalesType, tx?: TransactionType) => {
  try {
    const result = await (tx || db).insert(SalesTable).values(sale);
  } catch (e) {
    console.log(e);
  }
};

export const getAnalyticsForHome = async (timeRange: TimeRange = "daily") => {
  try {
    const result = await db
      .select({
        sum: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
        cost: sql<number>`SUM(${SalesTable.productCost} * ${SalesTable.quantitySold})`,
        salesCount: sql<number>`COUNT(*)`,
      })
      .from(SalesTable)
      .where(gte(SalesTable.createdAt, await getDaysFromTimeRange(timeRange)))
      .get();

    const sum = result?.sum ?? 0;
    const cost = result?.cost ?? 0;
    const profit = sum - cost;
    const salesCount = result?.salesCount ?? 0;
    const mostSoldProducts = await db
      .select({
        productId: SalesTable.productId,
        totalSold: sql<number>`SUM(${SalesTable.quantitySold})`,
        name: ProductsTable.name,
        imageUrl: ProductImagesTable.url,
      })
      .from(SalesTable)
      .leftJoin(ProductsTable, eq(SalesTable.productId, ProductsTable.id))
      .leftJoin(
        ProductImagesTable,
        eq(SalesTable.productId, ProductImagesTable.productId),
      )
      .where(
        and(
          gte(SalesTable.createdAt, await getDaysFromTimeRange(timeRange)),
          eq(ProductImagesTable.isPrimary, true),
        ),
      )
      .groupBy(SalesTable.productId)
      .orderBy(sql`SUM(${SalesTable.quantitySold}) DESC`)
      .limit(5);
    console.log(
      "salesCount",
      salesCount,
      "sum",
      sum,
      "cost",
      cost,
      "profit",
      profit,
    );
    return { sum, salesCount, profit };
  } catch (e) {
    console.log(e);
    return { sum: 0, salesCount: 0, profit: 0 };
  }
};

export const getMostSoldProducts = async (
  timeRange: TimeRange = "daily",
  productCount: number = 5,
) => {
  const result = await db
    .select({
      productId: SalesTable.productId,
      totalSold: sql<number>`SUM(${SalesTable.quantitySold})`,
      name: ProductsTable.name,
      imageUrl: ProductImagesTable.url,
    })
    .from(SalesTable)
    .leftJoin(ProductsTable, eq(SalesTable.productId, ProductsTable.id))
    .leftJoin(
      ProductImagesTable,
      eq(SalesTable.productId, ProductImagesTable.productId),
    )
    .where(
      and(
        gte(SalesTable.createdAt, await getDaysFromTimeRange(timeRange)),
        eq(ProductImagesTable.isPrimary, true),
      ),
    )
    .groupBy(SalesTable.productId)
    .orderBy(sql`SUM(${SalesTable.quantitySold}) DESC`)
    .limit(productCount);
  return result;
};

export const getOrderCountForWeek = async () => {
  try {
    const orderPromises = [];
    const salesPromises = [];
    for (let i = 0; i < 7; i++) {
      const { startDate, endDate } = getStartAndEndofDayAgo(i);
      const dayOrderPromise = db
        .select({
          orderCount: sql<number>`COUNT(*)`,
        })
        .from(OrdersTable)
        .where(between(OrdersTable.createdAt, startDate, endDate))
        .get();
      orderPromises.push(dayOrderPromise);
      const daySalesPromise = db
        .select({
          salesCount: sql<number>`COUNT(*)`,
        })
        .from(SalesTable)
        .where(between(SalesTable.createdAt, startDate, endDate))
        .get();
      salesPromises.push(daySalesPromise);
    }
    const orderResults = await Promise.all(orderPromises);
    const salesResults = await Promise.all(salesPromises);
    return orderResults.map((orderResult, i) => {
      const salesResult = salesResults[i]; // Corresponding sales result
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      return {
        orderCount: orderResult?.orderCount ?? 0,
        salesCount: salesResult?.salesCount ?? 0, // Access sales count here
        date: date.getMonth() + 1 + "/" + date.getDate(),
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getAverageOrderValue = async (timerange: TimeRange) => {
  const order = await db.query.OrdersTable.findMany({
    columns: {
      total: true,
      createdAt: true,
    },
    where: gte(OrdersTable.createdAt, await getDaysFromTimeRange(timerange)),
  });

  const total = order.reduce((acc, order) => {
    return acc + order.total;
  }, 0);

  return total / order.length;
};

export const getDashboardHomePageData = async (): Promise<
  DashboardHomePageData | DashboardHomePageErrorData
> => {
  const isProd = process.env.NODE_ENV === "production";
  const cacheKey = "dashboard-homepage-data";

  if (isProd) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("Using cached dashboard homepage data");
        return cached as DashboardHomePageData;
      }
    } catch (e) {
      console.error("Redis cache read error:", e);
      // Proceed to fetch fresh data if cache read fails
    }
  }

  console.log("Fetching fresh dashboard homepage data");
  try {
    const [
      salesDaily,
      salesWeekly,
      salesMonthly,
      mostSoldProductsDaily,
      mostSoldProductsWeekly,
      mostSoldProductsMonthly,
      dailyOrders,
      weeklyOrders,
      monthlyOrders,
      pendingOrders,
    ] = await Promise.all([
      getAnalyticsForHome("daily"),
      getAnalyticsForHome("weekly"),
      getAnalyticsForHome("monthly"),
      getMostSoldProducts("daily"),
      getMostSoldProducts("weekly"),
      getMostSoldProducts("monthly"),
      getOrderCount("daily"),
      getOrderCount("weekly"),
      getOrderCount("monthly"),
      getPendingOrders(),
    ]);

    const dashboardData: DashboardHomePageData = {
      salesData: {
        daily: salesDaily,
        weekly: salesWeekly,
        monthly: salesMonthly,
      },
      mostSoldProducts: {
        daily: mostSoldProductsDaily,
        weekly: mostSoldProductsWeekly,
        monthly: mostSoldProductsMonthly,
      },
      orderCounts: {
        daily: dailyOrders,
        weekly: weeklyOrders,
        monthly: monthlyOrders,
      },
      pendingOrders,
      lastFetched: new Date().toISOString(),
    };

    if (isProd) {
      try {
        // Cache for 15 minutes in production
        await redis.set(cacheKey, JSON.stringify(dashboardData), {
          ex: 60 * 60 * 24,
        });
        console.log("Stored fresh dashboard homepage data in cache");
      } catch (e) {
        console.error("Redis cache write error:", e);
      }
    }

    return dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard homepage data:", error);
    // Return a default structure on error to prevent breaking the page
    // Ensure this structure matches DashboardHomePageErrorData
    const errorData: DashboardHomePageErrorData = {
      salesData: {
        daily: { sum: 0, salesCount: 0, profit: 0 },
        weekly: { sum: 0, salesCount: 0, profit: 0 },
        monthly: { sum: 0, salesCount: 0, profit: 0 },
      },
      mostSoldProducts: { daily: [], weekly: [], monthly: [] },
      orderCounts: {
        daily: { count: 0 },
        weekly: { count: 0 },
        monthly: { count: 0 },
      },
      pendingOrders: [],
      lastFetched: new Date().toISOString(),
      error: "Failed to fetch data",
    };
    return errorData;
  }
};
