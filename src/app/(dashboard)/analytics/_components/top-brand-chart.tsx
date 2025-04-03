"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface TopBrandData {
  brandName: string;
  total: number;
  quantity: number;
}

interface TopBrandsChartProps {
  data: TopBrandData[];
}

export function TopBrandsChart({ data }: TopBrandsChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Top 5 Brands by Sales</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="brandName" />
            <YAxis />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(value as number)
              }
            />
            <Bar dataKey="total" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
