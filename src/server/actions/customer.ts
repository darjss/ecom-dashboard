"use server";
import "server-only";
import { db } from "../db";
import { CustomerInsertType, CustomersTable } from "../db/schema";
import { eq, getTableColumns, gte, sql } from "drizzle-orm";
import { TimeRange } from "@/lib/types";
import { getDaysAgo, getStartOfDay } from "./utils";

export const addUser = async (userInfo: CustomerInsertType) => {
  const result = db
    .insert(CustomersTable)
    .values(userInfo)
    .returning({ phone: CustomersTable.phone });
  return result;
};

export const getCustomerByPhone = async (phone: number) => {
  console.log("GETTING CUSTOMER BY PHONE");
  const result = await db
    .select(getTableColumns(CustomersTable))
    .from(CustomersTable)
    .where(eq(CustomersTable.phone, phone))
    .limit(1);
  console.log("RESULT", result);
  return result;
};
export const getCustomerCount = async () => {
  const result = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(CustomersTable);
  return result;
};
export const getNewCustomersCount = async (timeRange: TimeRange) => {
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
      count: sql<number>`COUNT(*)`,
    })
    .from(CustomersTable)
    .where(gte(CustomersTable.createdAt, startDate))
    .get();
  return result?.count ?? 0;
};
