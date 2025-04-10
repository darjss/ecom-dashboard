"use server";
import "server-only";
import { db } from "@/server/db";
import { ProductImagesTable, ProductsTable } from "../db/schema";
import { and, asc, desc, eq, SQL, sql, like, gt, lt, or } from "drizzle-orm";
import { addProductType } from "@/lib/zod/schema";
import { z } from "zod";
import { getAllBrands } from "./brand";
import { updateImage, uploadImagesFromUrl } from "./image";
import {
  unstable_cacheLife as cacheLife,
  revalidateTag,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { TransactionType } from "@/lib/types";
import { redirect } from "next/navigation";

export const searchProductByName = async (searchTerm: string) => {
  const products = await db.query.ProductsTable.findMany({
    where: like(ProductsTable.name, `%${searchTerm}%`),
    limit: 3,
    with: {
      images: true,
    },
  });
  return products;
};

export const searchProductByNameForOrder = async (searchTerm: string) => {
  const products = await db.query.ProductsTable.findMany({
    where: like(ProductsTable.name, `%${searchTerm}%`),
    limit: 3,
    columns: {
      id: true,
      name: true,
      price: true,
      stock: true,
    },
    with: {
      images: {
        columns: {
          url: true,
        },
        where: eq(ProductImagesTable.isPrimary, true),
      },
    },
  });
  return products;
};

export const addProduct = async (product: addProductType) => {
  product.images.pop();
  const imagesUrls = product.images.map((image) => {
    const parsed = z.string().url().safeParse(image.url);
    if (!parsed.success) {
      return { message: "image url validation error", error: parsed.error };
    }
    return parsed.data;
  });
  const allBrands = await getAllBrands();
  console.log("brands", allBrands);
  const brandName = allBrands.find(
    (brand) => brand.id === product.brandId,
  )?.name;
  product.name =
    brandName +
    " " +
    product.name +
    " " +
    product.potency +
    " " +
    product.amount;
  const slug = product.name.replace(/\s+/g, "-").toLowerCase();
  try {
    const [productResult] = await db
      .insert(ProductsTable)
      .values({
        name: product.name,
        slug: slug,
        description: product.description,
        discount: 0,
        amount: product.amount,
        potency: product.potency,
        stock: product.stock,
        price: product.price,
        dailyIntake: product.dailyIntake,
        categoryId: product.categoryId,
        brandId: product.brandId,
        status: "active",
      })
      .returning();
    if (productResult === null || productResult === undefined) {
      throw new Error("productResult is null or undefined");
    }
    const productId = productResult.id;
    console.log(`Product added with id: ${productId}`);
    const images = product.images.map((image, index) => ({
      productId: productId,
      url: image.url,
      isPrimary: index === 0 ? true : false,
    }));
    await uploadImagesFromUrl(images);

    console.log("Images added successfully");
    redirect("/products");
    return { message: "Added product Successfully" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};

export const getProductBenchmark = async () => {
  const startTime = performance.now();
  const result = await db.query.ProductsTable.findMany({
    with: {
      images: true,
    },
  });
  return performance.now() - startTime;
};

export const getProductById = async (id: number) => {
  console.log("Fetching product with id", id);
  const product = await db.query.ProductsTable.findFirst({
    where: eq(ProductsTable.id, id),
    with: {
      images: {
        columns: {
          id: true,
          url: true,
          isPrimary: true,
        },
      },
    },
  });
  if (product === undefined) {
    return { message: "Operation failed", error: "Product not found" };
  }
  console.log(product);
  return product;
};

export const updateProduct = async (product: addProductType) => {
  try {
    console.log("updating product");
    if (product.id === undefined) {
      return { message: "Operation Failed", error: "Product id not found" };
    }
    const { images, ...Parsedproduct } = product;
    images.pop();
    for (let i = 0; i < images.length; i++) {
      if (images[i]?.id === undefined && images[i] === undefined) {
        return { message: "Operation Failed", error: "Product id not found" };
      }
      const parsed = z.string().url().safeParse(images[i]?.url);
      if (!parsed.success) {
        return { message: "image url validation error", error: parsed.error };
      }
    }
    const allBrands = await getAllBrands();
    const brandName = allBrands.find(
      (brand) => brand.id === product.brandId,
    )?.name;
    product.name =
      brandName +
      " " +
      product.name +
      " " +
      product.potency +
      " " +
      product.amount;
    const slug = product.name.replace(/\s+/g, "-").toLowerCase();
    const updatedProduct = await db
      .update(ProductsTable)
      .set({ ...Parsedproduct, slug: slug })
      .where(eq(ProductsTable.id, product.id));
    updateImage(images, product.id);
    revalidateTag("products");
    return { message: "Updated product Successfully" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};

export const updateStock = async (
  productId: number,
  numberToUpdate: number,
  type: "add" | "minus",
  tx?: TransactionType,
) => {
  try {
    const result = await (tx || db)
      .update(ProductsTable)
      .set({
        stock: sql`${ProductsTable.stock} ${type === "add" ? "+" : "-"} ${numberToUpdate}`,
      })
      .where(eq(ProductsTable.id, productId));
    return { message: "Updated product Successfully" };
  } catch (e) {
    return { message: "Operation failed", error: e };
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const result = await db
      .delete(ProductsTable)
      .where(eq(ProductsTable.id, id));
    revalidateTag("products");
    return { message: "Successfully deleted Product" };
  } catch (e) {
    console.log(e);
    return { message: "Deleting failed", error: e };
  }
};

export const getAllProducts = async () => {
  "use cache";
  cacheTag("products");

  console.log("fetching product");
  const products = await db.query.ProductsTable.findMany({
    with: {
      images: {
        columns: {
          id: true,
          url: true,
          isPrimary: true,
        },
      },
    },
  });
  return products;
};

// Define a type for the cursor
type ProductCursor = {
  id: number;
  [key: string]: number | string | undefined | Date; // To hold sort field value like price or stock
} | null;

export const getPaginatedProducts = async (
  pageSize = 10,
  sortField?: string,
  sortDirection: "asc" | "desc" = "asc",
  brandId?: number,
  categoryId?: number,
  cursor: ProductCursor = null, // Added cursor parameter
) => {
  try {
    // Allow undefined elements in conditions array
    const conditions: (SQL<unknown> | undefined)[] = [];

    // --- Existing Filters ---
    if (brandId !== undefined && brandId !== 0) {
      conditions.push(eq(ProductsTable.brandId, brandId));
    }
    if (categoryId !== undefined && categoryId !== 0) {
      conditions.push(eq(ProductsTable.categoryId, categoryId));
    }
    // --- End Existing Filters ---

    // --- Cursor Logic ---
    if (cursor) {
      const { id: cursorId, ...sortValues } = cursor;
      let cursorSortValue: number | string | Date | undefined;
      // Use the specific column object type
      let sortColumnObject:
        | typeof ProductsTable.price
        | typeof ProductsTable.stock
        | typeof ProductsTable.createdAt;

      if (sortField === "price") {
        sortColumnObject = ProductsTable.price;
        cursorSortValue = cursor.price; // Expect number
      } else if (sortField === "stock") {
        sortColumnObject = ProductsTable.stock;
        cursorSortValue = cursor.stock; // Expect number
      } else {
        // Default to createdAt
        sortColumnObject = ProductsTable.createdAt;
        cursorSortValue = cursor.createdAt; // Expect Date or compatible type
        // Add type check/conversion if cursor stores date differently (e.g., ISO string)
        if (cursorSortValue && typeof cursorSortValue === "string") {
          try {
            cursorSortValue = new Date(cursorSortValue);
          } catch {
            /* Ignore parsing errors? */
          }
        }
      }

      // Ensure cursorId is defined before proceeding
      if (cursorId !== undefined) {
        if (
          cursorSortValue !== undefined &&
          cursorSortValue instanceof Date &&
          isNaN(cursorSortValue.getTime())
        ) {
          // Handle invalid date
          console.warn(
            "Invalid date encountered in product cursor:",
            cursor.createdAt,
          );
          conditions.push(gt(ProductsTable.id, cursorId));
        } else if (cursorSortValue !== undefined) {
          // We have a valid sort value and ID
          const operator = sortDirection === "asc" ? gt : lt;

          // Use explicit type casting for comparison value
          const cursorCondition = operator(
            sortColumnObject,
            cursorSortValue as number | Date,
          );

          const tieBreakingCondition = and(
            eq(sortColumnObject, cursorSortValue as number | Date),
            gt(ProductsTable.id, cursorId), // Use > for ID tie-breaker
          );

          conditions.push(or(cursorCondition, tieBreakingCondition));
        } else {
          // Fallback: ID-based cursor
          conditions.push(gt(ProductsTable.id, cursorId));
        }
      }
    }
    // --- End Cursor Logic ---

    // --- Define Order By ---
    let orderByClauses: SQL<unknown>[] = [];
    const primarySortColumn =
      sortField === "price"
        ? ProductsTable.price
        : sortField === "stock"
          ? ProductsTable.stock
          : ProductsTable.createdAt; // Default sort

    const primaryOrderBy =
      sortDirection === "asc"
        ? asc(primarySortColumn)
        : desc(primarySortColumn);

    orderByClauses.push(primaryOrderBy);
    orderByClauses.push(asc(ProductsTable.id)); // Ascending ID for stability
    // --- End Define Order By ---

    // Filter out undefined conditions
    const finalConditions = conditions.filter(
      (c): c is SQL<unknown> => c !== undefined,
    );

    // Fetch one extra item to determine if there's a next page
    const products = await db.query.ProductsTable.findMany({
      limit: pageSize + 1, // Fetch one extra
      orderBy: orderByClauses,
      // Pass filtered conditions or undefined
      where: finalConditions.length > 0 ? and(...finalConditions) : undefined,
      with: {
        images: true,
      },
    });

    // --- Determine next cursor ---
    let nextCursor: ProductCursor = null;
    if (products.length > pageSize) {
      // Remove the extra item used for checking existence of the next page
      products.pop();
      const lastProduct = products[products.length - 1]; // Get the actual last item of the current page

      if (lastProduct) {
        nextCursor = { id: lastProduct.id };
        if (sortField === "price") nextCursor.price = lastProduct.price;
        else if (sortField === "stock") nextCursor.stock = lastProduct.stock;
        // Always include createdAt in cursor if it's the sort field or default
        // Pass the actual Date object or compatible type
        if (!sortField || sortField === "createdAt") {
          nextCursor.createdAt = lastProduct.createdAt;
        }
      }
    }
    // --- End determine next cursor ---

    return {
      products,
      nextCursor, // Return nextCursor instead of totalCount
    };
  } catch (e) {
    console.error("Error in paginated products:", e);
    return {
      products: [],
      nextCursor: null, // Return null cursor on error
      // Add an error field for frontend handling
      error:
        e instanceof Error
          ? e.message
          : "Unknown error fetching paginated products",
    };
  }
};

export const setProductStock = async (id: number, newStock: number) => {
  const result = await db
    .update(ProductsTable)
    .set({ stock: newStock })
    .where(eq(ProductsTable.id, id));
  revalidateTag("products");
  // redirect("/products")
};

export const getAllProductValue = async () => {
  "use cache";
  cacheTag("products");
  cacheLife({
    expire: 7 * 24 * 60 * 60,
    stale: 60 * 60 * 6,
    revalidate: 60 * 60 * 24,
  });
  const result = await db
    .select({ stock: ProductsTable.stock, price: ProductsTable.price })
    .from(ProductsTable);
  const total = result.reduce(
    (acc, product) => acc + product.price * product.stock,
    0,
  );
  return total;
};
