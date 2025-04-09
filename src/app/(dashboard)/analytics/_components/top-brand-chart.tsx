"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopBrandItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";


interface TopBrandsChartProps {
  data: TopBrandItem[];
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
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Bar dataKey="total" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
