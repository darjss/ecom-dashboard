"use server";
import "server-only";

import { addOrderType } from "@/lib/zod/schema";
import { db } from "../db";
import {
  CustomersTable,
  OrderDetailsTable,
  OrdersTable,
  ProductImagesTable,
} from "../db/schema";
import { generateOrderNumber } from "@/lib/utils";
import { createPayment } from "./payment";
import { eq } from "drizzle-orm";

export const addOrder = async (orderInfo: addOrderType) => {
  console.log("addOrder called with", orderInfo);
  try {
    const orderTotal = orderInfo.products.reduce(
      (acc, currentProduct) =>
        acc + currentProduct.price * currentProduct.quantity,
      0,
    );

    await db.transaction(async (tx) => {
      if (orderInfo.isNewCustomer) {
        const userResult = await tx.insert(CustomersTable).values({
          phone: orderInfo.customerPhone,
          address: orderInfo.address,
        });
      }

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
      await Promise.allSettled([...orderDetailsPromise, paymentPromise]);
      console.log("transaction done")
    });
    console.log("added order")
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Adding order failed", error: e.message };
    }
    console.log("error", e);
  }
};

export const getAllorder = async () => {
  try {
    const result = await db.query.OrdersTable.findMany({
      with: {
        orderDetails: {
          columns: {
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
                id: true,
              },
              with: {
                images: {
                  columns: {
                    url: true,
                  },
                  where: eq(ProductImagesTable.isPrimary, true),
                },
              },
            },
          },
        },
      },
    });
    const orders = result.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerPhone: order.customerPhone,
      status: order.status,
      total: order.total,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      products: order.orderDetails.map((orderDetail) => ({
        quantity: orderDetail.quantity,
        name: orderDetail.product.name,
        id: orderDetail.product.id,
        imageUrl: orderDetail.product.images[0]?.url,
      })),
    }));
    return orders;
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Adding order failed", error: e.message };
    }
    console.log("error", e);
  }
};


export const getOrderById = async (id:number) => {
  try {
    const result = await db.query.OrdersTable.findFirst({
      where:eq(OrdersTable.id, id),
      with: {
        orderDetails: {
          columns: {
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
                id: true,
              },
              with: {
                images: {
                  columns: {
                    url: true,
                  },
                  where: eq(ProductImagesTable.isPrimary, true),
                },
              },
            },
          },
        },
      },
    });
    if(result===undefined){
            return { message: "Adding order failed", error: "No order found" };
    }
    const order ={
      id: result.id,
      orderNumber: result.orderNumber,
      customerPhone: result.customerPhone,
      status: result.status,
      total: result.total,
      notes: result.notes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      products: result.orderDetails.map((orderDetail) => ({
        quantity: orderDetail.quantity,
        name: orderDetail.product.name,
        id: orderDetail.product.id,
        imageUrl: orderDetail.product.images[0]?.url,
      })),
    };
    return order;
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Adding order failed", error: e.message };
    }
    console.log("error", e);
  }
};

