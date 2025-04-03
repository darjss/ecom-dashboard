"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface SalesByCategoryChartProps {
  data: {
    categoryName: string;
    total: number;
    quantity: number;
  }[];
}

export function SalesByCategoryChart({ data }: SalesByCategoryChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="categoryName" />
            <YAxis />
            <Bar dataKey="total" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
