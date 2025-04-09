"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

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
        description="Total revenue from all sales"
        color="emerald"
      />
      <MetricCard
        title="Products Sold"
        value={sales.salesCount}
        icon={<Package className="h-4 w-4" />}
        trend={5}
        description="Total number of products sold"
        color="blue"
      />
      <MetricCard
        title="Orders"
        value={orders}
        icon={<ShoppingBag className="h-4 w-4" />}
        trend={-2}
        description="Total number of orders placed"
        color="amber"
      />
      <MetricCard
        title="New Customers"
        value={newCustomers}
        icon={<Users className="h-4 w-4" />}
        trend={8}
        description="New customer registrations"
        color="violet"
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
  description,
  color = "primary",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  isCurrency?: boolean;
  trend?: number;
  description: string;
  color?: "primary" | "emerald" | "blue" | "amber" | "violet" | "rose";
}) => {
  const formattedValue = isCurrency
    ? formatCurrency(value)
    : value.toLocaleString();

  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  };

  const trendColorClasses = trend > 0 ? "text-emerald-500" : "text-rose-500";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
                <div className={`rounded-full p-1.5 ${colorClasses[color]}`}>
                  {icon}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{formattedValue}</p>
                {trend !== 0 && (
                  <div className="mt-1 flex items-center text-xs">
                    {trend > 0 ? (
                      <div className={`flex items-center ${trendColorClasses}`}>
                        <TrendingUp className="mr-1 h-3 w-3" />
                        <span>{trend}% from previous period</span>
                      </div>
                    ) : (
                      <div className={`flex items-center ${trendColorClasses}`}>
                        <ArrowDown className="mr-1 h-3 w-3" />
                        <span>{Math.abs(trend)}% from previous period</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
