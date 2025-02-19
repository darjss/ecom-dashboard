"use server";
import "server-only";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { db } from "../db";
import { CategoriesTable, CategoryInsertType } from "../db/schema";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { revalidateTag } from "next/cache";

export const getAllCategories = async () => {
  "use cache";
  // cacheLife("brandCategory");
  cacheTag("brandCategory");
  console.log("fetching categories");
  const categories = await db
    .select({ id: CategoriesTable.id, name: CategoriesTable.name })
    .from(CategoriesTable);
  return categories;
};
export const addCategory = async (category: CategoryInsertType) => {
  try {
    await db.insert(CategoriesTable).values(category);
    revalidateTag("brandCategory");
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
};
