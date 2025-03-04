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
import { 
  and, 
  asc, 
  desc, 
  eq, 
  getTableColumns,
  like, 
  SQL,
  sql 
} from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { SortingState } from "@tanstack/react-table";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { TransactionType } from "@/lib/types";
import { updateStock } from "./product";
import { PRODUCT_PER_PAGE } from "@/lib/constants";

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
      
      const orderDetailsPromise = orderInfo.products.map(async (product) => {
        await tx.insert(OrderDetailsTable).values({
          orderId: orderId,
          productId: product.productId,
          quantity: product.quantity,
        });
        
        // Update stock
        await updateStock(product.productId, product.quantity, "minus", tx);
      });
      
      const paymentPromise = createPayment(orderId, orderInfo.paymentStatus);
      await Promise.allSettled([...orderDetailsPromise, paymentPromise]);
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

// Update Order
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
      // Update customer info if needed
      if (orderInfo.isNewCustomer) {
        const userExists = await tx.select()
          .from(CustomersTable)
          .where(eq(CustomersTable.phone, orderInfo.customerPhone))
          .execute();
          
        if (userExists.length === 0) {
          await tx.insert(CustomersTable).values({
            phone: orderInfo.customerPhone,
            address: orderInfo.address,
          });
        } else {
          await tx.update(CustomersTable)
            .set({ address: orderInfo.address })
            .where(eq(CustomersTable.phone, orderInfo.customerPhone));
        }
      }
      
      // Update order main info
      await tx.update(OrdersTable)
        .set({
          customerPhone: orderInfo.customerPhone,
          status: orderInfo.status,
          notes: orderInfo.notes,
          total: orderTotal,
        })
        .where(eq(OrdersTable.id, orderInfo.id));
      
      // Get current order details to handle stock adjustments
      const currentOrderDetails = await tx.select()
        .from(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, orderInfo.id))
        .execute();
      
      // Delete existing order details
      await tx.delete(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, orderInfo.id));
      
      // Add new order details and update stock
      const orderDetailsPromise = orderInfo.products.map(async (product) => {
        // Add new order detail
        await tx.insert(OrderDetailsTable).values({
          orderId: orderInfo.id!,
          productId: product.productId,
          quantity: product.quantity,
        });
        
        // Find if product was in the original order
        const existingDetail = currentOrderDetails.find(
          detail => detail.productId === product.productId
        );
        
        if (existingDetail) {
          // If quantity changed, adjust stock accordingly
          const quantityDiff = product.quantity - existingDetail.quantity;
          if (quantityDiff !== 0) {
            await updateStock(
              product.productId, 
              Math.abs(quantityDiff), 
              quantityDiff > 0 ? "minus" : "add", 
              tx
            );
          }
        } else {
          // New product added to order, reduce stock
          await updateStock(product.productId, product.quantity, "minus", tx);
        }
      });
      
      // Handle products that were removed from the order
      const removedProducts = currentOrderDetails.filter(
        detail => !orderInfo.products.some(p => p.productId === detail.productId)
      );
      
      const restoreStockPromises = removedProducts.map(detail => 
        updateStock(detail.productId, detail.quantity, "add", tx)
      );
      
      // Update payment status if needed
      const paymentUpdatePromise = tx.update(OrdersTable)
        .set({ status: orderInfo.status })
        .where(eq(OrdersTable.id, orderInfo.id!));
        
      await Promise.allSettled([
        ...orderDetailsPromise, 
        ...restoreStockPromises,
        paymentUpdatePromise
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

// Delete Order
export const deleteOrder = async (id: number) => {
  try {
    await db.transaction(async (tx) => {
      // Get order details to restore stock
      const orderDetails = await tx.select()
        .from(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, id))
        .execute();
      
      // Restore stock for each product
      const restoreStockPromises = orderDetails.map(detail => 
        updateStock(detail.productId, detail.quantity, "add", tx)
      );
      
      // Delete order details first (foreign key constraint)
      await tx.delete(OrderDetailsTable)
        .where(eq(OrderDetailsTable.orderId, id));
      
      // Delete the order
      await tx.delete(OrdersTable)
        .where(eq(OrdersTable.id, id));
        
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

// Search Orders by Order Number
export const searchOrderByNumber = async (searchTerm: string) => {
  try {
    const orders = await db.query.OrdersTable.findMany({
      where: like(OrdersTable.orderNumber, `%${searchTerm}%`),
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
    
    return orders.map((order) => ({
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
  } catch (e) {
    console.log(e);
    return [];
  }
};

// Get All Orders
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

// Get Order By ID
export const getOrderById = async (id: number) => {
  try {
    const result = await db.query.OrdersTable.findMany({
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
    }));
    return orders[0];
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Fetching order failed", error: e.message };
    }
    console.log("error", e);
    return { message: "Fetching order failed", error: "Unknown error" };
  }
};

// Get Paginated Orders with efficient querying
export const getPaginatedOrders = async (
  page: number = 1,
  pageSize = PRODUCT_PER_PAGE,
  sorting: SortingState = [],
  statusFilter?: string
) => {
  console.log("Fetching paginated orders with page:", page, "pageSize:", pageSize);
  
  try {
    // Build the conditions array for filtering
    const conditions: SQL<unknown>[] = [];
    
    if (statusFilter && statusFilter !== "all") {
      conditions.push(eq(OrdersTable.status, statusFilter));
    }
    
    // Query to get total count with filters applied
    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(OrdersTable);
    
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }
    
    // Base query for orders with needed relations
    let ordersQuery = db
      .select({
        ...getTableColumns(OrdersTable),
      })
      .from(OrdersTable);
    
    // Apply filters if any
    if (conditions.length > 0) {
      ordersQuery = ordersQuery.where(and(...conditions));
    }
    
    // Apply sorting
    const orderByConditions: SQL<unknown>[] = [];
    
    if (sorting.length > 0) {
      for (const sort of sorting) {
        if (sort.id === "total") {
          orderByConditions.push(sort.desc ? desc(OrdersTable.total) : asc(OrdersTable.total));
        } else if (sort.id === "createdAt") {
          orderByConditions.push(sort.desc ? desc(OrdersTable.createdAt) : asc(OrdersTable.createdAt));
        } else if (sort.id === "orderNumber") {
          orderByConditions.push(sort.desc ? desc(OrdersTable.orderNumber) : asc(OrdersTable.orderNumber));
        }
      }
    } else {
      // Default sorting by latest orders
      orderByConditions.push(desc(OrdersTable.createdAt));
    }
    
    if (orderByConditions.length > 0) {
      ordersQuery = ordersQuery.orderBy(...orderByConditions);
    }
    
    // Apply pagination
    ordersQuery = ordersQuery
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    
    // Execute both queries in parallel
    const [orderIds, totalResult] = await Promise.all([
      ordersQuery,
      totalQuery
    ]);
    
    // If no orders found, return empty result
    if (orderIds.length === 0) {
      return {
        orders: [],
        total: { count: totalResult[0]?.count || 0 }
      };
    }
    
    // Get full order details for the page of results
    const orders = await Promise.all(
      orderIds.map(async (order) => {
        const orderWithDetails = await db.query.OrdersTable.findFirst({
          where: eq(OrdersTable.id, order.id),
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
        
        if (!orderWithDetails) return null;
        
        return {
          id: orderWithDetails.id,
          orderNumber: orderWithDetails.orderNumber,
          customerPhone: orderWithDetails.customerPhone,
          status: orderWithDetails.status,
          total: orderWithDetails.total,
          notes: orderWithDetails.notes,
          createdAt: orderWithDetails.createdAt,
          updatedAt: orderWithDetails.updatedAt,
          products: orderWithDetails.orderDetails.map((detail) => ({
            quantity: detail.quantity,
            name: detail.product.name,
            id: detail.product.id, 
            imageUrl: detail.product.images[0]?.url,
          })),
        };
      })
    );
    
    return {
      orders: orders.filter(Boolean),
      total: { count: totalResult[0]?.count || 0 }
    };
    
  } catch (e) {
    console.log("Error fetching paginated orders:", e);
    if (e instanceof Error) {
      return { 
        orders: [],
        total: { count: 0 },
        message: "Fetching orders failed", 
        error: e.message 
      };
    }
    return { 
      orders: [],
      total: { count: 0 },
      message: "Fetching orders failed", 
      error: "Unknown error" 
    };
  }
};
