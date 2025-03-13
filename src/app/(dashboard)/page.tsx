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
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

const DashboardHome = async () => {
  // Fetch all data for different time periods
  const salesDaily = await getAnalytics("daily");
  const salesWeekly = await getAnalytics("weekly");
  const salesMonthly = await getAnalytics("monthly");

  const mostSoldProductsDaily = await getMostSoldProducts("daily");
  const mostSoldProductsWeekly = await getMostSoldProducts("weekly");
  const mostSoldProductsMonthly = await getMostSoldProducts("monthly");

  const dailyOrders = await getOrderCount("daily");
  const weeklyOrders = await getOrderCount("weekly");
  const monthlyOrders = await getOrderCount("monthly");

  // Placeholder data for future metrics and pending orders
  const newCustomers = { daily: 5, weekly: 18, monthly: 42 };
  const pendingOrders = [
    {
      id: "ORD-1234",
      customer: "Jane Cooper",
      date: "2 mins ago",
      amount: 125.0,
      status: "Processing",
    },
    {
      id: "ORD-1235",
      customer: "Wade Warren",
      date: "25 mins ago",
      amount: 79.99,
      status: "Payment pending",
    },
    {
      id: "ORD-1236",
      customer: "Esther Howard",
      date: "3 hours ago",
      amount: 249.95,
      status: "Processing",
    },
    {
      id: "ORD-1237",
      customer: "Cameron Williamson",
      date: "5 hours ago",
      amount: 39.99,
      status: "Payment pending",
    },
    {
      id: "ORD-1238",
      customer: "Brooklyn Simmons",
      date: "Yesterday",
      amount: 89.95,
      status: "Processing",
    },
  ];
  const totalVisits = { daily: 120, weekly: 540, monthly: 1254 };

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading dashboard...
        </div>
      }
    >
      <div className="container mx-auto space-y-4 px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Your store performance at a glance
          </p>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="grid h-9 w-full max-w-md grid-cols-3 md:h-10">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          {/* Daily View */}
          <TabsContent value="daily" className="space-y-4">
            <MetricsGrid
              sales={salesDaily}
              orders={dailyOrders.count}
              newCustomers={newCustomers.daily}
              visits={totalVisits.daily}
            />

            <div className="grid gap-3 md:grid-cols-3 md:gap-4">
              {/* Sales Trend Chart */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Today's Sales</CardTitle>
                  <CardDescription>Hourly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted/30 md:h-64">
                    <p className="text-sm text-muted-foreground">
                      Sales trend chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <TopProductsList
                products={mostSoldProductsDaily.slice(0, 5)}
                period="Today"
              />
            </div>

            {/* Pending Orders */}
            <PendingOrdersList orders={pendingOrders} />
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="weekly" className="space-y-4">
            <MetricsGrid
              sales={salesWeekly}
              orders={weeklyOrders.count}
              newCustomers={newCustomers.weekly}
              visits={totalVisits.weekly}
            />

            <div className="grid gap-3 md:grid-cols-3 md:gap-4">
              {/* Sales Trend Chart */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">This Week's Sales</CardTitle>
                  <CardDescription>Daily revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted/30 md:h-64">
                    <p className="text-sm text-muted-foreground">
                      Sales trend chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <TopProductsList
                products={mostSoldProductsWeekly.slice(0, 5)}
                period="This Week"
              />
            </div>

            {/* Pending Orders */}
            <PendingOrdersList orders={pendingOrders} />
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly" className="space-y-4">
            <MetricsGrid
              sales={salesMonthly}
              orders={monthlyOrders.count}
              newCustomers={newCustomers.monthly}
              visits={totalVisits.monthly}
            />

            <div className="grid gap-3 md:grid-cols-3 md:gap-4">
              {/* Sales Trend Chart */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    This Month's Sales
                  </CardTitle>
                  <CardDescription>Daily revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted/30 md:h-64">
                    <p className="text-sm text-muted-foreground">
                      Sales trend chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <TopProductsList
                products={mostSoldProductsMonthly.slice(0, 5)}
                period="This Month"
              />
            </div>

            {/* Pending Orders */}
            <PendingOrdersList orders={pendingOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  );
};

// Metrics Grid Component
const MetricsGrid = ({
  sales,
  orders,
  newCustomers,
  visits,
}: {
  sales: { sum: number; profit: number; salesCount: number };
  orders: number;
  newCustomers: number;
  visits: number;
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <MetricCard
        title="Revenue"
        value={sales.sum}
        icon={<DollarSign className="h-3 w-3 md:h-4 md:w-4" />}
        isCurrency
      />
      <MetricCard
        title="Products Sold"
        value={sales.salesCount}
        icon={<Package className="h-3 w-3 md:h-4 md:w-4" />}
      />
      <MetricCard
        title="Orders"
        value={orders}
        icon={<ShoppingBag className="h-3 w-3 md:h-4 md:w-4 " />}
      />
      <MetricCard
        title="New Customers"
        value={newCustomers}
        icon={<Users className="h-3 w-3 md:h-4 md:w-4" />}
      />
    </div>
  );
};

// Small Metric Card Component
const MetricCard = ({
  title,
  value,
  icon,
  isCurrency = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  isCurrency?: boolean;
}) => {
  const formattedValue = isCurrency
    ? value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
    : value.toLocaleString();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground md:text-sm">
            {title}
          </p>
          <div className="rounded-full bg-primary/10 p-1">{icon}</div>
        </div>
        <div className="mt-1 md:mt-2">
          <p className="text-lg font-bold md:text-2xl">{formattedValue}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Top Products List Component
const TopProductsList = ({
  products,
  period,
}: {
  products: Array<{
    productId: number;
    name: string | null;
    imageUrl: string | null;
    totalSold: number;
  }>;
  period: string;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Products</CardTitle>
        <CardDescription>Best sellers {period.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <ScrollArea className="h-48 px-2 md:h-64">
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.productId}
                className="flex items-center rounded-lg p-2 hover:bg-muted/50"
              >
                <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product.name || "Unnamed Product"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.totalSold} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Pending Orders List Component
const PendingOrdersList = ({
  orders,
}: {
  orders: Array<{
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: string;
  }>;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Pending Orders</CardTitle>
            <CardDescription>
              Orders awaiting processing or payment
            </CardDescription>
          </div>
          <Badge variant="neutral" className="ml-auto">
            {orders.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                    {order.customer
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{order.id}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">
                      {order.customer}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      {order.date}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {order.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
                <Badge
                  variant={
                    order.status === "Processing" ? "default" : "neutral"
                  }
                  className="text-xs"
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHome;
