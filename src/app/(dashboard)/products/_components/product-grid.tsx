"use client";

import React, {
  useState,
  Suspense,
  useTransition,
  useCallback,
  useEffect,
} from "react"; // Updated imports
import Link from "next/link";
import {
  parseAsInteger,
  useQueryState,
  parseAsString, // Import parseAsString
  createParser, // Import createParser
} from "nuqs";
import {
  Search,
  PlusCircle,
  ArrowUpDown,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

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

import {
  getPaginatedProducts,
  searchProductByName,
} from "@/server/actions/product";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import type { BrandType, CategoryType, ProductType } from "@/lib/types"; // Add ProductType
import { DataPagination } from "@/components/data-pagination";
import ProductCard from "./product-card";
import ProductSkeleton from "./product-skeleton";

// Define cursor type - Must match the one in page.tsx exactly
type ProductCursor = {
  id: number;
  price?: number;
  stock?: number;
  createdAt?: Date | string;
} | null;

// Client-side parser for ProductCursor - must match server-side
const parseAsCursor = createParser({
  parse: (value: string) => {
    if (!value || value === "null") return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed === null) return null;
      if (typeof parsed !== "object") return null;
      if (!("id" in parsed) || typeof parsed.id !== "number") return null;
      // Ensure date/number types are handled if needed
      return parsed as ProductCursor;
    } catch {
      return null;
    }
  },
  serialize: (value: ProductCursor): string => {
    return JSON.stringify(value);
  },
});

const ProductGridSkeleton = () => (
  <Card className="w-full">
    <CardContent className="space-y-6 p-2 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex w-full items-center gap-2">
            <div className="h-9 w-full animate-pulse rounded bg-muted"></div>
            <div className="h-9 w-9 shrink-0 animate-pulse rounded bg-muted p-0"></div>
          </div>
          <div className="h-9 w-full animate-pulse rounded bg-muted sm:w-[88px]"></div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex gap-2">
            <div className="h-9 w-full animate-pulse rounded bg-muted sm:w-[140px]"></div>
            <div className="h-9 w-full animate-pulse rounded bg-muted sm:w-[140px]"></div>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <div className="h-9 w-[80px] animate-pulse rounded bg-muted px-3"></div>
            <div className="h-9 w-[80px] animate-pulse rounded bg-muted px-3"></div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
      <div className="h-9 w-full animate-pulse rounded bg-muted"></div>
    </CardContent>
  </Card>
);

const ProductGridContent = ({
  brands,
  categories,
}: {
  categories: CategoryType;
  brands: BrandType;
}) => {
  const [isPending, startTransition] = useTransition();

  // --- State Management with nuqs ---
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
  const [brandFilter, setBrandFilter] = useQueryState(
    "brand",
    parseAsInteger.withDefault(0),
  );
  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    parseAsInteger.withDefault(0),
  );

  // Use nuqs for cursor, handle undefined default
  const [rawCursor, setCurrentCursorNuqs] = useQueryState(
    "cursor",
    parseAsCursor,
  );
  const currentCursor = rawCursor === undefined ? null : rawCursor;

  // Local state for search input
  const [inputValue, setInputValue] = useState(searchTerm);

  // Local state for cursor history
  const [cursorHistory, setCursorHistory] = useState<ProductCursor[]>([]);

  // --- Data Fetching ---
  const { data, isFetching } = useSuspenseQuery({
    queryKey: [
      "products",
      brandFilter,
      categoryFilter,
      sortField,
      sortDirection,
      searchTerm,
      currentCursor, // Use processed cursor from nuqs
    ],
    staleTime: 1 * 60 * 1000, // 1 minute
    queryFn: async () => {
      if (searchTerm) {
        const searchResults = await searchProductByName(searchTerm);
        // Ensure searchResults is always an array
        const products = Array.isArray(searchResults) ? searchResults : [];
        return {
          products: products as ProductType[], // Cast to ProductType array
          nextCursor: null, // No pagination for search
        };
      }
      // Fetch paginated products
      const result = await getPaginatedProducts(
        PRODUCT_PER_PAGE,
        sortField || undefined,
        sortDirection as "asc" | "desc",
        brandFilter === 0 ? undefined : brandFilter,
        categoryFilter === 0 ? undefined : categoryFilter,
        currentCursor, // Pass processed cursor
      );
      // Handle potential errors (assuming result might have error structure)
      if (typeof result === "object" && result !== null && "error" in result) {
        throw new Error((result.error as string) || "Failed to fetch products");
      }
      // Ensure result structure matches expected type
      return {
        products: (result?.products as ProductType[]) ?? [],
        nextCursor: result?.nextCursor ?? null,
      };
    },
  });

  const isUpdating = isFetching || isPending;
  const products = data?.products || [];
  const nextCursor = data?.nextCursor;
  const hasNextPage = !!nextCursor;
  const hasPreviousPage = cursorHistory.length > 0;

  // --- Event Handlers ---

  // Function to reset pagination state (both URL and local history)
  const resetPagination = useCallback(() => {
    startTransition(() => {
      setCurrentCursorNuqs(null); // Reset URL cursor
      setCursorHistory([]); // Reset local history
    });
  }, [setCurrentCursorNuqs, startTransition]);

  const handleSort = useCallback(
    (field: string) => {
      startTransition(async () => {
        // Optimistically update UI state if needed, or wait for query refetch
        if (sortField === field) {
          await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
          await setSortField(field);
          await setSortDirection("asc");
        }
        // Reset pagination when sort changes
        await setCurrentCursorNuqs(null);
        setCursorHistory([]);
      });
    },
    [
      sortField,
      sortDirection,
      setSortField,
      setSortDirection,
      setCurrentCursorNuqs,
      startTransition,
    ],
  );

  const handleFilterChange = useCallback(
    (type: "brand" | "category", value: number) => {
      startTransition(async () => {
        if (type === "brand") {
          await setBrandFilter(value);
        } else {
          await setCategoryFilter(value);
        }
        // Reset pagination when filter changes
        await setCurrentCursorNuqs(null);
        setCursorHistory([]);
      });
    },
    [setBrandFilter, setCategoryFilter, setCurrentCursorNuqs, startTransition],
  );

  const handleSearch = useCallback(() => {
    const trimmedInput = inputValue.trim();
    // Only update searchTerm if input changed
    if (trimmedInput === searchTerm) return;

    startTransition(async () => {
      await setSearchTerm(trimmedInput); // Set URL from input
      // Reset pagination when search changes
      setCurrentCursorNuqs(null);
      setCursorHistory([]);
      // No need to setInputValue here
    });
  }, [
    inputValue,
    searchTerm,
    setSearchTerm,
    setCurrentCursorNuqs,
    startTransition,
    // Removed resetPagination, handled inline
  ]);

  const handleClearSearch = useCallback(() => {
    // Check if already clear locally and in URL
    if (inputValue === "" && searchTerm === "") return;

    startTransition(async () => {
      setInputValue(""); // Clear local input state
      await setSearchTerm(null); // Clear URL state
      // Reset pagination when search clears
      setCurrentCursorNuqs(null);
      setCursorHistory([]);
    });
  }, [
    inputValue, // Added dependency
    searchTerm,
    setSearchTerm,
    setCurrentCursorNuqs,
    startTransition,
    // Removed resetPagination, handled inline
  ]);

  const handleResetFilters = useCallback(() => {
    startTransition(async () => {
      setInputValue(""); // Clear local input
      // Reset all filters and sort in URL state
      const promises = [
        setSearchTerm(""),
        setBrandFilter(0),
        setCategoryFilter(0),
        setSortField(""),
        setSortDirection("asc"),
        setCurrentCursorNuqs(null), // Reset cursor in URL
      ];
      await Promise.all(promises.map((p) => p.catch(console.error)));
      setCursorHistory([]); // Clear local history
    });
  }, [
    setSearchTerm,
    setBrandFilter,
    setCategoryFilter,
    setSortField,
    setSortDirection,
    setCurrentCursorNuqs,
    startTransition,
  ]);

  // Pagination Handlers using nuqs setter
  const handleNextPage = useCallback(() => {
    if (!nextCursor || isUpdating) return;

    startTransition(() => {
      setCursorHistory((prev) => [...prev, currentCursor]); // Add current URL cursor to history
      setCurrentCursorNuqs(nextCursor); // Update URL cursor state
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
      setCursorHistory(newHistory); // Update local history
      setCurrentCursorNuqs(previousCursor); // Update URL cursor state
    });
  }, [cursorHistory, isUpdating, setCurrentCursorNuqs, startTransition]);

  const hasActiveFilters =
    brandFilter !== 0 || categoryFilter !== 0 || searchTerm !== "";

  // --- Render Logic ---
  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 sm:p-6">
        {/* Header: Search, Filters, Sort, Add Button */}
        <div className="space-y-4">
          {/* Row 1: Search and Add Button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product name..."
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
              <Button
                onClick={handleSearch}
                className="absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 transform rounded-l-none p-0"
                disabled={isPending || !inputValue.trim()}
                aria-label="Search"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1"
              asChild
              disabled={isPending}
            >
              <Link href="/products/add">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Link>
            </Button>
          </div>
          {/* Row 2: Filters and Sort */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              <Select
                value={categoryFilter === 0 ? "all" : categoryFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange(
                    "category",
                    value === "all" ? 0 : parseInt(value),
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={brandFilter === 0 ? "all" : brandFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange(
                    "brand",
                    value === "all" ? 0 : parseInt(value),
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              {(hasActiveFilters || sortField !== "") && (
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
                onClick={() => handleSort("stock")}
                className="h-9 px-3"
                disabled={isPending}
              >
                Stock
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "stock" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                size="sm"
                onClick={() => handleSort("price")}
                className="h-9 px-3"
                disabled={isPending}
              >
                Price
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "price" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                size="sm"
                onClick={() => handleSort("createdAt")}
                className="h-9 px-3"
                disabled={isPending}
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

        {/* Product List */}
        <div className="space-y-4">
          {isUpdating && <div className="pt-4 text-center">Loading...</div>}
          {!isUpdating && products.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm
                ? `No products found matching "${searchTerm}"`
                : "No products found. Try adjusting filters."}
            </div>
          )}
          {!isUpdating &&
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                brands={brands}
                categories={categories}
              />
            ))}
        </div>

        {/* Pagination */}
        <DataPagination
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isLoading={isUpdating} // Use combined loading state
        />
      </CardContent>
    </Card>
  );
};

const ProductGrid = ({
  brands,
  categories,
}: {
  categories: CategoryType;
  brands: BrandType;
}) => {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductGridContent brands={brands} categories={categories} />
    </Suspense>
  );
};

export default ProductGrid;
