"use server";
import "server-only";
import { unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { db } from "../db";
import { CategoryInsertType, CategoriesTable } from "../db/schema";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { addCategoryType } from "@/lib/zod/schema";

export const getAllCategories = async () => {
  "use cache";
  cacheLife("brandCategory");
  cacheTag("brandCategory");
  console.log("fetching categories");
  const categories = await db
    .select({
      id: CategoriesTable.id,
      name: CategoriesTable.name,
      createdAt: CategoriesTable.createdAt,
      updatedAt: CategoriesTable.updatedAt,
    })
    .from(CategoriesTable);
  return categories;
};

export const addCategory = async (category: CategoryInsertType) => {
  try {
    await db.insert(CategoriesTable).values(category);
    revalidateTag("brandCategory");
    return { message: "Successfully added category" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};

export const updateCategory = async (category: addCategoryType) => {
  try {
    if (!category.id) {
      return { message: "Operation failed", error: "Category ID not found" };
    }
    await db
      .update(CategoriesTable)
      .set({ name: category.name })
      .where(eq(CategoriesTable.id, category.id));
    revalidateTag("brandCategory");
    return { message: "Successfully updated category" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};

export const deleteCategory = async (id: number) => {
  try {
    await db.delete(CategoriesTable).where(eq(CategoriesTable.id, id));
    revalidateTag("brandCategory");
    return { message: "Successfully deleted category" };
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
};
