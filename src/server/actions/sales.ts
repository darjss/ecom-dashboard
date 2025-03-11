"use server";
import "server-only";
import { db } from "../db";
import { SalesTable } from "../db/schema";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { AddSalesType, TransactionType } from "@/lib/types";
import { between, gte, sql } from "drizzle-orm";

export const addSale = async (sale: AddSalesType, tx?: TransactionType) => {
  try {
    const result = await (tx || db).insert(SalesTable).values(sale);
  } catch (e) {
    console.log(e);
  }
};
const getStartOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getAnalyticsDaily = async () => {
  "use cache";
  cacheTag("products");
  cacheLife({
    expire: 24 * 60 * 60, // 24 hours
    stale: 60 * 5, // 5 minutes
    revalidate: 60 * 15, // 15 minutes
  });

  try {
    const startOfDay = getStartOfDay();
    const result = await db
      .select({
        sum: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
        cost: sql<number>`SUM(${SalesTable.productCost} * ${SalesTable.quantitySold})`,
        salesCount: sql<number>`COUNT(*)`,
      })
      .from(SalesTable)
      .where(gte(SalesTable.createdAt, startOfDay))
      .get();

    const sum = result?.sum ?? 0;
    const cost = result?.cost ?? 0;
    const profit = sum - cost;
    const salesCount = result?.salesCount ?? 0;

    return { sum, salesCount, profit };
  } catch (e) {
    console.log(e);
    return { sum: 0, salesCount: 0, profit: 0 }; // Return defaults on error
  }
};

export const getAnalyticsWeekly = async () => {
  "use cache";
  cacheTag("products");
  cacheLife({
    expire: 24 * 60 * 60, // 24 hours
    stale: 60 * 5, // 5 minutes
    revalidate: 60 * 60 * 6, // 6 hours
  });

  try {
    const startOfWeek = getDaysAgo(7);
    const result = await db
      .select({
        sum: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
        cost: sql<number>`SUM(${SalesTable.productCost} * ${SalesTable.quantitySold})`,
        salesCount: sql<number>`COUNT(*)`,
      })
      .from(SalesTable)
      .where(gte(SalesTable.createdAt, startOfWeek))
      .get();

    const sum = result?.sum ?? 0;
    const cost = result?.cost ?? 0;
    const profit = sum - cost;
    const salesCount = result?.salesCount ?? 0;

    return { sum, salesCount, profit };
  } catch (e) {
    console.log(e);
    return { sum: 0, salesCount: 0, profit: 0 };
  }
};

export const getAnalyticsMonthly = async () => {
  "use cache";
  cacheTag("products");
  cacheLife({
    expire: 24 * 60 * 60, // 24 hours
    stale: 60 * 5, // 5 minutes
    revalidate: 60 * 60 * 6, // 6 hours
  });

  try {
    const startOfMonth = getDaysAgo(30); // Could use 28/31 depending on exact month logic
    const result = await db
      .select({
        sum: sql<number>`SUM(${SalesTable.sellingPrice} * ${SalesTable.quantitySold})`,
        cost: sql<number>`SUM(${SalesTable.productCost} * ${SalesTable.quantitySold})`,
        salesCount: sql<number>`COUNT(*)`,
      })
      .from(SalesTable)
      .where(gte(SalesTable.createdAt, startOfMonth))
      .get();

    const sum = result?.sum ?? 0;
    const cost = result?.cost ?? 0;
    const profit = sum - cost;
    const salesCount = result?.salesCount ?? 0;

    return { sum, salesCount, profit };
  } catch (e) {
    console.log(e);
    return { sum: 0, salesCount: 0, profit: 0 };
  }
};