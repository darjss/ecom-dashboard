import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {  customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const generateOrderNumber = () => {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const nanoId=customAlphabet(alphabet)
    return nanoId(10)
};
