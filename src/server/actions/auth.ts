"use server";
import "server-only";
import { db } from "../db";
import { UserSelectType, UsersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { Session } from "@/lib/types";
import {
  unstable_cacheLife as cacheLife,
  revalidateTag,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { redis } from "../db/redis";
export const insertSession = async (session: Session) => {
  const sessionToStore = {
    ...session,
    expiresAt: session.expiresAt.toISOString(),
  };
  return await redis.json.set(session.id, "$", sessionToStore);
};

export const getSession = async (sessionId: string) => {
  // "use cache";
  // cacheLife("session");
  // cacheTag("session");
  console.log("Getting session");
  const session = (await redis.json.get(sessionId)) as Session | null;
  if (session === null || session === undefined) {
    return null;
  }

  const result = await db
    .select({ user: UsersTable })
    .from(UsersTable)
    .where(eq(UsersTable.id, session.userId as number))
    .limit(1);

  const user = result[0];
  if (user === null || user === undefined) {
    return null;
  }

  return {
    session: session as Session,
    user: user.user as UserSelectType,
  };
};

export const deleteSession = async (sessionId: string) => {
  revalidateTag("session");
  return await redis.del(sessionId);
};
export const updateSession = async (session: Session) => {
  revalidateTag("session");
  return await redis.set(session.id, JSON.stringify(session));
};
export const createUser = async (googleId: string, username: string, isApproved:boolean=false) => {
  const [user] = await db
    .insert(UsersTable)
    .values({
      googleId,
      username,
      isApproved  
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
