import { createSession, setSessionTokenCookie } from "@/lib/session";
import { google } from "@/lib/oauth";
import { cookies } from "next/headers";
import { decodeIdToken } from "arctic";

import type { OAuth2Tokens } from "arctic";
import { createUser, getUserFromGoogleId } from "@/server/actions/auth";
import { create } from "domain";
import { generateSessionToken } from "@/lib/utils";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    return new Response(null, {
      status: 400,
    });
  }
  const claims = decodeIdToken(tokens.idToken()) as {
    sub: string;
    name: string;
  };
  const googleUserId = claims.sub;
  const username = claims.name;

  const existingUser = await getUserFromGoogleId(googleUserId);

  if (existingUser !== null && existingUser.isApproved === true) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  if (googleUserId == "118271302696111351988") {
    const user = await createUser(googleUserId, username, true);
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  if (existingUser === null || existingUser.isApproved === false) {
    return new Response(null, {
      status: 400,
    });
  }

  await createUser(googleUserId, username);

  return new Response(null, {
    status: 400,
    headers: {
      Location: "/",
    },
  });
}
