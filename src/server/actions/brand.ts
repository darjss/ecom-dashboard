import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { db } from "../db";
import { BrandInsertType, BrandsTable } from "../db/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getAllBrands = async () => {
  "use cache";
  cacheLife("brandCategory");
  cacheTag("brandCategory");
  console.log("fetching brands");
  const brands = await db
    .select({ id: BrandsTable.id, name: BrandsTable.name })
    .from(BrandsTable);
  return brands;
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