"use server";
import "server-only";

import { addOrderType } from "@/lib/zod/schema";
import { db } from "../db";
import { OrderDetailsTable, OrdersTable } from "../db/schema";
import { generateOrderNumber } from "@/lib/utils";
import { createPayment } from "./payment";

export const addOrder = async (orderInfo: addOrderType) => {
  try {
    const orderTotal = orderInfo.products.reduce(
      (acc, currentProduct) => acc + currentProduct.price,
      0,
    );

    await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(OrdersTable)
        .values({
          orderNumber: generateOrderNumber(),
          customerPhone: orderInfo.customerPhone,
          status: orderInfo.status,
          notes: orderInfo.notes,
          total: orderTotal,
        })
        .returning({ orderId: OrdersTable.id });
      if (order?.orderId === undefined) {
        return;
      }
      const orderId = order?.orderId;
      const orderDetailsPromise = orderInfo.products.map(async (product) =>
        tx.insert(OrderDetailsTable).values({
          orderId: orderId,
          productId: product.productId,
          quantity: product.quantity,
        }),
      );
      const paymentPromise = createPayment(orderId, orderInfo.paymentStatus);
      await Promise.allSettled([...orderDetailsPromise, paymentPromise])
    });
  } catch (e) {
    console.log("error", e);
  }
};
