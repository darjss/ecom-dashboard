import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const generateOrderNumber = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const nanoId = customAlphabet(alphabet);
  return nanoId(10);
};
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}
export function getDayName(day: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[day % 7] as string;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 font-medium";
    case "pending":
      return "bg-amber-50 text-amber-800 border-amber-200 font-medium";
    case "shipped":
      return "bg-sky-50 text-sky-800 border-sky-200 font-medium";
    case "cancelled":
      return "bg-rose-50 text-rose-800 border-rose-200 font-medium";
    case "refunded":
      return "bg-slate-100 text-slate-800 border-slate-200 font-medium";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200 font-medium";
  }
};
export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-800";
  }
};

export const getPaymentProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case "qpay":
      return "📱";
    case "cash":
      return "💵";
    case "transfer":
      return "🏦";
    default:
      return "💳";
  }
};
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MN", {
    style: "currency",
    currency: "MNT",
  }).format(amount);
}