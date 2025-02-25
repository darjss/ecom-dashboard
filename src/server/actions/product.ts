"use server";
import "server-only";
import { db } from "@/server/db";
import { ProductImagesTable, ProductsTable } from "../db/schema";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  SQL,
  sql,
  like,
  InferSelectModel,
} from "drizzle-orm";
import { addProductType } from "@/lib/zod/schema";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { SortingState } from "@tanstack/react-table";
import { getAllBrands } from "./brand";
import { addImage, updateImage, uploadImagesFromUrl } from "./image";
import { redirect } from "next/navigation";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { ProductImageType, TransactionType } from "@/lib/types";

export const searchProductByNameForTable = async (searchTerm: string) => {
  console.log(searchTerm);
  const products = await db
    .select({
      ...getTableColumns(ProductsTable),
      images: sql`
      json_group_array(
        json_object(
          'id', ${ProductImagesTable.id},
          'url', ${ProductImagesTable.url}
        )
      )
    `.as<"images">(),
    })
    .from(ProductsTable)
    .where(like(ProductsTable.name, `%${searchTerm}%`))
    .leftJoin(
      ProductImagesTable,
      eq(ProductImagesTable.productId, ProductsTable.id),
    )
    .groupBy(ProductsTable.id);
  console.log(products);
  const parsedProducts = products.map((product) => ({
    ...product,
    images: JSON.parse(product.images as string) as ProductImageType[],
  }));
  return parsedProducts;
};

export const searchProductByName = async (searchTerm: string) => {
  const product = db
    .select({
      id: ProductsTable.id,
      name: ProductsTable.name,
    })
    .from(ProductsTable)
    .where(like(ProductsTable.name, `%${searchTerm}%`));
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
  const [product] = await db
    .select({
      ...getTableColumns(ProductsTable),
      images: sql`
        json_group_array(
          json_object(
            'id', ${ProductImagesTable.id},
            'url', ${ProductImagesTable.url}
          )
        )
      `.as<"images">(),
    })
    .from(ProductsTable)
    .leftJoin(
      ProductImagesTable,
      eq(ProductImagesTable.productId, ProductsTable.id),
    )
    .where(eq(ProductsTable.id, id))
    .groupBy(ProductsTable.id);
  if (product === undefined) {
    return { message: "Operation failed", error: "Product not found" };
  }
  console.log(product);
  return {
    ...product,
    images: JSON.parse(product.images as string) as ProductImageType[],
  };
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
  const products = await db
    .select({
      ...getTableColumns(ProductsTable),
      images: sql`
        json_group_array(
          json_object(
            'id', ${ProductImagesTable.id},
            'url', ${ProductImagesTable.url}
          )
        )
      `.as<"images">(),
    })
    .from(ProductsTable)
    .leftJoin(
      ProductImagesTable,
      eq(ProductImagesTable.productId, ProductsTable.id),
    )
    .groupBy(ProductsTable.id);
  console.log("images", products[0]?.images);

  const parsedProducts = products.map((product) => ({
    ...product,
    images: JSON.parse(product.images as string) as ProductImageType[],
  }));
  // console.log("products:", parsedProducts);
  return parsedProducts;
};

export const getPaginatedProduct = async (
  page: number = 1,
  pageSize = 10,
  sorting: SortingState = [],
  brandId?: number,
  categoryId?: number,
) => {
  console.log("fetching paginated product");

  let baseQuery = db
    .select({
      ...getTableColumns(ProductsTable),
      images: sql`
        json_group_array(
          json_object(
            'id', ${ProductImagesTable.id},
            'url', ${ProductImagesTable.url}
          )
        )
      `.as<"images">(),
    })
    .from(ProductsTable)
    .leftJoin(
      ProductImagesTable,
      eq(ProductImagesTable.productId, ProductsTable.id),
    )
    .groupBy(ProductsTable.id);

  const conditions: SQL<unknown>[] = [];

  if (brandId !== undefined && brandId !== 0) {
    conditions.push(eq(ProductsTable.brandId, brandId));
  }

  if (categoryId !== undefined && categoryId !== 0) {
    conditions.push(eq(ProductsTable.categoryId, categoryId));
  }

  const queryWithFilters =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

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

  const finalQuery =
    orderByConditions.length > 0
      ? queryWithFilters
          .orderBy(...orderByConditions)
          .offset((page - 1) * pageSize)
          .limit(pageSize)
      : queryWithFilters.offset((page - 1) * pageSize).limit(pageSize);

  const [products, totalProducts] = await Promise.all([
    finalQuery,
    db.select({ count: sql<number>`count(*)` }).from(ProductsTable),
  ]);

  const parsedProducts = products.map((product) => ({
    ...product,
    images: JSON.parse(product.images as string) as ProductImageType[],
  }));
  console.log(
    "page number",
    page,
    "pagesize",
    pageSize,
    "products:",
    parsedProducts,
    "sorting:",
    sorting,
    "brandId",
    brandId,
    "categoryID",
    categoryId,
  );
  return { products: parsedProducts, total: totalProducts[0] };
};
