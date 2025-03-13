import type React from "react";
import { getOrderCount } from "@/server/actions/order";
import { getAnalytics, getMostSoldProducts } from "@/server/actions/sales";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const Page = async () => {
  // Fetch all data
  const salesDaily = await getAnalytics("daily");
  const salesWeekly = await getAnalytics("weekly");
  const salesMonthly = await getAnalytics("monthly");

  const mostSoldProductsDaily = await getMostSoldProducts("daily");
  const mostSoldProductsWeekly = await getMostSoldProducts("weekly");
  const mostSoldProductsMonthly = await getMostSoldProducts("monthly");

  const dailyOrders = await getOrderCount("daily");
  const weeklyOrders = await getOrderCount("weekly");
  const monthlyOrders = await getOrderCount("monthly");

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading analytics data...
        </div>
      }
    >
      <div className="container mx-auto space-y-8 p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your sales, products, and orders performance.
          </p>
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          {/* Daily View */}
          <TabsContent value="daily" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Sales"
                value={salesDaily.sum}
                description={`${salesDaily.salesCount} transactions`}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="Profit"
                value={salesDaily.profit}
                description="Net earnings"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                trend="up"
              />
              <StatsCard
                title="Orders"
                value={dailyOrders.count}
                description="Total orders processed"
                icon={
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                }
              />
              <StatsCard
                title="Avg. Order Value"
                value={
                  salesDaily.salesCount > 0
                    ? salesDaily.sum / salesDaily.salesCount
                    : 0
                }
                description="Per transaction"
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <ProductsGrid
              title="Top Selling Products"
              products={mostSoldProductsDaily}
            />
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="weekly" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Sales"
                value={salesWeekly.sum}
                description={`${salesWeekly.salesCount} transactions`}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="Profit"
                value={salesWeekly.profit}
                description="Net earnings"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                trend="up"
              />
              <StatsCard
                title="Orders"
                value={weeklyOrders.count}
                description="Total orders processed"
                icon={
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                }
              />
              <StatsCard
                title="Avg. Order Value"
                value={
                  salesWeekly.salesCount > 0
                    ? salesWeekly.sum / salesWeekly.salesCount
                    : 0
                }
                description="Per transaction"
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <ProductsGrid
              title="Top Selling Products"
              products={mostSoldProductsWeekly}
            />
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Sales"
                value={salesMonthly.sum}
                description={`${salesMonthly.salesCount} transactions`}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="Profit"
                value={salesMonthly.profit}
                description="Net earnings"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                trend="up"
              />
              <StatsCard
                title="Orders"
                value={monthlyOrders.count}
                description="Total orders processed"
                icon={
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                }
              />
              <StatsCard
                title="Avg. Order Value"
                value={
                  salesMonthly.salesCount > 0
                    ? salesMonthly.sum / salesMonthly.salesCount
                    : 0
                }
                description="Per transaction"
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <ProductsGrid
              title="Top Selling Products"
              products={mostSoldProductsMonthly}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  );
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
}) => {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₮ {value}</div>
        <div className="mt-1 flex items-center">
          {trend && (
            <span
              className={`mr-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}
            >
              {trend === "up" ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Products Grid Component
const ProductsGrid = ({
  title,
  products,
}: {
  title: string;
  products: Array<{
    productId: number;
    name: string | null;
    imageUrl: string | null;
    totalSold: number;
  }>;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Products with highest sales volume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.productId}
              className="flex items-center space-x-4 rounded-md border p-4"
            >
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-muted">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name || "Product"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-none">
                  {product.name || "Unnamed Product"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product.totalSold} sold
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Page;
