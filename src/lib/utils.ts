import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addProductType } from "./zod/schema"
import { getAllBrands } from "@/server/queries"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
