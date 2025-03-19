"use server";
import "server-only";
import {
  PaymentProviderType,
  PaymentStatusType,
  TransactionType,
} from "@/lib/types";
import { db } from "../db";
import { PaymentsTable } from "../db/schema";
import { eq } from "drizzle-orm";

export const createPayment = async (
  orderId: number,
  status: PaymentStatusType = "pending",
  provider: PaymentProviderType = "transfer",
  tx?: TransactionType,
) => {
  const result = await (tx || db)
    .insert(PaymentsTable)
    .values({
      orderId: orderId,
      provider: provider,
      status: status,
    })
    .returning({ id: PaymentsTable.id });
  return result;
};
export const getPayments = async () => {
  const result = await db.select().from(PaymentsTable);
};

export const getPendingPayments = async () => {
  const result = await db
    .select()
    .from(PaymentsTable)
    .where(eq(PaymentsTable.status, "pending"));
  return result;
};
