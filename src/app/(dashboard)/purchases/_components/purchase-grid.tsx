"use client";

import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, PlusCircle, ArrowUpDown } from "lucide-react";
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

import { getPaginatedPurchases } from "@/server/actions/purchases";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { DataPagination } from "@/components/data-pagination";
import PurchaseCard from "./purchase-card";
import PurchaseSkeleton from "./purchase-skeleton";
import type { ProductType } from "@/lib/types";

const PurchaseGrid = ({ products }: { products: ProductType[] }) => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortField, setSortField] = useQueryState("sort", {
    defaultValue: "",
  });
  const [sortDirection, setSortDirection] = useQueryState("dir", {
    defaultValue: "asc",
  });
  const [productFilter, setProductFilter] = useQueryState(
    "product",
    parseAsInteger.withDefault(0),
  );

  const handleSort = async (field: string) => {
    if (sortField === field) {
      await setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      await setSortField(field);
      await setSortDirection("asc");
    }
    await setPage(1);
  };

  const { data, isLoading } = useQuery({

    queryKey:["purchases", page, productFilter, sortField, sortDirection],
    queryFn:async () => {
      return getPaginatedPurchases(
        page,
        PRODUCT_PER_PAGE,
        sortField || undefined,
        sortDirection as "asc" | "desc",
        productFilter === 0 ? undefined : productFilter,
      );
    },
  }
  );

  const purchases = data?.purchases || [];
  const total = data?.total || 0;

  async function handlePageChange(newPage: number) {
    await setPage(newPage);
  }

  async function handleFilterChange(value: number) {
    await setProductFilter(value);
    await setPage(1);
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 p-2 pb-20 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2">
              <Link href="/purchases/add" className="w-full sm:w-auto">
                <Button size="sm" className="h-9 w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              <Select
                value={productFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange(Number.parseInt(value))
                }
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="0">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 sm:ml-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("cost")}
                className="h-9 px-3"
                disabled={isLoading}
              >
                Cost{" "}
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "cost" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("quantity")}
                className="h-9 px-3"
                disabled={isLoading}
              >
                Quantity{" "}
                <ArrowUpDown
                  className={`ml-1 h-4 w-4 ${
                    sortField === "quantity" ? "opacity-100" : "opacity-50"
                  }`}
                />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSort("date")}
                className="h-9 px-3"
                disabled={isLoading}
              >
                Date{" "}
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <PurchaseSkeleton key={index} />
            ))
          ) : purchases.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No purchases found
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          )}
        </div>

        <DataPagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={PRODUCT_PER_PAGE}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default PurchaseGrid;
