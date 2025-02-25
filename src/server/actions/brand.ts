"use server";
import "server-only";
import { unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { db } from "../db";
import { BrandInsertType, BrandsTable } from "../db/schema";
import { unstable_cacheTag as cacheTag } from "next/cache";

export const getAllBrands = async () => {
  "use cache";
  cacheLife("brandCategory");
  cacheTag("brandCategory");
  console.log("fetching brands");
  const brands = await db
    .select({ id: BrandsTable.id, name: BrandsTable.name })
    .from(BrandsTable);
  // console.log(brands)
  return brands;
};
export const addBrand = async (brand: BrandInsertType) => {
  try {
    await db.insert(BrandsTable).values(brand);
        revalidateTag('brandCategory');
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
};
