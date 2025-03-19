"use server";
import "server-only";
import { db } from "../db";
import { CustomerInsertType, CustomersTable } from "../db/schema";
import { eq, getTableColumns, sql } from "drizzle-orm";

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
export const getNewCustomersCount = async () => {
  const result = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(CustomersTable)
    .where(eq(CustomersTable.isNewCustomer, true));
  return result;
};