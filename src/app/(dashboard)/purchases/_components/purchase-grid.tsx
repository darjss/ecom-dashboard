"use client";

import React, {
  useState,
  Suspense,
  useTransition,
  useCallback,
  useEffect,
} from "react";
import Link from "next/link";
import {
  parseAsInteger,
  useQueryState,
  parseAsString,
  createParser,
} from "nuqs";
import {
  Search,
  PlusCircle,
  ArrowUpDown,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
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
import SubmitButton from "@/components/submit-button";
import {
  getPaginatedPurchases,
  searchPurchaseByProductName,
} from "@/server/actions/purchases";
import { getAllProducts } from "@/server/actions/product";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import type { ProductType } from "@/lib/types";
import { DataPagination } from "@/components/data-pagination";
import PurchaseCard from "./purchase-card";

type PurchaseCursor = {
  id: number;
  quantityPurchased?: number;
  unitCost?: number;
  createdAt?: Date;
} | null;

const parseAsCursor = createParser({
  parse: (value: string) => {
    if (!value || value === "null") return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed === null) return null;
      if (typeof parsed !== "object") return null;
      if (!("id" in parsed) || typeof parsed.id !== "number") return null;
      if (parsed.createdAt && typeof parsed.createdAt === "string") {
        parsed.createdAt = new Date(parsed.createdAt);
      }
      return parsed as PurchaseCursor;
    } catch {
      return null;
    }
  },
  serialize: (value: PurchaseCursor): string => {
    return JSON.stringify(value);
  },
});

type PurchaseWithProduct = {
  id: number;
  createdAt: Date;
  updatedAt: Date | null;
  productId: number;
  quantityPurchased: number;
  unitCost: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
};

const PurchaseSkeleton = () => (
  <div className="h-16 animate-pulse rounded bg-muted"></div>
);

const PurchaseGrid = () => {
  const [isPending, startTransition] = useTransition();

  const { data: productsData } = useQuery({
    queryKey: ["allProductsForFilter"],
    queryFn: async () => await getAllProducts(),
    staleTime: 60 * 60 * 1000,
  });
  const products: ProductType[] = Array.isArray(productsData)
    ? productsData
    : [];

  const [sortField, setSortField] = useQueryState(
    "sort",
    parseAsString.withDefault("date"),
  );
  const [sortDirection, setSortDirection] = useQueryState(
    "dir",
    parseAsString.withDefault("desc"),
  );
  const [productFilter, setProductFilter] = useQueryState(
    "productId",
    parseAsInteger.withDefault(0),
  );
  const [searchTerm, setSearchTerm] = useQueryState(
    "query",
    parseAsString.withDefault(""),
  );

  const [rawCursor, setCurrentCursorNuqs] = useQueryState(
    "cursor",
    parseAsCursor,
  );
  const currentCursor = rawCursor === undefined ? null : rawCursor;

  const [inputValue, setInputValue] = useState(searchTerm);

  const [cursorHistory, setCursorHistory] = useState<PurchaseCursor[]>([]);

  const { data, isFetching } = useSuspenseQuery({
    queryKey: [
      "purchases",
      productFilter,
      sortField,
      sortDirection,
      searchTerm,
      currentCursor,
    ],
    staleTime: 1 * 60 * 1000,
    queryFn: async () => {
      if (searchTerm) {
        const searchResult = await searchPurchaseByProductName(searchTerm);
        if (
          typeof searchResult === "object" &&
          searchResult !== null &&
          "error" in searchResult
        ) {
          throw new Error(`Error searching purchases: ${searchResult.error}`);
        }
        const purchases = Array.isArray(searchResult) ? searchResult : [];
        return {
          purchases: purchases as PurchaseWithProduct[],
          nextCursor: null,
        };
      }
      const result = await getPaginatedPurchases(
        PRODUCT_PER_PAGE,
        sortField,
        sortDirection as "asc" | "desc",
        productFilter === 0 ? undefined : productFilter,
        currentCursor,
      );
      if (typeof result === "object" && result !== null && "error" in result) {
        throw new Error(`Error fetching purchases: ${result.error}`);
      }
      return {
        purchases: (result?.purchases as PurchaseWithProduct[]) ?? [],
        nextCursor: result?.nextCursor ?? null,
      };
    },
  });

  const isUpdating = isFetching || isPending;
  const purchases = data?.purchases || [];
  const nextCursor = data?.nextCursor;
  const hasNextPage = !!nextCursor;
  const hasPreviousPage = cursorHistory.length > 0;

  const resetPagination = useCallback(() => {
    startTransition(() => {
      setCurrentCursorNuqs(null);
      setCursorHistory([]);
    });
  }, [setCurrentCursorNuqs, startTransition]);

  const handleSort = useCallback(
    (field: string) => {
      startTransition(async () => {
        if (sortField === field) {
          await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
          await setSortField(field);
          await setSortDirection("asc");
        }
        resetPagination();
      });
    },
    [
      sortField,
      sortDirection,
      setSortField,
      setSortDirection,
      resetPagination,
      startTransition,
    ],
  );

  const handleFilterChange = useCallback(
    (type: "productId", value: number) => {
      startTransition(async () => {
        await setProductFilter(value);
        resetPagination();
      });
    },
    [setProductFilter, resetPagination, startTransition],
  );

  const handleSearch = useCallback(() => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput === searchTerm) return;
    startTransition(async () => {
      await setSearchTerm(trimmedInput);
      resetPagination();
    });
  }, [inputValue, searchTerm, setSearchTerm, resetPagination, startTransition]);

  const handleClearSearch = useCallback(() => {
    if (inputValue === "" && searchTerm === "") return;
    startTransition(async () => {
      setInputValue("");
      await setSearchTerm("");
      resetPagination();
    });
  }, [inputValue, searchTerm, setSearchTerm, resetPagination, startTransition]);

  const handleResetFilters = useCallback(() => {
    startTransition(async () => {
      setInputValue("");
      const promises = [
        setSearchTerm(""),
        setProductFilter(0),
        setSortField("date"),
        setSortDirection("desc"),
      ];
      await Promise.all(promises.map((p) => p.catch(console.error)));
      resetPagination();
    });
  }, [
    setSearchTerm,
    setProductFilter,
    setSortField,
    setSortDirection,
    resetPagination,
    startTransition,
  ]);

  const handleNextPage = useCallback(() => {
    if (!nextCursor || isUpdating) return;
    startTransition(() => {
      setCursorHistory((prev) => [...prev, currentCursor]);
      setCurrentCursorNuqs(nextCursor);
    });
  }, [
    nextCursor,
    currentCursor,
    isUpdating,
    setCurrentCursorNuqs,
    startTransition,
  ]);

  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length === 0 || isUpdating) return;
    startTransition(() => {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop() ?? null;
      setCursorHistory(newHistory);
      setCurrentCursorNuqs(previousCursor);
    });
  }, [cursorHistory, isUpdating, setCurrentCursorNuqs, startTransition]);

  const hasActiveFilters = productFilter !== 0 || searchTerm !== "";

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 pb-20 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-9 w-full rounded-lg bg-background pl-8"
                disabled={isPending}
              />
              {inputValue && (
                <Button
                  size="icon"
                  className="absolute right-10 top-1/2 h-6 w-6 -translate-y-1/2 transform"
                  onClick={handleClearSearch}
                  disabled={isPending}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <SubmitButton
                onClick={handleSearch}
                className="absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 transform rounded-l-none p-0"
                disabled={isPending || !inputValue.trim()}
                aria-label="Search"
                isPending={isPending}
              >
                <Search className="h-4 w-4" />
              </SubmitButton>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1"
              asChild
              disabled={isPending}
            >
              <Link href="/purchases/add">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Purchase
                </span>
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              <Select
                value={productFilter === 0 ? "all" : productFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange(
                    "productId",
                    value === "all" ? 0 : parseInt(value),
                  )
                }
                disabled={isPending || products.length === 0}
              >
                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product: ProductType) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              {(hasActiveFilters || sortField !== "date") && (
                <Button
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 px-3 text-xs"
                  disabled={isPending}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleSort("quantity")}
                className="h-9 px-3"
                disabled={isPending}
              >
                Quantity
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "quantity" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                size="sm"
                onClick={() => handleSort("cost")}
                className="h-9 px-3"
                disabled={isPending}
              >
                Cost
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "cost" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                size="sm"
                onClick={() => handleSort("date")}
                className="h-9 px-3"
                disabled={isPending}
              >
                Date
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "date" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isUpdating ? (
            Array.from({ length: PRODUCT_PER_PAGE }).map((_, index) => (
              <PurchaseSkeleton key={index} />
            ))
          ) : purchases.length === 0 ? (
            <div className="text-center text-muted-foreground">
              {searchTerm
                ? `No purchases found matching "${searchTerm}"`
                : "No purchases found. Try adjusting filters or adding a purchase."}
            </div>
          ) : (
            purchases.map((purchase: PurchaseWithProduct) => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))
          )}
        </div>

        <DataPagination
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isLoading={isUpdating}
        />
      </CardContent>
    </Card>
  );
};

export default PurchaseGrid;
