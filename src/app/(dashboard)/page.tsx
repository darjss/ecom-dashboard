import { getOrderCount, getPendingOrders } from "@/server/actions/order";
import {
  getAnalytics,
  getMostSoldProducts,
  getOrderCountForWeek,
} from "@/server/actions/sales";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPendingPayments } from "@/server/actions/payment";
import { MetricsGrid } from "./_components/metric-grid";
import TopProductsList from "./_components/top-product-list";
import PendingOrdersList from "./_components/pending-order-list";
import PendingPaymentsList from "./_components/pending-payment-list";
import OrderSalesChart from "./_components/order-sales-chart";

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

  const pendingPayments = await getPendingPayments();

  const newCustomers = { daily: 5, weekly: 18, monthly: 42 };
  const totalVisits = { daily: 120, weekly: 540, monthly: 1254 };
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">
              Loading dashboard...
            </p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 md:py-8">

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          {/* Daily View */}
          <TabsContent value="daily" className="space-y-6">
            <MetricsGrid
              sales={salesDaily}
              orders={dailyOrders.count}
              newCustomers={newCustomers.daily}
              visits={totalVisits.daily}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <TopProductsList
                products={mostSoldProductsDaily.slice(0, 5)}
                period="Today"
              />
              <OrderSalesChart />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Pending Orders */}
              <PendingOrdersList orders={await getPendingOrders()} />

              {/* Pending Payments */}
              <PendingPaymentsList payments={pendingPayments} />
            </div>
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="weekly" className="space-y-6">
            <MetricsGrid
              sales={salesWeekly}
              orders={weeklyOrders.count}
              newCustomers={newCustomers.weekly}
              visits={totalVisits.weekly}
            />

            <div className="grid gap-6 md:grid-cols-3">
              {/* Top Selling Products */}
              <TopProductsList
                products={mostSoldProductsWeekly.slice(0, 5)}
                period="This Week"
              />
              <OrderSalesChart />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Pending Orders */}
              <PendingOrdersList orders={await getPendingOrders()} />

              {/* Pending Payments */}
              <PendingPaymentsList payments={pendingPayments} />
            </div>
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly" className="space-y-6">
            <MetricsGrid
              sales={salesMonthly}
              orders={monthlyOrders.count}
              newCustomers={newCustomers.monthly}
              visits={totalVisits.monthly}
            />

            <div className="grid gap-6 md:grid-cols-3">
              {/* Sales Trend Chart */}

              {/* Top Selling Products */}
              <TopProductsList
                products={mostSoldProductsMonthly.slice(0, 5)}
                period="This Month"
              />
              <OrderSalesChart />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Pending Orders */}
              <PendingOrdersList orders={await getPendingOrders()} />

              {/* Pending Payments */}
              <PendingPaymentsList payments={pendingPayments} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  );
};

export default DashboardHome;
