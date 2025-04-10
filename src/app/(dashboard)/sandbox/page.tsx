import { Button } from "@/components/ui/button";
import { seedDatabase, seedOnlyOrders } from "@/lib/seed";
import { redisBenchmark } from "@/server/actions/auth";
import { getProductBenchmark } from "@/server/actions/product";
import { Database } from "lucide-react";
import { Suspense } from "react";

const Page = async () => {
  const dbQueryTime = await getProductBenchmark();
  
  const redisQueryTime = await redisBenchmark();
  return (
    <div className="space-y-4">
      <h1>Sandbox page</h1>
      <div className="flex space-x-2">
        <form action={seedDatabase}>
          <Button
            type="submit"
            variant="neutral"
            size="sm"
            className="h-9 sm:h-10"
          >
            <Database className="mr-2 h-4 w-4" />
            Seed Database
          </Button>
        </form>
        <form action={seedOnlyOrders.bind(null, 100)}>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            className="h-9 sm:h-10"
          >
            <Database className="mr-2 h-4 w-4" />
            Seed 100 Orders
          </Button>
        </form>
      </div>
      <Suspense fallback={<p>Loading...</p>}>
        <p>Time to get DB query {dbQueryTime.toFixed(2)} ms</p>
        <p>Time to set redis value {redisQueryTime.set.toFixed(2)} ms</p>
        <p>Time to get redis value {redisQueryTime.get.toFixed(2)} ms</p>
      </Suspense>
    </div>
  );
};
export default Page;
