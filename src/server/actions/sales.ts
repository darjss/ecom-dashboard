"use server";
import "server-only";
import { db } from "../db";
import { ProductImagesTable, ProductsTable, SalesTable } from "../db/schema";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { AddSalesType, TimeRange, TransactionType } from "@/lib/types";
import { and, eq, gte, sql } from "drizzle-orm";
import { getDaysAgo, getStartOfDay } from "./utils";

export const addSale = async (sale: AddSalesType, tx?: TransactionType) => {
  try {
    const result = await (tx || db).insert(SalesTable).values(sale);
  } catch (e) {
    console.log(e);
  }
};

export const getAnalytics = async (timeRange: TimeRange = "daily") => {
  "use cache";

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
    let startDate;
    switch (timeRange) {
      case "daily":
        startDate = getStartOfDay();
        break;
      case "weekly":
        startDate = getDaysAgo(7);
        break;
      case "monthly":
        startDate = getDaysAgo(30);
        break;
      default:
        startDate = getStartOfDay();
    }

    const result = await db
      .select({
        sum: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
        cost: sql<number>`SUM(${SalesTable.productCost} * ${SalesTable.quantitySold})`,
        salesCount: sql<number>`COUNT(*)`,
      })
      .from(SalesTable)
      .where(gte(SalesTable.createdAt, startDate))
      .get();

    const sum = result?.sum ?? 0;
    const cost = result?.cost ?? 0;
    const profit = sum - cost;
    const salesCount = result?.salesCount ?? 0;
      console.log("salesCount",salesCount, "sum",sum,"cost",cost,"profit",profit);
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
  let startDate;
  switch (timeRange) {
    case "daily":
      startDate = getStartOfDay();
      break;
    case "weekly":
      startDate = getDaysAgo(7);
      break;
    case "monthly":
      startDate = getDaysAgo(30);
      break;
    default:
      startDate = getStartOfDay();
  }
  const result = await db
    .select({
      productId: SalesTable.productId,
      totalSold: sql<number>`${SalesTable.quantitySold}`,
      name: ProductsTable.name,
      imageUrl: ProductImagesTable.url,
    })
    .from(SalesTable)
    .leftJoin(ProductsTable, eq(SalesTable.productId, ProductsTable.id))
    .leftJoin(
      ProductImagesTable,
      eq(SalesTable.productId, ProductImagesTable.id),
    )
    .limit(productCount)
    .orderBy(sql`SUM(${SalesTable.quantitySold}) DESC`)
    .groupBy(SalesTable.productId)
    .where(
      and(
        gte(SalesTable.createdAt, startDate),
        eq(ProductImagesTable.isPrimary, true),
      ),
    );
  return result;
};
