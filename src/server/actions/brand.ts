"use server";
import "server-only";
import { unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { db } from "../db";
import { BrandInsertType, BrandsTable } from "../db/schema";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { addBrandType } from "@/lib/zod/schema";

export const getAllBrands = async () => {
  "use cache";
  cacheLife("brandCategory");
  cacheTag("brandCategory");
  console.log("fetching brands");
  const brands = await db
    .select({
      id: BrandsTable.id,
      name: BrandsTable.name,
      logoUrl: BrandsTable.logoUrl,
      createdAt: BrandsTable.createdAt,
      updatedAt: BrandsTable.updatedAt,
    })
    .from(BrandsTable);
  return brands;
};

export const addBrand = async (brand: BrandInsertType) => {
  try {
    await db.insert(BrandsTable).values(brand);
    revalidateTag("brandCategory");
    return { message: "Successfully added brand" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};

export const updateBrand = async (brand: addBrandType) => {
  try {
    if (!brand.id) {
      return { message: "Operation failed", error: "Brand ID not found" };
    }
    await db
      .update(BrandsTable)
      .set({ name: brand.name, logoUrl: brand.logoUrl })
      .where(eq(BrandsTable.id, brand.id));
    revalidateTag("brandCategory");
    return { message: "Successfully updated brand" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};

export const deleteBrand = async (id: number) => {
  try {
    await db.delete(BrandsTable).where(eq(BrandsTable.id, id));
    revalidateTag("brandCategory");
    return { message: "Successfully deleted brand" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};
