"use server";
import "server-only";
import { db, redis } from "../db";
import {
  OrdersTable,
  ProductImagesTable,
  ProductsTable,
  SalesTable,
} from "../db/schema";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { AddSalesType, TimeRange, TransactionType } from "@/lib/types";
import { and, between, eq, gte, sql } from "drizzle-orm";
import {
  calculateExpiration,
  getDaysAgo,
  getDaysFromTimeRange,
  getStartAndEndofDayAgo,
  getStartOfDay,
} from "./utils";

export const addSale = async (sale: AddSalesType, tx?: TransactionType) => {
  try {
    const result = await (tx || db).insert(SalesTable).values(sale);
  } catch (e) {
    console.log(e);
  }
};

export const getAnalytics = async (timeRange: TimeRange = "daily") => {
  "use cache";
  cacheLife("hours");

  cacheTag(`analytics-${timeRange}`);

  cacheTag("analytics-all");

  if (timeRange === "daily") {
    cacheLife({
      expire: 24 * 60 * 60, // 24 hours
      stale: 60 * 5, // 5 minutes
      revalidate: 60 * 15, // 15 minutes
    });
  } else {
    cacheLife({
      expire: 24 * 60 * 60, // 24 hours
      stale: 60 * 5, // 5 minutes
      revalidate: 60 * 60 * 6, // 6 hours
    });
  }

  try {
  
    const result = await db
      .select({
        sum: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
        cost: sql<number>`SUM(${SalesTable.productCost} * ${SalesTable.quantitySold})`,
        salesCount: sql<number>`COUNT(*)`,
      })
      .from(SalesTable)
      .where(gte(SalesTable.createdAt, getDaysFromTimeRange(timeRange)))
      .get();

    const sum = result?.sum ?? 0;
    const cost = result?.cost ?? 0;
    const profit = sum - cost;
    const salesCount = result?.salesCount ?? 0;
    const mostSoldProducts=await db
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
          gte(SalesTable.createdAt, getDaysFromTimeRange(timeRange)),
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
  "use cache";
  cacheTag("products");
  cacheLife({
    expire: 24 * 60 * 60, // 24 hours
    stale: 60 * 5, // 5 minutes
    revalidate: 60 * 15, // 15 minutes
  });

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
        gte(SalesTable.createdAt, getDaysFromTimeRange(timeRange)),
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

  const order= await db.query.OrdersTable.findMany({
    columns:{
      total: true,
      createdAt: true,
    },
    where: gte(OrdersTable.createdAt, getDaysFromTimeRange(timerange)),
    }
  );

  const total = order.reduce((acc, order) => {
    return acc + order.total;
  }, 0);

  return total / order.length;
}

export const getCachedAnalytics = async (timerange: TimeRange) => {
  try {
    const key = `analytics:${timerange}`;
    const cached = (await redis.get(key)) as string;
    if (cached) {
      return JSON.parse(cached) as Awaited<ReturnType<typeof getAnalytics>>;
    }
    console.log("Cached analytics", cached);
    const analytics = await getAnalytics(timerange);
    await redis.set(key, JSON.stringify(analytics), {
      ex: calculateExpiration(timerange),
    });
    return analytics;
  } catch (e) {
    console.log(e);
    return await getAnalytics(timerange);
  }
};

export const getCachedOrderCountForWeek = async () => {
  try {
    const key = `orderCountForWeek`;
    const cached = (await redis.get(key)) as string;
    console.log("Cached order count for week", cached);
    if (cached) {
      return JSON.parse(cached) as Awaited<
        ReturnType<typeof getOrderCountForWeek>
      >;
    }
    const orderCount = await getOrderCountForWeek();
    await redis.set(key, JSON.stringify(orderCount), {
      ex: calculateExpiration("weekly"),
    });
    return orderCount;
  } catch (e) {
    console.log(e);
    return await getOrderCountForWeek();
  }
};

export const getCachedMostSoldProducts = async (
  timerange: TimeRange = "daily",
  productCount: number = 5,
) => {
  try {
    const key = `mostSoldProducts:${timerange}:${productCount}`;
    const cached = (await redis.get(key)) as string;
    console.log("Cached most sold products", cached);
    if (cached) {
      return JSON.parse(cached) as Awaited<
        ReturnType<typeof getMostSoldProducts>
      >;
    }
    const mostSoldProducts = await getMostSoldProducts(timerange, productCount);
    await redis.set(key, JSON.stringify(mostSoldProducts), {
      ex: calculateExpiration(timerange),
    });
    return mostSoldProducts;
  } catch (e) {
    console.log(e);
    return await getMostSoldProducts();
  }
};
