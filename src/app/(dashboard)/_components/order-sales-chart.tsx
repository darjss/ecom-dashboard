"use client";
import {
  CardContent
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getOrderCountForWeek } from "@/server/actions/sales";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { max } from "lodash";

const OrderSalesChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["weeklyOrderSales"],
    queryFn: getOrderCountForWeek,
  });

  if (isLoading) {
    return (
      <CardContent className="px-0 pb-0">
        <div className="flex h-[300px] items-center justify-center">
          <Skeleton className="h-[280px] w-full" />
        </div>
      </CardContent>
    );
  }

  if (isError) {
    return (
      <CardContent className="px-0 pb-0">
        <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Failed to load chart data</h3>
          <p className="text-sm text-muted-foreground">
            There was an error loading the sales data. Please try again later.
          </p>
        </div>
      </CardContent>
    );
  }
  if(data===undefined){
    return <div>Loading...</div>
  }
  const chartData = [...data].reverse();

  const average =
    chartData.reduce((sum, item) => sum + item.orderCount, 0) /
    chartData.length;

  const maxValue = Math.max(...chartData.map((item) => item.orderCount));
  console.log(maxValue);

  return (
    <CardContent className="px-0 pb-0">
      <div className="mb-4 flex items-center justify-between px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Average orders</p>
              <p className="text-2xl font-bold">{average.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <ArrowUpRight className="h-3 w-3" />
          <span>12% increase</span>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#888"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#888", strokeOpacity: 0.2 }}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={[0, maxValue ]}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              formatter={(value) => [`${value} orders`, "Orders"]}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            />
            <ReferenceLine
              y={average}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
              label={{
                value: "Average",
                position: "insideTopRight",
                fill: "hsl(var(--primary))",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="orderCount"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              barSize={40}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  );
};

export default OrderSalesChart;
