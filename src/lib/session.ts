"use server";
import "server-only";

import { UserSelectType } from "@/server/db/schema";
import {
  deleteSession,
  getSession as getDbSession,
  updateSession,
} from "@/server/actions/auth";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { cookies } from "next/headers";
import { Session } from "./types";
import { redis } from "@/server/db";

export async function createSession(token: string, userId: number): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	await redis.set(
		`session:${session.id}`,
		JSON.stringify({
			id: session.id,
			user_id: session.userId,
			expires_at: Math.floor(session.expiresAt.getTime() / 1000)
		}),
		{
			exat: Math.floor(session.expiresAt.getTime() / 1000)
		}
	);
	await redis.sadd(`user_sessions:${userId}`, sessionId);

	return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await getDbSession(sessionId);

  if (result === null) {
    return { session: null, user: null };
  }

  const { session, user } = result;
  const expiresAt = new Date(session.expiresAt);

  if (Date.now() >= expiresAt.getTime()) {
    await deleteSession(sessionId);
    return { session: null, user: null };
  }

  if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 30) {
    const updatedSession = {
      ...session,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await updateSession(updatedSession);
    return { session: updatedSession, user };
  }

  return { session, user };
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

export const auth = async (): Promise<SessionValidationResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value ?? null;

  if (token === null) {
    return { session: null, user: null };
  }

  return await validateSessionToken(token);
};

export type SessionValidationResult =
  | { session: Session; user: UserSelectType }
  | { session: null; user: null };
