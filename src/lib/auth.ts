"use server";
import "server-only";
import {
  auth,
  deleteSessionTokenCookie,
  invalidateSession,
} from "./session";
import { redirect } from "next/navigation";

export const logout = async () => {
  const { session } = await auth();
  if (!session) {
    return;
  }
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
};
