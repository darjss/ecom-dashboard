import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingBag, Users } from "lucide-react";

export const MetricsGrid = ({
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <MetricCard
        title="Revenue"
        value={sales.sum}
        icon={<DollarSign className="h-4 w-4" />}
        isCurrency
        trend={10}
      />
      <MetricCard
        title="Products Sold"
        value={sales.salesCount}
        icon={<Package className="h-4 w-4" />}
        trend={5}
      />
      <MetricCard
        title="Orders"
        value={orders}
        icon={<ShoppingBag className="h-4 w-4" />}
        trend={-2}
      />
      <MetricCard
        title="New Customers"
        value={newCustomers}
        icon={<Users className="h-4 w-4" />}
        trend={8}
      />
    </div>
  );
};

// Enhanced Metric Card Component
const MetricCard = ({
  title,
  value,
  icon,
  isCurrency = false,
  trend = 0,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  isCurrency?: boolean;
  trend?: number;
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
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="rounded-full bg-primary/10 p-1.5">{icon}</div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{formattedValue}</p>
          {trend !== 0 && (
            <div className="mt-1 flex items-center text-xs">
              {trend > 0 ? (
                <div className="flex items-center text-emerald-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  <span>{trend}% from previous period</span>
                </div>
              ) : (
                <div className="flex items-center text-rose-500">
                  <ArrowDown className="mr-1 h-3 w-3" />
                  <span>{Math.abs(trend)}% from previous period</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
