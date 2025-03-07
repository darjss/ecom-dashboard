"use server";
import "server-only";
import { db } from "@/server/db";
import { ProductsTable } from "../db/schema";
import {
  and,
  asc,
  desc,
  eq, SQL,
  sql,
  like
} from "drizzle-orm";
import { addProductType } from "@/lib/zod/schema";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { SortingState } from "@tanstack/react-table";
import { getAllBrands } from "./brand";
import { updateImage, uploadImagesFromUrl } from "./image";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { TransactionType } from "@/lib/types";

export const searchProductByNameForTable = async (searchTerm: string) => {
  console.log(searchTerm);
  const products = await db.query.ProductsTable.findMany({
    where: like(ProductsTable.name, `%${searchTerm}%`),
    with: {
      images: true
    }
  });
  console.log(products);
  return products;
};

export const searchProductByName = async (searchTerm: string) => {
  const product = await db.query.ProductsTable.findMany({
    columns: {
      id: true,
      name: true,
    },
    where: like(ProductsTable.name, `%${searchTerm}%`)
  });
  return product;
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
    // revalidateTag("products");
    // redirect("/products");
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
    // redirect("/products");
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
    // redirect("/products");
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

export const getPaginatedProduct = async (
  page: number = 1,
  pageSize = 10,
  sorting: SortingState = [],
  brandId?: number,
  categoryId?: number,
) => {
  console.log("fetching paginated product");

  // Build conditions array first
  const conditions: SQL<unknown>[] = [];

  if (brandId !== undefined && brandId !== 0) {
    conditions.push(eq(ProductsTable.brandId, brandId));
  }

  if (categoryId !== undefined && categoryId !== 0) {
    conditions.push(eq(ProductsTable.categoryId, categoryId));
  }

  // Get total count with the same conditions
  const totalCountResult = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(ProductsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = totalCountResult[0]?.count || 0;

  // Build order by conditions
  const orderByConditions: SQL<unknown>[] = sorting
    .filter((sort) => sort.id === "price" || sort.id === "stock")
    .map((sort) => {
      if (sort.id === "price") {
        return sort.desc ? desc(ProductsTable.price) : asc(ProductsTable.price);
      } else if (sort.id === "stock") {
        return sort.desc ? desc(ProductsTable.stock) : asc(ProductsTable.stock);
      }
      return null;
    })
    .filter((condition): condition is SQL<unknown> => condition !== null);

  // Add a default sort if none specified
  if (orderByConditions.length === 0) {
    orderByConditions.push(asc(ProductsTable.id)); // Default sort by ID
  }

  // Get paginated products
  const products = await db.query.ProductsTable.findMany({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: orderByConditions,
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      images: true,
    },
  });

  return { products, total };
};

export const paginated = async (
  page = 1,
  pageSize = 10,
  sorting: SortingState = [],
  brandId?: number,
  categoryId?: number,
) => {
  // Build conditions array first
  const conditions: SQL<unknown>[] = []

  if (brandId !== undefined && brandId !== 0) {
    conditions.push(eq(ProductsTable.brandId, brandId))
  }

  if (categoryId !== undefined && categoryId !== 0) {
    conditions.push(eq(ProductsTable.categoryId, categoryId))
  }

  // Get total count first with the same conditions
  const totalCountResult = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(ProductsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  const totalCount = totalCountResult[0]?.count || 0

  // Build order by conditions
  const orderByConditions: SQL<unknown>[] = sorting
    .filter((sort) => sort.id === "price" || sort.id === "stock")
    .map((sort) => {
      if (sort.id === "price") {
        return sort.desc ? desc(ProductsTable.price) : asc(ProductsTable.price)
      } else if (sort.id === "stock") {
        return sort.desc ? desc(ProductsTable.stock) : asc(ProductsTable.stock)
      }
      return null
    })
    .filter((condition): condition is SQL<unknown> => condition !== null)

  // Add a default sort if none specified
  if (orderByConditions.length === 0) {
    orderByConditions.push(asc(ProductsTable.id)) // Default sort by ID
  }

  // Get paginated products
  const products = await db.query.ProductsTable.findMany({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: orderByConditions,
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      images: true,
    },
  })

  // Return both the products and the total count
  return {
    products,
    totalCount,
  }
}