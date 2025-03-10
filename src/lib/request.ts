import { headers } from "next/headers";
import { TokenBucket } from "./rate-limit";

export const globalBucket = new TokenBucket<string>(100, 1);

export async function globalGETRateLimit(): Promise<boolean> {
  const header = await headers();
  const clientIP = header.get("X-Forwarded-For");
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const header = await headers();
  const clientIP = header.get("X-Forwarded-For");
  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 3);
}
