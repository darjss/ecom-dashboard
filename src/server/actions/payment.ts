"use server";
import "server-only";
import { PaymentProviderType, PaymentStatusType, TransactionType } from "@/lib/types";
import { db } from "../db";
import { PaymentsTable } from "../db/schema";


export const createPayment = async (
  orderId: number,
  status: PaymentStatusType = "pending",
  provider: PaymentProviderType = "transfer",
  tx?:TransactionType 
) => {
  const result = (tx || db)
    .insert(PaymentsTable)
    .values({
      orderId: orderId,
      provider: provider,
      status: status,
    })
    .returning({ id: PaymentsTable.id });
  return result;
};
