"use server";
import "server-only";
import { db } from "./db";
import { BrandInsertType, BrandsTable, CategoriesTable, CategoryInsertType, UserSelectType, UsersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { redis } from "./db";
import { addProductType } from "@/lib/zod/schema";

export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
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
  console.log("Getting session")
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
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(product);
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

export const addCategory = async (category: CategoryInsertType) => {
  try {
    await db.insert(CategoriesTable).values(category);
  } catch (e) {
    console.log(e);
    return { message: "Operation failed", error: e };
  }
  return { message: "Successfully added product" };
};

export const addBrandsAndCategories = async () => {
  const brands = [
    {
      name: "Nature's Bounty",
      logoUrl: "https://example.com/logos/natures_bounty.png",
    },
    {
      name: "Garden of Life",
      logoUrl: "https://example.com/logos/garden_of_life.png",
    },
    {
      name: "NOW Foods",
      logoUrl: "https://example.com/logos/now_foods.png",
    },
    {
      name: "Solgar",
      logoUrl: "https://example.com/logos/solgar.png",
    },
    {
      name: "Nature Made",
      logoUrl: "https://example.com/logos/nature_made.png",
    },
  ];
  const categories = [
    {
      name: "Multivitamins",
    },
    {
      name: "Vitamin D",
    },
    {
      name: "Vitamin C",
    },
    {
      name: "Omega-3 & Fish Oil",
    },
    {
      name: "Probiotics",
    },
  ];
  const brandPromises = brands.map((brand) => addBrand(brand));
  const categoryPromises = categories.map((category) => addCategory(category));
  Promise.allSettled([...brandPromises, ...categoryPromises]);
  console.log("Success");
};
export const getAllBrands = async () => {
  "use cache"
  const brands = await db
    .select({ id: BrandsTable.id, name: BrandsTable.name })
    .from(BrandsTable);
  return brands;
};

export const getAllCategories = async () => {
  "use cache"
  const categories = await db
    .select({ id: CategoriesTable.id, name: CategoriesTable.name})
    .from(CategoriesTable);
  return categories;
};
export type BrandType = Awaited<ReturnType<typeof getAllBrands>>;
export type CategoryType= Awaited<ReturnType<typeof getAllCategories>>;