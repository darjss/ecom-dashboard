"use server";
import "server-only";
import { db } from "@/server/db";
import { ProductImagesTable, ProductsTable } from "../db/schema";
import { like, eq } from "drizzle-orm";

export const searchProductByName = async (searchTerm: string) => {
  console.log(searchTerm);
  const result = await db
    .select({
      id: ProductsTable.id,
      name: ProductsTable.name,
      // image: ProductImagesTable.url
    })
    .from(ProductsTable)
    .where(like(ProductsTable.name, `%${searchTerm}%`))
    // .leftJoin(
    //   ProductImagesTable,
    //   eq(ProductImagesTable.productId, ProductsTable.id),
    // )
    // .groupBy(ProductsTable.id);
    console.log(result);
};
