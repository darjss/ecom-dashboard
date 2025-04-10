"use client";

import Link from "next/link";
import { parseAsString, useQueryState, createParser, parseAsJson } from "nuqs";
import { Search, PlusCircle, ArrowUpDown, X, RotateCcw } from "lucide-react";
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
import { Suspense, useState, useCallback, useEffect } from "react";

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

// Define cursor type - Must match the one in page.tsx exactly
type OrderCursor = {
  id: number;
  total?: number;
  createdAt?: Date | string;
} | null;

// Client-side parser for OrderCursor - must match server-side
const parseAsCursor = createParser({
  parse: (value: string) => {
    if (!value || value === "null") return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed === null) return null;
      if (typeof parsed !== "object") return null;
      if (!("id" in parsed) || typeof parsed.id !== "number") return null;
      // Ensure createdAt is handled if needed, potentially converting string to Date
      return parsed as OrderCursor;
    } catch {
      return null;
    }
  },
  serialize: (value: OrderCursor): string => {
    // Convert Date to string if present before stringifying if necessary,
    // or ensure the backend handles Date objects if they are passed.
    // Simple stringify might be sufficient if types align.
    return JSON.stringify(value);
  },
});

// This component handles the data fetching and display logic
const OrderList = ({
  searchTerm,
  orderStatusFilter,
  paymentStatusFilter,
  sortField,
  sortDirection,
  currentCursor,
  handleNextPage,
  handlePreviousPage,
  hasPreviousPage,
}: {
  searchTerm: string;
  orderStatusFilter: string | null;
  paymentStatusFilter: string | null;
  sortField: string;
  sortDirection: string;
  currentCursor: OrderCursor;
  handleNextPage: (nextCursor: OrderCursor) => void;
  handlePreviousPage: () => void;
  hasPreviousPage: boolean;
}) => {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: [
      "orders",
      orderStatusFilter,
      paymentStatusFilter,
      sortField,
      sortDirection,
      searchTerm,
      currentCursor,
    ],
    staleTime: 1 * 60 * 1000,
    queryFn: async () => {
      if (searchTerm) {
        const searchResult = await searchOrder(searchTerm);
        if ("message" in searchResult && "error" in searchResult) {
          throw new Error(`Error fetching orders: ${searchResult.error}`);
        }
        return {
          orders: (searchResult as OrderType[]) ?? [],
          nextCursor: null,
        };
      }

      const result = await getPaginatedOrders(
        PRODUCT_PER_PAGE,
        paymentStatusFilter === null
          ? undefined
          : (paymentStatusFilter as PaymentStatusType),
        orderStatusFilter === null
          ? undefined
          : (orderStatusFilter as OrderStatusType),
        sortField || undefined,
        sortDirection as "asc" | "desc",
        currentCursor,
      );

      if ("message" in result && "error" in result) {
        throw new Error(`Error fetching orders: ${result.error}`);
      }

      return {
        orders: result.orders as OrderType[],
        nextCursor: result.nextCursor,
      };
    },
  });

  const hasNextPage = !!data?.nextCursor;

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

      <div className="mt-6">
        <DataPagination
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={() => handleNextPage(data.nextCursor)}
          onPreviousPage={handlePreviousPage}
          isLoading={isFetching}
        />
      </div>
    </>
  );
};

// Loading fallback remains the same
const OrderListFallback = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: PRODUCT_PER_PAGE }).map((_, index) => (
        <OrderSkeleton key={index * 100} />
      ))}
    </div>
  );
};

const OrderGrid = () => {
  // Use nuqs for URL state management
  const [sortField, setSortField] = useQueryState(
    "sort",
    parseAsString.withDefault(""),
  );
  const [sortDirection, setSortDirection] = useQueryState(
    "dir",
    parseAsString.withDefault("asc"),
  );
  const [searchTerm, setSearchTerm] = useQueryState(
    "query",
    parseAsString.withDefault(""),
  );
  const [orderStatusFilter, setOrderStatusFilter] = useQueryState("status");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useQueryState("payment");

  // Use the custom cursor parser with nuqs
  const [rawCursor, setCurrentCursor] = useQueryState("cursor", parseAsCursor);
  const currentCursor = rawCursor === undefined ? null : rawCursor;

  // Local state for search input value
  const [inputValue, setInputValue] = useState(searchTerm);

  // Local state for cursor history (not in URL)
  const [cursorHistory, setCursorHistory] = useState<OrderCursor[]>([]);

  // Local state for UI loading indicators (separate from Suspense)
  const [isFetching, setIsFetching] = useState(false);

  // Function to reset pagination state
  const resetPagination = useCallback(() => {
    setCurrentCursor(null);
    setCursorHistory([]);
  }, [setCurrentCursor]);

  // Event handlers using nuqs setters
  const handleSearch = useCallback(async () => {
    // Only update searchTerm if inputValue actually changed
    if (inputValue.trim() === searchTerm) return;
    setIsFetching(true);
    await setSearchTerm(inputValue.trim()); // Set URL state from input
    resetPagination();
    setIsFetching(false);
    // No need to setInputValue here, it's already the source
  }, [inputValue, searchTerm, setSearchTerm, resetPagination]);

  const clearSearch = useCallback(async () => {
    setIsFetching(true);
    await setSearchTerm(null); // Clear URL state
    setInputValue(""); // Clear local input state
    resetPagination();
    setIsFetching(false);
  }, [setSearchTerm, resetPagination]);

  const handleFilterChange = useCallback(
    async (type: "status" | "payment", value: string | null) => {
      setIsFetching(true);
      if (type === "status") {
        await setOrderStatusFilter(value);
      } else {
        await setPaymentStatusFilter(value);
      }
      resetPagination();
      setIsFetching(false);
    },
    [setOrderStatusFilter, setPaymentStatusFilter, resetPagination],
  );

  const resetFilters = useCallback(async () => {
    setIsFetching(true);
    await setOrderStatusFilter(null);
    await setPaymentStatusFilter(null);
    resetPagination();
    setIsFetching(false);
  }, [setOrderStatusFilter, setPaymentStatusFilter, resetPagination]);

  const handleSort = useCallback(
    async (field: string) => {
      setIsFetching(true);
      if (sortField === field) {
        await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        await setSortField(field);
        await setSortDirection("asc"); // Default to asc when changing field
      }
      resetPagination();
      setIsFetching(false);
    },
    [sortField, sortDirection, setSortField, setSortDirection, resetPagination],
  );

  // Pagination Handlers
  const handleNextPage = useCallback(
    (nextCursor: OrderCursor) => {
      setCursorHistory((prev) => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
    },
    [currentCursor, setCurrentCursor],
  );

  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length === 0) return;
    setIsFetching(true); // Indicate loading for pagination buttons too
    const newHistory = [...cursorHistory];
    const previousCursor = newHistory.pop() ?? null;
    setCursorHistory(newHistory);
    setCurrentCursor(previousCursor);
    // Note: Setting isFetching false here might be too soon if data fetch is slow
    // A better approach might involve useTransition or feedback from useSuspenseQuery
    setIsFetching(false);
  }, [cursorHistory, setCurrentCursor]);

  // Determine if any filters are active
  const filtersActive =
    orderStatusFilter !== null || paymentStatusFilter !== null;
  const hasPreviousPage = cursorHistory.length > 0;

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Order# or Customer..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-9 w-full rounded-lg bg-background pl-8"
                disabled={isFetching}
              />
              {inputValue && (
                <Button
                  size="icon"
                  className="absolute right-10 top-1/2 h-6 w-6 -translate-y-1/2 transform"
                  onClick={clearSearch}
                  disabled={isFetching}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <SubmitButton
                onClick={handleSearch}
                className="absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 transform rounded-l-none p-0"
                isPending={isFetching}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </SubmitButton>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1"
              asChild
              disabled={isFetching}
            >
              <Link href="/orders/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Order
                </span>
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              <Select
                value={orderStatusFilter === null ? "all" : orderStatusFilter}
                onValueChange={(value) =>
                  handleFilterChange("status", value === "all" ? null : value)
                }
                disabled={isFetching}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {orderStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={
                  paymentStatusFilter === null ? "all" : paymentStatusFilter
                }
                onValueChange={(value) =>
                  handleFilterChange("payment", value === "all" ? null : value)
                }
                disabled={isFetching}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  {paymentStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              {(filtersActive || sortField !== "") && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 px-3 text-xs"
                  disabled={isFetching}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("total")}
                className="h-9 px-3"
                disabled={isFetching}
              >
                Total
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
                Date
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "createdAt" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        <Suspense fallback={<OrderListFallback />}>
          <OrderList
            searchTerm={searchTerm}
            orderStatusFilter={orderStatusFilter}
            paymentStatusFilter={paymentStatusFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            currentCursor={currentCursor}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            hasPreviousPage={hasPreviousPage}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default OrderGrid;
