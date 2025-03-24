"use server";
import "server-only";
import { db } from "@/server/db";
import { ProductImagesTable, ProductsTable } from "../db/schema";
import { and, asc, desc, eq, SQL, sql, like } from "drizzle-orm";
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
    redirect("/products")
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

export const getPaginatedProducts = async (
  page = 1,
  pageSize = 10,
  sortField?: string,
  sortDirection: "asc" | "desc" = "asc",
  brandId?: number,
  categoryId?: number,
) => {
  try {
    const conditions: SQL<unknown>[] = [];

    if (brandId !== undefined && brandId !== 0) {
      conditions.push(eq(ProductsTable.brandId, brandId));
    }

      if (categoryId !== undefined && categoryId !== 0) {
        conditions.push(eq(ProductsTable.categoryId, categoryId));
      }

    let orderBy;
    if (sortField === "price") {
      orderBy =
        sortDirection === "asc"
          ? asc(ProductsTable.price)
          : desc(ProductsTable.price);
    } else if (sortField === "stock") {
      orderBy =
        sortDirection === "asc"
          ? asc(ProductsTable.stock)
          : desc(ProductsTable.stock);
    } else {
      orderBy = desc(ProductsTable.createdAt);
    }

    const totalCountResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(ProductsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    const products = await db.query.ProductsTable.findMany({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: orderBy,
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        images: true,
      },
    });

    return {
      products,
      totalCount,
    };
  } catch (e) {
    console.error("Error in paginated products:", e);
    return {
      products: [],
      totalCount: 0,
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
