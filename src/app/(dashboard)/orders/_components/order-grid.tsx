"use client";

import { useState } from "react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, PlusCircle, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getPaginatedOrders,
  searchOrderByNumber,
} from "@/server/actions/order";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { useAction } from "@/hooks/use-action";
import type {
  OrderStatusType,
  OrderType,
  PaymentStatusType,
} from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { DataPagination } from "@/components/data-pagination";
import SubmitButton from "@/components/submit-button";
import OrderCard from "./order-card";

const OrderGrid = ({
  initialOrders,
  initialTotalOrder,
}: {
  initialOrders: OrderType[];
  initialTotalOrder: number;
}) => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortField, setSortField] = useQueryState("sort", {
    defaultValue: "",
  });
  const [sortDirection, setSortDirection] = useQueryState("dir", {
    defaultValue: "asc",
  });
  const [searchTerm, setSearchTerm] = useQueryState("query", {
    defaultValue: "",
  });
  const [orderStatusFilter, setOrderStatusFilter] = useQueryState("status");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useQueryState("payment");
  const [searchAction, isSearchPending] = useAction(searchOrderByNumber);

  const { data, isLoading } = useQuery(
    [
      "orders" +
        page +
        orderStatusFilter +
        paymentStatusFilter +
        sortField +
        sortDirection,
    ],
    async () => {
      const result = await getPaginatedOrders(
        page,
        PRODUCT_PER_PAGE,
        paymentStatusFilter === null
          ? undefined
          : (paymentStatusFilter as PaymentStatusType),
        orderStatusFilter === null
          ? undefined
          : (orderStatusFilter as OrderStatusType),
        sortField || undefined,
        sortDirection as "asc" | "desc",
      );

      // Ensure we have the right shape of data
      if ("message" in result && "error" in result) {
        throw new Error(`Error fetching orders: ${result.error}`);
      }

      if (!Array.isArray(result.orders)) {
        return {
          orders: [] as OrderType[],
          total: 0,
        };
      }

      return {
        orders: result.orders as OrderType[],
        total: result.total || 0,
      };
    },
    {
      initialData: {
        orders: initialOrders,
        total: initialTotalOrder,
      },
    },
  );

  if (!data) throw new Error("Orders Not Found");

  const { orders, total } = data;

  async function handlePageChange(newPage: number) {
    await setPage(newPage);
  }

  async function handleFilterChange(type: "status" | "payment", value: string) {
    if (type === "status") await setOrderStatusFilter(value);
    else await setPaymentStatusFilter(value);
    await setPage(1);
  }

  const handleSort = async (field: string) => {
    if (sortField === field) {
      await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      await setSortField(field);
      await setSortDirection("asc");
    }
    await setPage(1);
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 pb-20 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
              <SubmitButton
                onClick={async () => await searchAction(searchTerm)}
                isPending={isSearchPending}
                className="h-9 w-9 shrink-0 p-0"
              >
                <Search className="h-4 w-4" />
              </SubmitButton>
            </div>
            <Link href="/orders/add">
              <Button size="sm" className="h-9 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              <Select
                value={orderStatusFilter || undefined}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={paymentStatusFilter || undefined}
                onValueChange={(value) => handleFilterChange("payment", value)}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 sm:ml-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("total")}
                className="h-9 px-3"
              >
                Total{" "}
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "total" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("createdAt")}
                className="h-9 px-3"
              >
                Date{" "}
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "createdAt" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-row">
                    <div className="w-full flex-1 space-y-2 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted/50" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted/50" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-5 w-16 animate-pulse rounded bg-muted/50" />
                        <div className="h-7 w-24 animate-pulse rounded bg-muted/50" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: OrderType) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <div className="space-y-4">
          <DataPagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={PRODUCT_PER_PAGE}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderGrid;
