import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/lib/seed";
import { getProductBenchmark } from "@/server/actions/product";
import { Database } from "lucide-react";
import { Suspense } from "react";

const Page = async () => {
  const dbQueryTime = await getProductBenchmark();
  return (
    <div>
      <h1>Sandbox page</h1>
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
      <Suspense>
        <p>Time to get DB query {dbQueryTime.toFixed(2)} ms</p>
      </Suspense>
    </div>
  );
};
export default Page;
