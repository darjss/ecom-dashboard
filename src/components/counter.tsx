import { redis } from "@/server/db";

const Counter = async () => {
    const count= await redis.incr("counter");
  return (
    <div>
      <h1>Counter: {count}</h1>
    </div>
  );
};
export default Counter;