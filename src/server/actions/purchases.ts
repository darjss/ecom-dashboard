"use server";
import "server-only";
import { eq, desc, asc, sql, and, lt } from "drizzle-orm";
import { db } from "../db";
import { ProductsTable, PurchasesTable } from "../db/schema";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import type { addPurchaseType } from "@/lib/zod/schema";

export const addPurchase = async (data: addPurchaseType) => {
  try {
    await db.transaction(async (tx) => {
      for (const product of data.products) {
        await tx.insert(PurchasesTable).values({
          productId: product.productId,
          quantityPurchased: product.quantity,
          unitCost: product.unitCost,
        });

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

    return { message: "Purchase added successfully" };
  } catch (e) {
    console.error("Error adding purchase:", e);
    if (e instanceof Error) {
      return { message: "Adding purchase failed", error: e.message };
    }
    return { message: "Adding purchase failed", error: "Unknown error" };
  }
};

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

export const getPaginatedPurchases = async (
  page: number = 1,
  pageSize = PRODUCT_PER_PAGE,
  sortField?: string,
  sortDirection: "asc" | "desc" = "asc",
  productId?: number,
) => {
  try {
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
      orderBy = desc(PurchasesTable.createdAt);
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

export const updatePurchase = async (id: number, data: addPurchaseType) => {
  try {
    await db.transaction(async (tx) => {
      const originalPurchases = await tx.query.PurchasesTable.findMany({
        where: eq(PurchasesTable.id, id),
      });

      if (originalPurchases.length === 0) {
        throw new Error("Purchase not found");
      }

      await tx.delete(PurchasesTable).where(eq(PurchasesTable.id, id));

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

      for (const product of data.products) {
        await tx.insert(PurchasesTable).values({
          id,
          productId: product.productId,
          quantityPurchased: product.quantity,
          unitCost: product.unitCost,
        });

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

export const deletePurchase = async (id: number) => {
  try {
    await db.transaction(async (tx) => {
      const purchase = await tx.query.PurchasesTable.findFirst({
        where: eq(PurchasesTable.id, id),
      });

      if (!purchase) {
        throw new Error("Purchase not found");
      }

      await tx.delete(PurchasesTable).where(eq(PurchasesTable.id, id));

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

export const getAverageCostOfProduct = async (
  productId: number,
  createdAt: Date,
) => {
  const purchases = await db
    .select()
    .from(PurchasesTable)
    .where(
      and(
        eq(PurchasesTable.productId, productId),
        lt(PurchasesTable.createdAt, createdAt),
      ),
    );
  const sum = purchases.reduce(
    (acc, purchase) => acc + purchase.unitCost * purchase.quantityPurchased,
    0,
  );
  const totalProduct = purchases.reduce(
    (acc, purchase) => acc + purchase.quantityPurchased,
    0,
  );
  return sum / totalProduct;
};
