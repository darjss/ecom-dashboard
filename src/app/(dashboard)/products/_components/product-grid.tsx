"use client";

import React, { useState, Suspense, useTransition } from "react"; // Import useTransition
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  Search,
  PlusCircle,
  ArrowUpDown,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query"; // Removed useQuery

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
import type { BrandType, CategoryType } from "@/lib/types";
import { DataPagination } from "@/components/data-pagination";
import ProductCard from "./product-card";
import ProductSkeleton from "./product-skeleton";

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
  const [brandFilter, setBrandFilter] = useQueryState(
    "brand",
    parseAsInteger.withDefault(0),
  );
  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    parseAsInteger.withDefault(0),
  );

  const [isPending, startTransition] = useTransition();

  const { data, isFetching } = useSuspenseQuery({
    queryKey: [
      "products",
      page,
      brandFilter,
      categoryFilter,
      sortField,
      sortDirection,
      searchTerm,
    ],
    queryFn: async () => {
      if (searchTerm) {
        const searchResults = await searchProductByName(searchTerm);
        return {
          products: searchResults,
          totalCount: searchResults.length,
        };
      }
      return getPaginatedProducts(
        page,
        PRODUCT_PER_PAGE,
        sortField || undefined,
        sortDirection as "asc" | "desc",
        brandFilter === 0 ? undefined : brandFilter,
        categoryFilter === 0 ? undefined : categoryFilter,
      );
    },
  });

  const isUpdating = isFetching || isPending;

  const products = data?.products || [];
  const totalCount = data?.totalCount || 0;

  const handleSort = (field: string) => {
    startTransition(async () => {
      if (sortField === field) {
        await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        await setSortField(field);
        await setSortDirection("asc"); 
      }
      if (page !== 1) {
        await setPage(1);
      }
    });
  };

  const handlePageChange = (newPage: number) => {

    if (newPage === page || newPage < 1) return;
    startTransition(async () => {
      await setPage(newPage);
    });
  };

  const handleFilterChange = (type: "brand" | "category", value: number) => {
    startTransition(async () => {
      if (type === "brand") {
        await setBrandFilter(value);
      } else {
        await setCategoryFilter(value);
      }
      if (page !== 1) {
        await setPage(1);
      }
    });
  };

  const handleSearch = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && trimmedInput !== searchTerm) {
      startTransition(async () => {
        await setSearchTerm(trimmedInput);
        if (page !== 1) {
          await setPage(1);
        }
      });
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    if (searchTerm !== "") {
      startTransition(async () => {
        await setSearchTerm("");

        if (page !== 1) {
          await setPage(1);
        }
      });
    }
  };

  const handleResetFilters = () => {
    startTransition(async () => {
      setInputValue(""); 

      const promises = [
        setSearchTerm(""),
        setBrandFilter(0),
        setCategoryFilter(0),
        setSortField(""),
        setSortDirection("asc"),
        setPage(1), 
      ];
      await Promise.all(promises.map((p) => p.catch((e) => console.error(e)))); 
    });
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    brandFilter !== 0 ||
    categoryFilter !== 0 ||
    sortField !== "";

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search products..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="h-9"
                disabled={isUpdating}
              />
              <Button
                onClick={handleSearch}
                className="h-9 w-9 shrink-0 p-0"
                disabled={isUpdating || !inputValue.trim()}
                aria-label="Search"
              >
                {isPending && searchTerm === inputValue.trim() ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
              {searchTerm && (
                <Button
                  onClick={handleClearSearch}
                  className="h-9 w-9 shrink-0 p-0"
                  disabled={isUpdating}
                  size={"icon"}
                  variant={"destructive"}
                  aria-label="Clear search"
                >
                  {isPending && searchTerm !== "" ? ( 
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <Link href="/products/add" >
              <Button
                size="sm"
                className="h-9 w-full sm:w-auto"
                disabled={isUpdating}
              >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
              </Button>
            </Link>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={brandFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange("brand", Number.parseInt(value))
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="0">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange("category", Number.parseInt(value))
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="0">All Categories</SelectItem>
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
            </div>

            <div className="flex gap-2 sm:ml-auto">
              <Button
                variant="neutral" 
                size="sm"
                onClick={() => handleSort("price")}
                className="h-9 px-3"
                disabled={isUpdating}
              >
                Price
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 transition-opacity ${
                    sortField === "price" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => handleSort("stock")}
                className="h-9 px-3"
                disabled={isUpdating}
              >
                Stock
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 transition-opacity ${
                    sortField === "stock" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="default" 
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 px-3"
                  disabled={isUpdating}
                  aria-label="Reset filters and sort"
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {isUpdating && products.length > 0 && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}
          {!isUpdating && products.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No products found matching your criteria.
            </div>
          )}
          {products.length > 0 && (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brands={brands}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </div>

          <DataPagination
            currentPage={page}
            totalItems={totalCount}
            itemsPerPage={PRODUCT_PER_PAGE}
            onPageChange={handlePageChange}
            isLoading={isUpdating} 
          />

        {isUpdating && (
          <div className="h-9 w-full animate-pulse rounded bg-muted"></div>
        )}
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
      <ProductGridContent categories={categories} brands={brands} />
    </Suspense>
  );
};

export default ProductGrid;
