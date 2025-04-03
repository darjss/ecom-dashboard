// app/dashboard/analytics/page.tsx
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IndianRupee, Users, Package, AlertCircle, Banknote, DollarSign } from "lucide-react";
import { getAnalyticsData } from "@/server/actions/analytics";
import { StatsCard } from "./_components/stats-card";
import { formatCurrency } from "@/lib/utils";
import { TopBrandsChart } from "./_components/top-brand-chart";
import { LowInventoryTable } from "./_components/low-inventory-table";
import { M } from "node_modules/@upstash/redis/zmscore-BdNsMd17.mjs";
import LoadingScreen from "@/components/loading-screen";

async function AnalyticsPage() {
  const [analytics ]= await Promise.all([
    getAnalyticsData("monthly"),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Average Order Value"
          value={formatCurrency(analytics.averageOrderValue)}
          icon={<Banknote className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(analytics.totalProfit)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Repeat Customers"
          value={analytics.repeatCustomers}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Customer Lifetime Value"
          value={formatCurrency(analytics.customerLifetimeValue)}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <TopBrandsChart data={analytics.topBrands} />
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Failed Payments</CardTitle>
            <CardDescription>
              Total failed payments in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold">
                {analytics.failedPayments.count}
              </span>
              <span className="text-muted-foreground">
                ({formatCurrency(analytics.failedPayments.total)})
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Inventory Products</CardTitle>
          <CardDescription>
            Products that are out of stock or running low
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LowInventoryTable data={analytics.lowInventoryProducts} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnalyticsPage />
    </Suspense>
  );
}
