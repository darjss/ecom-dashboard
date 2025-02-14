import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { db } from "../db";
import { CategoriesTable, CategoryInsertType } from "../db/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getAllCategories = async () => {
  "use cache";
  cacheLife("brandCategory");
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
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
};
