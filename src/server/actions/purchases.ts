"use server";
import "server-only";
import {
  eq,
  desc,
  asc,
  sql,
  and,
  lt,
  gt,
  or,
  like,
  SQLWrapper,
} from "drizzle-orm";
import { db } from "../db";
import { ProductsTable, PurchasesTable } from "../db/schema";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import type { addPurchaseType } from "@/lib/zod/schema";

// Define cursor type for purchases
type PurchaseCursor = {
  id: number;
  quantityPurchased?: number;
  unitCost?: number;
  createdAt?: Date;
} | null;

// Type alias for purchase with product name
type PurchaseWithProduct = Awaited<
  ReturnType<typeof getPaginatedPurchases>
>["purchases"][number];

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
  limit: number = PRODUCT_PER_PAGE,
  sortField: string = "createdAt", // Default sort field
  sortDirection: "asc" | "desc" = "desc", // Default direction
  productId?: number,
  cursor: PurchaseCursor = null,
) => {
  try {
    // Determine the orderBy clause
    const direction = sortDirection === "asc" ? asc : desc;
    let orderByColumn;
    switch (sortField) {
      case "quantity":
        orderByColumn = PurchasesTable.quantityPurchased;
        break;
      case "cost":
        orderByColumn = PurchasesTable.unitCost;
        break;
      case "date": // Default to createdAt for 'date'
      default:
        orderByColumn = PurchasesTable.createdAt;
        sortField = "createdAt"; // Ensure sortField matches the column
        break;
    }
    const primaryOrderBy = direction(PurchasesTable.id); // Always use ID for tie-breaking
    const secondaryOrderBy = direction(orderByColumn);

    // Build the where clause for cursor pagination
    let baseWhere = productId
      ? eq(PurchasesTable.productId, productId)
      : undefined;
    let cursorWhere = undefined;

    if (cursor) {
      const cursorValue = cursor[sortField as keyof PurchaseCursor];
      const cursorId = cursor.id;

      if (cursorValue !== undefined && cursorValue !== null) {
        const eqValue = eq(orderByColumn, cursorValue);
        const compareValue =
          sortDirection === "asc"
            ? gt(orderByColumn, cursorValue)
            : lt(orderByColumn, cursorValue);
        const compareId = gt(PurchasesTable.id, cursorId);

        cursorWhere = or(compareValue, and(eqValue, compareId));
      } else {
        cursorWhere = gt(PurchasesTable.id, cursorId);
      }
    }

    // Combine using inferred types
    const whereClause =
      baseWhere && cursorWhere
        ? and(baseWhere, cursorWhere)
        : cursorWhere
          ? cursorWhere
          : baseWhere
            ? baseWhere
            : undefined;

    const purchases = await db.query.PurchasesTable.findMany({
      limit: limit + 1,
      orderBy: [secondaryOrderBy, primaryOrderBy],
      where: whereClause,
      with: {
        product: {
          columns: {
            name: true,
            id: true,
            price: true, // Keep relevant product columns
          },
        },
      },
    });

    let nextCursor: PurchaseCursor = null;
    if (purchases.length > limit) {
      const nextItem = purchases.pop(); // Remove the extra item
      if (nextItem) {
        nextCursor = {
          id: nextItem.id,
          quantityPurchased: nextItem.quantityPurchased,
          unitCost: nextItem.unitCost,
          createdAt: nextItem.createdAt,
        };
      }
    }

    return {
      purchases,
      nextCursor,
    };
  } catch (e) {
    console.error("Error fetching paginated purchases:", e);
    const error = e instanceof Error ? e.message : "Unknown error";
    return {
      purchases: [],
      nextCursor: null,
      message: "Fetching purchases failed",
      error,
    };
  }
};

// Search function (example: search by product name)
export const searchPurchaseByProductName = async (query: string) => {
  if (!query) {
    return []; // Or return paginated results?
  }

  try {
    const results = await db.query.PurchasesTable.findMany({
      where: like(ProductsTable.name, `%${query}%`), // Needs join in query
      with: {
        product: {
          columns: {
            name: true,
            id: true,
            price: true,
          },
        },
      },
      // Consider adding orderBy and limit here if needed
      orderBy: desc(PurchasesTable.createdAt),
      limit: 50, // Limit search results
    });

    // Drizzle doesn't directly support where conditions on joined tables easily in findMany.
    // Perform join and filter manually or use a raw query / view.
    // Alternative: Query Products first, then Purchases.

    // Let's refine using a join approach:
    const joinedResults = await db
      .select({
        purchase: PurchasesTable,
        product: {
          id: ProductsTable.id,
          name: ProductsTable.name,
          price: ProductsTable.price,
        },
      })
      .from(PurchasesTable)
      .innerJoin(ProductsTable, eq(PurchasesTable.productId, ProductsTable.id))
      .where(like(ProductsTable.name, `%${query}%`))
      .orderBy(desc(PurchasesTable.createdAt))
      .limit(50);

    // Map results to the expected structure
    const mappedResults: PurchaseWithProduct[] = joinedResults.map((item) => ({
      ...item.purchase,
      product: item.product,
    }));

    return mappedResults;
  } catch (e) {
    console.error("Error searching purchases:", e);
    const error = e instanceof Error ? e.message : "Unknown error";
    // Return structure consistent with potential error handling in UI
    return { message: "Searching purchases failed", error };
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
