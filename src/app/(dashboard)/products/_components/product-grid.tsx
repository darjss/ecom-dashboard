"use client";

import { useState } from "react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, PlusCircle, ArrowUpDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
import { useAction } from "@/hooks/use-action";
import ProductCard from "./product-card";
import ProductSkeleton from "./product-skeleton";

const ProductGrid = ({
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
  const [searchAction, isSearchPending] = useAction(searchProductByName);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = async () => {
    await setSearchTerm(inputValue);
  };

  const handleSort = async (field: string) => {
    if (sortField === field) {
      await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      await setSortField(field);
      await setSortDirection("asc");
    }
    await setPage(1);
  };

  const { data, isLoading, isFetching } = useQuery(
    [
      "products",
      page,
      brandFilter,
      categoryFilter,
      sortField,
      sortDirection,
      searchTerm,
    ],
    async () => {
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
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    },
  );

  const isLoadingData = isLoading || isFetching;
  const products = data?.products || [];
  const totalCount = data?.totalCount || 0;

  async function handlePageChange(newPage: number) {
    await setPage(newPage);
  }

  async function handleFilterChange(type: "brand" | "category", value: number) {
    if (type === "brand") await setBrandFilter(value);
    else await setCategoryFilter(value);
    await setPage(1);
  }

  const updateStock = (id: number, newStock: number) => {
    console.log(`Updating stock for product ${id} to ${newStock}`);
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search products..."
                value={inputValue}
                onChange={handleSearchChange}
                className="h-9"
              />
              <Button
                onClick={handleSearch}
                className="h-9 w-9 shrink-0 p-0"
                disabled={isLoadingData}
              >
                {isLoadingData ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Link href="/products/add">
              <Button size="sm" className="h-9 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              <Select
                value={brandFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange("brand", Number.parseInt(value))
                }
                disabled={isLoadingData}
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
                disabled={isLoadingData}
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
                variant="default"
                size="sm"
                onClick={() => handleSort("price")}
                className="h-9 px-3"
                disabled={isLoadingData}
              >
                Price{" "}
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "price" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("stock")}
                className="h-9 px-3"
                disabled={isLoadingData}
              >
                Stock{" "}
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "stock" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingData ? (
            Array.from({ length: 5 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No products found
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brands={brands}
                  categories={categories}
                  onUpdateStock={updateStock}
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
          isLoading={isLoadingData}
        />
      </CardContent>
    </Card>
  );
};

export default ProductGrid;
