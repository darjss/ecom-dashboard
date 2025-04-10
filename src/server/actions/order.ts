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
import {
  and,
  eq,
  like,
  sql,
  desc,
  asc,
  or,
  gte,
  gt,
  lt,
  SQL,
} from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { updateStock } from "./product";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { OrderStatusType, PaymentStatusType, TimeRange } from "@/lib/types";
import {
  calculateExpiration,
  getDaysFromTimeRange,
  shapeOrderResult,
  shapeOrderResults,
} from "./utils";
import { addSale } from "./sales";
import { getAverageCostOfProduct } from "./purchases";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { redirect } from "next/navigation";
import { redis } from "../db/redis";

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
          deliveryProvider: orderInfo.deliveryProvider,
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
    redirect("/orders");
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

export const seedOrder = async (orderInfo: addOrderType, createdAt?: Date) => {
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
          deliveryProvider: orderInfo.deliveryProvider,
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

// Define cursor type for Orders
type OrderCursor = {
  id: number; // Use order ID as the primary cursor component
  [key: string]: number | string | Date | undefined; // For sort field value (total, createdAt)
} | null;

export const getPaginatedOrders = async (
  pageSize = PRODUCT_PER_PAGE,
  paymentStatus?: PaymentStatusType,
  orderStatus?: OrderStatusType,
  sortField?: string,
  sortDirection: "asc" | "desc" = "asc",
  cursor: OrderCursor = null, // Added cursor
) => {
  console.log(
    "Fetching paginated orders with cursor:", // Updated log
    cursor,
    "pageSize:",
    pageSize,
    "paymentStatus:",
    paymentStatus,
    "orderStatus:",
    orderStatus,
    "sortField:",
    sortField,
    "sortDirection:",
    sortDirection,
  );

  try {
    const conditions: (SQL<unknown> | undefined)[] = []; // Allow undefined elements

    // --- Existing Filters --- Filter only on OrdersTable here
    if (orderStatus !== undefined) {
      conditions.push(eq(OrdersTable.status, orderStatus));
    }
    // --- End Existing Filters ---

    // --- Cursor Logic --- Based on OrdersTable columns
    if (cursor) {
      const { id: cursorId, ...sortValues } = cursor;
      let cursorSortValue: number | string | Date | undefined;
      // Use the specific column object type
      let sortColumnObject:
        | typeof OrdersTable.total
        | typeof OrdersTable.createdAt;

      if (sortField === "total") {
        sortColumnObject = OrdersTable.total;
        cursorSortValue = cursor.total; // Expect number
      } else {
        // Default to createdAt
        sortColumnObject = OrdersTable.createdAt;
        cursorSortValue = cursor.createdAt; // Expect Date object typically
        // Add type check/conversion if cursor stores date differently (e.g., ISO string)
        if (cursorSortValue && typeof cursorSortValue === "string") {
          try {
            cursorSortValue = new Date(cursorSortValue);
          } catch {
            /* Ignore parsing errors? */
          }
        }
      }

      // Ensure cursorId is defined before proceeding with cursor logic
      if (cursorId !== undefined) {
        if (
          cursorSortValue !== undefined &&
          cursorSortValue instanceof Date &&
          isNaN(cursorSortValue.getTime())
        ) {
          // Handle invalid date potentially parsed from string
          console.warn(
            "Invalid date encountered in order cursor:",
            cursor.createdAt,
          );
          // Optionally fall back to ID-only pagination or throw error
          conditions.push(gt(OrdersTable.id, cursorId));
        } else if (cursorSortValue !== undefined) {
          // We have a valid sort value and ID
          const operator = sortDirection === "asc" ? gt : lt;

          // Cast value type explicitly if needed, though Drizzle should infer
          const cursorCondition = operator(
            sortColumnObject,
            cursorSortValue as number | Date,
          );

          const tieBreakingCondition = and(
            eq(sortColumnObject, cursorSortValue as number | Date),
            gt(OrdersTable.id, cursorId),
          );

          conditions.push(or(cursorCondition, tieBreakingCondition));
        } else {
          // Fallback: ID-based cursor if sort value is missing or invalid
          conditions.push(gt(OrdersTable.id, cursorId));
        }
      }
    }
    // --- End Cursor Logic ---

    // --- Define Order By --- Based on OrdersTable columns
    let orderByClauses: SQL<unknown>[] = [];
    const primarySortColumn =
      sortField === "total" ? OrdersTable.total : OrdersTable.createdAt;

    const primaryOrderBy =
      sortDirection === "asc"
        ? asc(primarySortColumn)
        : desc(primarySortColumn);

    orderByClauses.push(primaryOrderBy);
    orderByClauses.push(asc(OrdersTable.id)); // Ascending ID for tie-breaker stability
    // --- End Define Order By ---

    // Filter out undefined conditions before passing to `and`
    const finalConditions = conditions.filter(
      (c): c is SQL<unknown> => c !== undefined,
    );

    // === Query using db.query ===
    const orderResults = await db.query.OrdersTable.findMany({
      limit: pageSize + 1,
      orderBy: orderByClauses,
      // Pass the combined condition or undefined if it's empty
      where: finalConditions.length > 0 ? and(...finalConditions) : undefined,
      with: {
        orderDetails: {
          columns: { quantity: true },
          with: {
            product: {
              columns: { name: true, id: true, price: true },
              with: {
                images: {
                  columns: { url: true },
                  where: eq(ProductImagesTable.isPrimary, true),
                },
              },
            },
          },
        },
        payments: {
          columns: { provider: true, status: true, createdAt: true },
          where:
            paymentStatus === undefined
              ? undefined
              : eq(PaymentsTable.status, paymentStatus),
        },
      },
    });

    // Filter orders based on payment status *after* fetching, if specified
    let filteredOrders = orderResults;
    if (paymentStatus !== undefined) {
      filteredOrders = orderResults.filter((order) =>
        order.payments.some((p) => p.status === paymentStatus),
      );
    }

    // --- Determine next cursor (from unfiltered list) ---
    let finalNextCursor: OrderCursor = null;
    if (orderResults.length > pageSize) {
      const nextOrder = orderResults[pageSize]; // The potential next item before filtering
      if (nextOrder) {
        finalNextCursor = { id: nextOrder.id };
        if (sortField === "total") finalNextCursor.total = nextOrder.total;
        if (!sortField || sortField === "createdAt") {
          finalNextCursor.createdAt = nextOrder.createdAt;
        }
      }
    }
    // --- End determine next cursor ---

    // Limit the final list to pageSize *after* potential filtering
    const ordersForPage = filteredOrders.slice(0, pageSize);

    const shapedOrders = shapeOrderResults(ordersForPage);

    return {
      orders: shapedOrders,
      nextCursor: finalNextCursor,
    };
  } catch (e) {
    console.log("Error fetching paginated orders:", e);
    if (e instanceof Error) {
      return {
        orders: [],
        nextCursor: null, // Added
        message: "Fetching orders failed",
        error: e.message,
      };
    }
    return {
      orders: [],
      nextCursor: null, // Added
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

  try {
    const result = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(OrdersTable)
      .where(gte(OrdersTable.createdAt, await getDaysFromTimeRange(timeRange)))
      .get();

    const count = result?.count ?? 0;

    return { count };
  } catch (e) {
    console.log(e);
    return { count: 0 };
  }
};

export const getCachedOrderCount = async (timerange: TimeRange = "daily") => {
  try {
    const key = `orderCount:${timerange}`;
    const cached = (await redis.get(key)) as string;
    if (cached) {
      return JSON.parse(cached) as Awaited<ReturnType<typeof getOrderCount>>;
    }
    console.log("Cached order count", cached);
    const orderCount = await getOrderCount(timerange);
    await redis.set(key, JSON.stringify(orderCount), {
      ex: calculateExpiration(timerange),
    });
    return orderCount;
  } catch (e) {
    console.log(e);
    return await getOrderCount(timerange);
  }
};

export const getPendingOrders = async () => {
  try {
    const result = await db.query.OrdersTable.findMany({
      where: eq(OrdersTable.status, "pending"),
      orderBy: desc(OrdersTable.createdAt),
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
    return shapeOrderResults(result);
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const updateOrderStatus = async (
  id: number,
  status: OrderStatusType,
) => {
  try {
    await db
      .update(OrdersTable)
      .set({ status: status })
      .where(eq(OrdersTable.id, id));
    revalidateTag("orders");
    return { message: "Order status updated successfully" + status };
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      console.error(e);
      return { message: "Updating order status failed", error: e.message };
    }
    console.error(e);
    return { message: "Updating order status failed", error: "Unknown error" };
  }
};
