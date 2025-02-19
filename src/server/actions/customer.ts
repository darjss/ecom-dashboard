"use server";
import "server-only";
import { db } from "../db";
import { CustomerInsertType, CustomersTable } from "../db/schema";
import { eq, getTableColumns } from "drizzle-orm";

export const addUser = async (userInfo: CustomerInsertType) => {
  const result = db
    .insert(CustomersTable)
    .values(userInfo)
    .returning({ phone: CustomersTable.phone });
  return result;
};

export const getCustomerByPhone = async (phone: number) => {
  const result = await db
    .select(getTableColumns(CustomersTable))
    .from(CustomersTable)
    .where(eq(CustomersTable.phone, phone))
    .limit(1);
    return result
};
