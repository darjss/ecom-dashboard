import {Redis} from "@upstash/redis";
export let redis: Redis;

if (process.env.NODE_ENV === "development") {
  redis = new Redis({
    url:  "http://localhost:6379", // Default local URL
    token: "", // Empty token if no auth
  });
} else {
  redis = Redis.fromEnv(); // Use Upstash Redis in other environments (production)
}
