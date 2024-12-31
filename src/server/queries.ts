import "server-only";
import { db } from "./db";
import { User, Session, SessionsTable, UsersTable } from "./db/schema";
import { eq } from "drizzle-orm";

export const insertSession = async (session: Session) => {
  return await db.insert(SessionsTable).values(session);
};
export const getSession= async (sessionId: string) => {
    return await db
    .select({ user: UsersTable, session: SessionsTable })
    .from(SessionsTable)
    .innerJoin(UsersTable, eq(SessionsTable.userId, UsersTable.id))
    .where(eq(SessionsTable.id, sessionId));
}
export const deleteSession = async (sessionId: string) => {
  return await db.delete(SessionsTable).where(eq(SessionsTable.id, sessionId));
};
export const updateSession = async (session: Session) => {
  return await db.update(SessionsTable).set(session).where(eq(SessionsTable.id, session.id));
};
export const createUser = async (googleId: string, username: string) => {
  const [user] = await db.insert(UsersTable).values({
    googleId,
    username
  }).returning({
    id: UsersTable.id,
    username: UsersTable.username,
    googleId: UsersTable.googleId,
    createdAt: UsersTable.createdAt,
    updatedAt: UsersTable.updatedAt
  });
  if(user === null || user==undefined) { throw new Error("User not found"); }
  return user;
};
export const getUserFromGoogleId = async (googleId: string) => {
  const result = await db
    .select({ user: UsersTable })
    .from(UsersTable)
    .where(eq(UsersTable.googleId, googleId))
    ;
  if (result.length < 1 || result[0] === undefined) {
    return null;
  }
  return result[0].user as User;
};