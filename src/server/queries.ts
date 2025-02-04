"use server";
import "server-only";
import { db } from "./db";
import {
  BrandInsertType,
  BrandsTable,
  CategoriesTable,
  CategoryInsertType,
  ProductImageInsertType,
  ProductImagesTable,
  ProductSelectType,
  ProductsTable,
  UserSelectType,
  UsersTable,
} from "./db/schema";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { redis } from "./db";
import { addProductType } from "@/lib/zod/schema";
import { z } from "zod";

import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { error } from "console";
import { revalidatePath } from "next/cache";
import { L } from "node_modules/@upstash/redis/zmscore-Dc6Llqgr.mjs";

export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}
export interface ProductImageType{
  id: number,
  url:string
}
export const insertSession = async (session: Session) => {
  // Convert Date to ISO string for storage
  const sessionToStore = {
    ...session,
    expiresAt: session.expiresAt.toISOString(),
  };
  return await redis.json.set(session.id, "$", sessionToStore);
};

export const getSession = async (sessionId: string) => {
  "use cache";
  console.log("Getting session");
  const session = (await redis.json.get(sessionId)) as Session | null;
  if (session === null || session === undefined) {
    return null;
  }

  // Convert ISO string back to Date
  const sessionWithDate = {
    ...session,
    expiresAt: new Date(session.expiresAt),
  };

  const result = await db
    .select({ user: UsersTable })
    .from(UsersTable)
    .where(eq(UsersTable.id, sessionWithDate.userId as number))
    .limit(1);

  const user = result[0];
  if (user === null || user === undefined) {
    return null;
  }

  return {
    session: sessionWithDate as Session,
    user: user.user as UserSelectType,
  };
};
export const deleteSession = async (sessionId: string) => {
  return await redis.del(sessionId);
};
export const updateSession = async (session: Session) => {
  return await redis.set(session.id, JSON.stringify(session));
};
export const createUser = async (googleId: string, username: string) => {
  const [user] = await db
    .insert(UsersTable)
    .values({
      googleId,
      username,
    })
    .returning({
      id: UsersTable.id,
      username: UsersTable.username,
      googleId: UsersTable.googleId,
      createdAt: UsersTable.createdAt,
      updatedAt: UsersTable.updatedAt,
    });
  if (user === null || user == undefined) {
    throw new Error("User not found");
  }
  return user;
};
export const getUserFromGoogleId = async (googleId: string) => {
  const result = await db
    .select({ user: UsersTable })
    .from(UsersTable)
    .where(eq(UsersTable.googleId, googleId));
  if (result.length < 1 || result[0] === undefined) {
    return null;
  }
  return result[0].user as UserSelectType;
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
    const imagePromises = product.images.map((image, index) => {
      return addImage({
        productId: productId,
        url: image.url,
        isPrimary: index === 0 ? true : false,
      });
    });
    await Promise.allSettled(imagePromises);
    console.log("Images added successfully");
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Product added successfully" };
};
export const addBrand = async (brand: BrandInsertType) => {
  try {
    await db.insert(BrandsTable).values(brand);
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
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
    images: JSON.parse(product.images as string) as {
      id: number;
      url: string;
    }[],
  };
};
export const updateProduct = async (product: addProductType) => {
  try {
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
    const updateProductPromise = db
      .update(ProductsTable)
      .set({...Parsedproduct, slug: slug})
      .where(eq(ProductsTable.id, product.id));
      const updateImagePromises: Promise<any>[] = images.map((img, index) =>
        db
          .update(ProductImagesTable)
          .set({ url: img!.url })
          .where(eq(ProductImagesTable.id, img!.id as number))
      );
   await Promise.allSettled([updateProductPromise,...updateImagePromises ])
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};
 
const updateImage= async(newImages: ProductImageType[], productId: number)=>{
  const existingImages=await db.select({
    id:ProductImagesTable.id,
    url:ProductImagesTable.url
  }).from(ProductImagesTable).where(eq(ProductImagesTable, productId));
 let isDiff:boolean=false;
 if(newImages.length!=existingImages.length){
  isDiff=true;
 } else{
   newImages.sort((a,b)=>a.url.localeCompare(b.url));
   existingImages.sort((a,b)=>a.url.localeCompare(b.url));
   for(let i=0; i<newImages.length; i++){
    if(newImages[i].)
   }
  }


}

export const deleteProduct = async (id: number) => {
  try {
    const result = await db
      .delete(ProductsTable)
      .where(eq(ProductsTable.id, id));
    revalidatePath("/products");
    return { message: "Successfully deleted Product" };
  } catch (e) {
    console.log(e);
    return { message: "Deleting failed", error: e };
  }
};

export const getAllProducts = async () => {
  "use cache";
  cacheLife("minutes");
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
    console.log("images",products[0]?.images)

  const parsedProducts = products.map((product) => ({
    ...product,
    images: JSON.parse(product.images as string) as ProductImageType[],
  }));
  console.log("products:", parsedProducts);
  return parsedProducts;
};

export const addCategory = async (category: CategoryInsertType) => {
  try {
    await db.insert(CategoriesTable).values(category);
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
};

export const getAllBrands = async () => {
  "use cache";
  cacheLife("brandCategory");
  console.log("fetching brands");
  const brands = await db
    .select({ id: BrandsTable.id, name: BrandsTable.name })
    .from(BrandsTable);
  return brands;
};

export const getAllCategories = async () => {
  "use cache";
  cacheLife("brandCategory");
  console.log("fetching categories");
  const categories = await db
    .select({ id: CategoriesTable.id, name: CategoriesTable.name })
    .from(CategoriesTable);
  return categories;
};
export const addImage = async (image: ProductImageInsertType) => {
  try {
    await db.insert(ProductImagesTable).values(image);
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
};
export type BrandType = Awaited<ReturnType<typeof getAllBrands>>;
export type CategoryType = Awaited<ReturnType<typeof getAllCategories>>;
export type ProductType = Exclude<
  Exclude<Awaited<ReturnType<typeof getProductById>>, null>,
  { message: string; error: string }
>;
