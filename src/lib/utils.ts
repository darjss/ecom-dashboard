import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {  customAlphabet } from "nanoid";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const generateOrderNumber = () => {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const nanoId=customAlphabet(alphabet)
    return nanoId(10)
};
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}
