"use server";
import "server-only";

import { addOrderType } from "@/lib/zod/schema";
import { db } from "../db";
import {
  CustomersTable,
  OrderDetailsTable,
  OrdersTable,
  PaymentsTable,
  ProductImagesTable,
} from "../db/schema";
import { generateOrderNumber } from "@/lib/utils";
import { createPayment } from "./payment";
import { and, eq, like, sql, desc, asc, or, gte } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { updateStock } from "./product";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { OrderStatusType, PaymentStatusType, TimeRange } from "@/lib/types";
import {
  getDaysAgo,
  getStartOfDay,
  shapeOrderResult,
  shapeOrderResults,
} from "./utils";
import { addSale } from "./sales";
import { getAverageCostOfProduct } from "./purchases";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { create } from "lodash";

export const addOrder = async (orderInfo: addOrderType, createdAt?: Date) => {
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
          address: orderInfo.address,
          createdAt: createdAt,
        })
        .returning({ orderId: OrdersTable.id });
      if (order?.orderId === undefined) {
        return;
      }
      const orderId = order?.orderId;

      for (const product of orderInfo.products) {
        await tx.insert(OrderDetailsTable).values({
          orderId: orderId,
          productId: product.productId,
          quantity: product.quantity,
        });

        if (orderInfo.paymentStatus === "success") {
          const productCost = await getAverageCostOfProduct(
            product.productId,
            new Date(),
          );
          await addSale(
            {
              productCost: productCost,
              quantitySold: product.quantity,
              orderId: order.orderId,
              sellingPrice: product.price,
              productId: product.productId,
              createdAt: createdAt,
            },
            tx,
          );
          await updateStock(product.productId, product.quantity, "minus", tx);
        }
      }

      try {
        const paymentResult = await createPayment(
          orderId,
          orderInfo.paymentStatus,
          "transfer",
          tx,
        );
        console.log("Payment created:", paymentResult);
      } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
      }
      console.log("transaction done");
    });

    revalidateTag("orders");
    console.log("added order");
    return { message: "Order added successfully" };
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Adding order failed", error: e.message };
    }
    console.log("error", e);
    return { message: "Adding order failed", error: "Unknown error" };
  }
};

export const updateOrder = async (orderInfo: addOrderType) => {
  try {
    console.log("updating order");
    if (orderInfo.id === undefined) {
      return { message: "Operation Failed", error: "Order id not found" };
    }

    const orderTotal = orderInfo.products.reduce(
      (acc, currentProduct) =>
        acc + currentProduct.price * currentProduct.quantity,
      0,
    );

    await db.transaction(async (tx) => {
      if (orderInfo.isNewCustomer) {
        const userExists = await tx
          .select()
          .from(CustomersTable)
          .where(eq(CustomersTable.phone, orderInfo.customerPhone))
          .execute();

        if (userExists.length === 0) {
          await tx.insert(CustomersTable).values({
            phone: orderInfo.customerPhone,
            address: orderInfo.address,
          });
        } else {
          await tx
            .update(CustomersTable)
            .set({ address: orderInfo.address })
            .where(eq(CustomersTable.phone, orderInfo.customerPhone));
        }
      }
      if (orderInfo.id == undefined) {
        return;
      }
      await tx
        .update(OrdersTable)
        .set({
          customerPhone: orderInfo.customerPhone,
          status: orderInfo.status,
          notes: orderInfo.notes,
          total: orderTotal,
        })
        .where(eq(OrdersTable.id, orderInfo.id));

      const currentOrderDetails = await tx
        .select()
        .from(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, orderInfo.id))
        .execute();

      await tx
        .delete(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, orderInfo.id));

      const orderDetailsPromise = orderInfo.products.map(async (product) => {
        await tx.insert(OrderDetailsTable).values({
          orderId: orderInfo.id!,
          productId: product.productId,
          quantity: product.quantity,
        });

        const existingDetail = currentOrderDetails.find(
          (detail) => detail.productId === product.productId,
        );
        if (orderInfo.paymentStatus === "success") {
          const productCost = await getAverageCostOfProduct(
            product.productId,
            new Date(),
          );
          await addSale(
            {
              productCost: productCost,
              quantitySold: product.quantity,
              orderId: orderInfo.id!,
              sellingPrice: product.price,
              productId: product.productId,
            },
            tx,
          );
        }
        if (existingDetail) {
          const quantityDiff = product.quantity - existingDetail.quantity;
          if (quantityDiff !== 0) {
            await updateStock(
              product.productId,
              Math.abs(quantityDiff),
              quantityDiff > 0 ? "minus" : "add",
              tx,
            );
          }
        } else {
          await updateStock(product.productId, product.quantity, "minus", tx);
        }
      });

      const removedProducts = currentOrderDetails.filter(
        (detail) =>
          !orderInfo.products.some((p) => p.productId === detail.productId),
      );

      const restoreStockPromises = removedProducts.map((detail) =>
        updateStock(detail.productId, detail.quantity, "add", tx),
      );

      const paymentUpdatePromise = tx
        .update(PaymentsTable)
        .set({ status: orderInfo.paymentStatus })
        .where(eq(PaymentsTable.orderId, orderInfo.id!));

      await Promise.allSettled([
        ...orderDetailsPromise,
        ...restoreStockPromises,
        paymentUpdatePromise,
      ]);
    });

    revalidateTag("orders");
    return { message: "Order updated successfully" };
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      return { message: "Updating order failed", error: e.message };
    }
    return { message: "Updating order failed", error: "Unknown error" };
  }
};

export const deleteOrder = async (id: number) => {
  try {
    await db.transaction(async (tx) => {
      const orderDetails = await tx
        .select()
        .from(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, id))
        .execute();

      const restoreStockPromises = orderDetails.map((detail) =>
        updateStock(detail.productId, detail.quantity, "add", tx),
      );

      await tx
        .delete(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, id));

      await tx.delete(OrdersTable).where(eq(OrdersTable.id, id));

      await Promise.allSettled(restoreStockPromises);
    });

    revalidateTag("orders");
    return { message: "Order deleted successfully" };
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      return { message: "Deleting order failed", error: e.message };
    }
    return { message: "Deleting order failed", error: "Unknown error" };
  }
};

export const searchOrder = async (searchTerm: string) => {
  try {
    const orders = await db.query.OrdersTable.findMany({
      where: or(
        like(OrdersTable.orderNumber, `%${searchTerm}%`),
        like(OrdersTable.address, `%${searchTerm}%`),
        like(OrdersTable.customerPhone, `%${searchTerm}%`),
      ),
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
                price: true,
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
        payments: {
          columns: {
            provider: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return shapeOrderResults(orders);
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getAllOrders = async () => {
  "use cache";
  cacheTag("orders");

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
      return { message: "Fetching orders failed", error: e.message };
    }
    console.log("error", e);
    return { message: "Fetching orders failed", error: "Unknown error" };
  }
};

export const getOrderById = async (id: number) => {
  try {
    const result = await db.query.OrdersTable.findFirst({
      where: eq(OrdersTable.id, id),
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
                price: true,
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
        payments: {
          columns: {
            provider: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
    return shapeOrderResult(result);
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Fetching order failed", error: e.message };
    }
    console.log("error", e);
    return { message: "Fetching order failed", error: "Unknown error" };
  }
};

export const getPaginatedOrders = async (
  page: number = 1,
  pageSize = PRODUCT_PER_PAGE,
  paymentStatus?: PaymentStatusType,
  orderStatus?: OrderStatusType,
  sortField?: string,
  sortDirection: "asc" | "desc" = "asc",
) => {
  console.log(
    "Fetching paginated orders with page:",
    page,
    "pageSize:",
    pageSize,
  );

  try {
    let orderBy;
    if (sortField === "total") {
      orderBy =
        sortDirection === "asc"
          ? asc(OrdersTable.total)
          : desc(OrdersTable.total);
    } else if (sortField === "createdAt") {
      orderBy =
        sortDirection === "asc"
          ? asc(OrdersTable.createdAt)
          : desc(OrdersTable.createdAt);
    } else {
      orderBy = desc(OrdersTable.createdAt);
    }

    const result = await db.query.OrdersTable.findMany({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: orderBy,
      where:
        orderStatus === undefined
          ? undefined
          : eq(OrdersTable.status, orderStatus),
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
                price: true,
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
        payments: {
          columns: {
            provider: true,
            status: true,
            createdAt: true,
          },
          where:
            paymentStatus === undefined
              ? undefined
              : eq(PaymentsTable.status, paymentStatus),
        },
      },
    });
    const total = await db
      .select({ count: sql<number>`count (*)` })
      .from(OrdersTable)
      .leftJoin(PaymentsTable, eq(OrdersTable.id, PaymentsTable.orderId))
      .where(
        and(
          orderStatus === undefined
            ? undefined
            : eq(OrdersTable.status, orderStatus),
          paymentStatus === undefined
            ? undefined
            : eq(PaymentsTable.status, paymentStatus),
        ),
      );
    const orders = shapeOrderResults(result);
    console.log("orders", orders);
    return {
      orders: orders,
      total: total[0]?.count,
    };
  } catch (e) {
    console.log("Error fetching paginated orders:", e);
    if (e instanceof Error) {
      return {
        orders: [],
        total: 0,
        message: "Fetching orders failed",
        error: e.message,
      };
    }
    return {
      orders: [],
      total: 0,
      message: "Fetching orders failed",
      error: "Unknown error",
    };
  }
};

export const getOrderCount = async (timeRange: TimeRange) => {
  "use cache";
  cacheTag("orders");
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
  try {
    const result = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(OrdersTable)
      .where(gte(OrdersTable.createdAt, startDate))
      .get();

    const count = result?.count ?? 0;

    return { count };
  } catch (e) {
    console.log(e);
    return { count: 0 };
  }
};
