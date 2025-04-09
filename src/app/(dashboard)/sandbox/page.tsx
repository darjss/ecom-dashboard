import { Button } from "@/components/ui/button";
import { seedDatabase, seedOnlyOrders } from "@/lib/seed";
import { getProductBenchmark } from "@/server/actions/product";
import { Database } from "lucide-react";
import { Suspense } from "react";

const Page = async () => {
  const dbQueryTime = await getProductBenchmark();
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
      <Suspense>
        <p>Time to get DB query {dbQueryTime.toFixed(2)} ms</p>
      </Suspense>
    </div>
  );
};
export default Page;
