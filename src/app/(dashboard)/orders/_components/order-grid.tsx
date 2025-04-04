"use client";

import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, PlusCircle, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Suspense, useState } from "react";

import { getPaginatedOrders, searchOrder } from "@/server/actions/order";
import { orderStatus, paymentStatus, PRODUCT_PER_PAGE } from "@/lib/constants";
import type {
  OrderStatusType,
  OrderType,
  PaymentStatusType,
} from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataPagination } from "@/components/data-pagination";
import SubmitButton from "@/components/submit-button";
import OrderCard from "./order-card";
import OrderSkeleton from "./order-skeleton";

// This component handles the data fetching with suspense
const OrderList = ({
  page,
  searchTerm,
  orderStatusFilter,
  paymentStatusFilter,
  sortField,
  sortDirection,
  onPageChange,
}: {
  page: number;
  searchTerm: string;
  orderStatusFilter: string | null;
  paymentStatusFilter: string | null;
  sortField: string;
  sortDirection: string;
  onPageChange: (page: number) => void;
}) => {
  const { data } = useSuspenseQuery({
    queryKey: [
      "orders",
      page,
      orderStatusFilter,
      paymentStatusFilter,
      sortField,
      sortDirection,
      searchTerm,
    ],
    queryFn: async () => {
      if (searchTerm) {
        const searchResult = await searchOrder(searchTerm);
        if ("message" in searchResult && "error" in searchResult) {
          throw new Error(`Error fetching orders: ${searchResult.error}`);
        }

        if (!Array.isArray(searchResult)) {
          return {
            orders: [] as OrderType[],
            total: 0,
          };
        }

        return {
          orders: searchResult as OrderType[],
          total: searchResult.length || 0,
        };
      }

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
    staleTime: 1000 * 60 * 5,
    
  });

  if (!data || data.orders.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {searchTerm
          ? `No orders found matching "${searchTerm}"`
          : "No orders found"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.orders.map((order: OrderType) => (
          <OrderCard key={order.orderNumber} order={order} />
        ))}
      </div>

      {data.total > 0 && (
        <div className="space-y-4">
          <DataPagination
            currentPage={page}
            totalItems={data.total}
            itemsPerPage={PRODUCT_PER_PAGE}
            onPageChange={onPageChange}  
          />
        </div>
      )}
    </>
  );
};

// Loading fallback for Suspense
const OrderListFallback = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <OrderSkeleton key={index*100} />
      ))}
    </div>
  );
};

const OrderGrid = () => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortField, setSortField] = useQueryState("sort", {
    defaultValue: "",
  });
  const [sortDirection, setSortDirection] = useQueryState("dir", {
    defaultValue: "asc",
  });
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useQueryState("query", {
    defaultValue: "",
  });
  const [orderStatusFilter, setOrderStatusFilter] = useQueryState("status");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useQueryState("payment");
  const [isFetching, setIsFetching] = useState(false);

  async function handleSearch() {
    setIsFetching(true);
    await setSearchTerm(inputValue);
    await setPage(1);
    setIsFetching(false);
  }

  async function clearSearch() {
    setIsFetching(true);
    setInputValue("");
    await setSearchTerm("");
    await setPage(1);
    setIsFetching(false);
  }

  async function handlePageChange(newPage: number) {
    setIsFetching(true);
    await setPage(newPage);
    setIsFetching(false);
  }

  async function handleFilterChange(type: "status" | "payment", value: string) {
    setIsFetching(true);
    if (type === "status") await setOrderStatusFilter(value);
    else await setPaymentStatusFilter(value);
    await setPage(1);
    setIsFetching(false);
  }

  async function resetFilters() {
    setIsFetching(true);
    await setOrderStatusFilter(null);
    await setPaymentStatusFilter(null);
    await setPage(1);
    setIsFetching(false);
  }

  const handleSort = async (field: string) => {
    setIsFetching(true);
    if (sortField === field) {
      await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      await setSortField(field);
      await setSortDirection("asc");
    }
    await setPage(1);
    setIsFetching(false);
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 pb-20 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search order number..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-9"
                disabled={isFetching}
              />
              <SubmitButton
                onClick={handleSearch}
                isPending={isFetching}
                className="h-9 w-9 shrink-0 p-0"
              >
                <Search className="h-4 w-4" />
              </SubmitButton>
              {searchTerm && (
                <SubmitButton
                  onClick={clearSearch}
                  isPending={isFetching}
                  className="h-9 w-9 shrink-0 p-0"
                  variant="destructive"
                >
                  <X className="h-4 w-4 text-black" />
                </SubmitButton>
              )}
            </div>
            <Link href="/orders/add">
              <Button
                size="sm"
                className="h-9 w-full sm:w-auto"
                disabled={isFetching}
              >
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
                disabled={isFetching}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {orderStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={paymentStatusFilter || undefined}
                onValueChange={(value) => handleFilterChange("payment", value)}
                disabled={isFetching}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {paymentStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(orderStatusFilter || paymentStatusFilter) && (
                <Button
                  variant="reverse"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9"
                  disabled={isFetching}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex gap-2 sm:ml-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("total")}
                className="h-9 px-3"
                disabled={isFetching}
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
                disabled={isFetching}
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

        {searchTerm && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span>
              Search results for:{" "}
              <span className="font-medium text-primary">{searchTerm}</span>
            </span>
          </div>
        )}

        <Suspense fallback={<OrderListFallback />}>
          <OrderList
            page={page}
            searchTerm={searchTerm}
            orderStatusFilter={orderStatusFilter}
            paymentStatusFilter={paymentStatusFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            onPageChange={handlePageChange}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default OrderGrid;
