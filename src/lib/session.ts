import { User } from "@/server/db/schema";
import {
  deleteSession,
  getSession,
  insertSession,
  updateSession,
  Session,
} from "@/server/queries";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { cookies } from "next/headers";
import { cache } from "react";

// Helper function to ensure we have a proper Date object
function ensureDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId: userId as number,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await insertSession(session);
  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await getSession(sessionId);
  
  if (result === null) {
    return { session: null, user: null };
  }
  
  const { session, user } = result;
  
  // Convert the expiresAt string to a Date object
  const expiresAt = ensureDate(session.expiresAt);
  
  if (Date.now() >= expiresAt.getTime()) {
    await deleteSession(sessionId);
    return { session: null, user: null };
  }
  
  if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    const updatedSession = {
      ...session,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await updateSession(updatedSession);
    return { session: updatedSession, user };
  }
  
  return { 
    session: {
      ...session,
      expiresAt: expiresAt
    }, 
    user 
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await deleteSession(sessionId);
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value ?? null;
    if (token === null) {
      return { session: null, user: null };
    }
    const result = await validateSessionToken(token);
    return result;
  },
);

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };