"use server";
import "server-only";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { db } from "../db";
import {
  ProductsTable,
  PurchaseInsertType,
  PurchasesTable,
} from "../db/schema";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import type { addPurchaseType } from "@/lib/zod/schema";

// Add Purchase
export const addPurchase = async (data: addPurchaseType) => {
  try {
    await db.transaction(async (tx) => {
      // Add each product purchase
      for (const product of data.products) {
        // Insert the purchase
        await tx.insert(PurchasesTable).values({
          productId: product.productId,
          quantityPurchased: product.quantity,
          unitCost: product.unitCost,
        });

        // Get current stock
        const currentProduct = await tx.query.ProductsTable.findFirst({
          where: eq(ProductsTable.id, product.productId),
          columns: { stock: true },
        });

        const newStock = (currentProduct?.stock || 0) + product.quantity;

        // Update product stock
        await tx
          .update(ProductsTable)
          .set({ stock: newStock })
          .where(eq(ProductsTable.id, product.productId));
      }
    });

    return { message: "Purchase added successfully" };
  } catch (e) {
    console.error("Error adding purchase:", e);
    if (e instanceof Error) {
      return { message: "Adding purchase failed", error: e.message };
    }
    return { message: "Adding purchase failed", error: "Unknown error" };
  }
};

// Get All Purchases
export const getAllPurchases = async () => {
  try {
    const result = await db.query.PurchasesTable.findMany({
      with: {
        product: {
          columns: {
            name: true,
            id: true,
            price: true,
          },
        },
      },
      orderBy: desc(PurchasesTable.createdAt),
    });

    return result;
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Fetching purchases failed", error: e.message };
    }
    console.error("error", e);
    return { message: "Fetching purchases failed", error: "Unknown error" };
  }
};

// Get Purchase By ID
export const getPurchaseById = async (id: number) => {
  try {
    const result = await db.query.PurchasesTable.findFirst({
      where: eq(PurchasesTable.id, id),
      with: {
        product: {
          columns: {
            name: true,
            id: true,
            price: true,
          },
        },
      },
    });

    return result;
  } catch (e) {
    if (e instanceof Error) {
      return { message: "Fetching purchase failed", error: e.message };
    }
    console.error("error", e);
    return { message: "Fetching purchase failed", error: "Unknown error" };
  }
};

// Get Paginated Purchases
export const getPaginatedPurchases = async (
  page: number = 1,
  pageSize = PRODUCT_PER_PAGE,
  sortField?: string,
  sortDirection: "asc" | "desc" = "asc",
  productId?: number,
) => {
  try {
    // Build the order by condition
    let orderBy;
    if (sortField === "quantity") {
      orderBy =
        sortDirection === "asc"
          ? asc(PurchasesTable.quantityPurchased)
          : desc(PurchasesTable.quantityPurchased);
    } else if (sortField === "date") {
      orderBy =
        sortDirection === "asc"
          ? asc(PurchasesTable.createdAt)
          : desc(PurchasesTable.createdAt);
    } else if (sortField === "cost") {
      orderBy =
        sortDirection === "asc"
          ? asc(PurchasesTable.unitCost)
          : desc(PurchasesTable.unitCost);
    } else {
      orderBy = desc(PurchasesTable.createdAt); // Default sort
    }

    const result = await db.query.PurchasesTable.findMany({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: orderBy,
      where:
        productId === undefined
          ? undefined
          : eq(PurchasesTable.productId, productId),
      with: {
        product: {
          columns: {
            name: true,
            id: true,
            price: true,
          },
        },
      },
    });

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(PurchasesTable)
      .where(
        productId === undefined
          ? undefined
          : eq(PurchasesTable.productId, productId),
      );

    return {
      purchases: result,
      total: total[0]?.count || 0,
    };
  } catch (e) {
    console.error("Error fetching paginated purchases:", e);
    if (e instanceof Error) {
      return {
        purchases: [],
        total: 0,
        message: "Fetching purchases failed",
        error: e.message,
      };
    }
    return {
      purchases: [],
      total: 0,
      message: "Fetching purchases failed",
      error: "Unknown error",
    };
  }
};

// Update Purchase
export const updatePurchase = async (id: number, data: addPurchaseType) => {
  try {
    await db.transaction(async (tx) => {
      // Get all purchases for this ID
      const originalPurchases = await tx.query.PurchasesTable.findMany({
        where: eq(PurchasesTable.id, id),
      });

      if (originalPurchases.length === 0) {
        throw new Error("Purchase not found");
      }

      // Delete all existing purchases
      await tx.delete(PurchasesTable).where(eq(PurchasesTable.id, id));

      // Revert stock changes from original purchases
      for (const originalPurchase of originalPurchases) {
        const product = await tx.query.ProductsTable.findFirst({
          where: eq(ProductsTable.id, originalPurchase.productId),
          columns: { stock: true },
        });

        const newStock =
          (product?.stock || 0) - originalPurchase.quantityPurchased;

        await tx
          .update(ProductsTable)
          .set({ stock: newStock })
          .where(eq(ProductsTable.id, originalPurchase.productId));
      }

      // Add new purchases
      for (const product of data.products) {
        // Insert the purchase
        await tx.insert(PurchasesTable).values({
          id,
          productId: product.productId,
          quantityPurchased: product.quantity,
          unitCost: product.unitCost,
        });

        // Update product stock
        const currentProduct = await tx.query.ProductsTable.findFirst({
          where: eq(ProductsTable.id, product.productId),
          columns: { stock: true },
        });

        const newStock = (currentProduct?.stock || 0) + product.quantity;

        await tx
          .update(ProductsTable)
          .set({ stock: newStock })
          .where(eq(ProductsTable.id, product.productId));
      }
    });

    return { message: "Purchase updated successfully" };
  } catch (e) {
    console.error("Error updating purchase:", e);
    if (e instanceof Error) {
      return { message: "Updating purchase failed", error: e.message };
    }
    return { message: "Updating purchase failed", error: "Unknown error" };
  }
};

// Delete Purchase
export const deletePurchase = async (id: number) => {
  try {
    await db.transaction(async (tx) => {
      // Get the purchase to be deleted
      const purchase = await tx.query.PurchasesTable.findFirst({
        where: eq(PurchasesTable.id, id),
      });

      if (!purchase) {
        throw new Error("Purchase not found");
      }

      // Delete the purchase
      await tx.delete(PurchasesTable).where(eq(PurchasesTable.id, id));

      // Update product stock
      const product = await tx.query.ProductsTable.findFirst({
        where: eq(ProductsTable.id, purchase.productId),
        columns: { stock: true },
      });

      const newStock = (product?.stock || 0) - purchase.quantityPurchased;

      await tx
        .update(ProductsTable)
        .set({ stock: newStock })
        .where(eq(ProductsTable.id, purchase.productId));
    });

    return { message: "Purchase deleted successfully" };
  } catch (e) {
    console.error("Error deleting purchase:", e);
    if (e instanceof Error) {
      return { message: "Deleting purchase failed", error: e.message };
    }
    return { message: "Deleting purchase failed", error: "Unknown error" };
  }
};
