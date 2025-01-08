import { UserSelectType } from "@/server/db/schema";
import {
  deleteSession,
  getSession as getDbSession,
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

// Cache configuration
const CACHE_CONFIG = {
  maxSize: 10000,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  maxAge: 30 * 60 * 1000, // 30 minutes
} as const;

// Types
interface CachedSession {
  session: Session;
  user: UserSelectType;
  lastAccessed: number;
}

type SessionCache = Map<string, CachedSession>;

// Create a single cache instance
const sessionCache: SessionCache = new Map();

// Cache management functions
function cleanupCache() {
  const now = Date.now();
  for (const [sessionId, cachedSession] of sessionCache.entries()) {
    if (now - cachedSession.lastAccessed > CACHE_CONFIG.maxAge) {
      sessionCache.delete(sessionId);
    }
  }
}

// Start the cleanup interval
setInterval(cleanupCache, CACHE_CONFIG.cleanupInterval);

function setCacheEntry(sessionId: string, session: Session, user: UserSelectType): void {
  // Ensure we don't exceed maximum cache size
  if (sessionCache.size >= CACHE_CONFIG.maxSize) {
    // Find and remove oldest entry
    let oldestTime = Date.now();
    let oldestKey = '';
    
    for (const [key, value] of sessionCache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      sessionCache.delete(oldestKey);
    }
  }

  sessionCache.set(sessionId, {
    session,
    user,
    lastAccessed: Date.now(),
  });
}

function getCacheEntry(sessionId: string): CachedSession | undefined {
  const cachedSession = sessionCache.get(sessionId);
  if (cachedSession) {
    // Update last accessed time
    setCacheEntry(sessionId, cachedSession.session, cachedSession.user);
  }
  return cachedSession;
}

function deleteCacheEntry(sessionId: string): void {
  sessionCache.delete(sessionId);
}

// Helper function to ensure we have a proper Date object
function ensureDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
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
  let result: { session: Session; user: UserSelectType } | null;
  
  // Try to get from cache first
  const cachedSession = getCacheEntry(sessionId);
  if (cachedSession) {
    result = {
      session: cachedSession.session,
      user: cachedSession.user,
    };
  } else {
    // If not in cache, get from database
    result = await getDbSession(sessionId);
    if (result) {
      setCacheEntry(sessionId, result.session, result.user);
    }
  }

  if (result === null) {
    return { session: null, user: null };
  }

  const { session, user } = result;
  const expiresAt = ensureDate(session.expiresAt);

  if (Date.now() >= expiresAt.getTime()) {
    await deleteSession(sessionId);
    deleteCacheEntry(sessionId);
    return { session: null, user: null };
  }

  // Refresh session if it's close to expiring
  if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    const updatedSession = {
      ...session,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await updateSession(updatedSession);
    setCacheEntry(sessionId, updatedSession, user);
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
  deleteCacheEntry(sessionId);
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
    const token = (await cookieStore.get("session"))?.value ?? null;
    
    if (token === null) {
      return { session: null, user: null };
    }
    
    return await validateSessionToken(token);
  },
);

export type SessionValidationResult =
  | { session: Session; user: UserSelectType }
  | { session: null; user: null };