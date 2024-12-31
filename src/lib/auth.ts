"use server";
import "server-only";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "./session";
import { redirect } from "next/navigation";

export const logout = async () => {
  const { session } = await getCurrentSession();
  if (!session) {
    return;
  }
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
};
