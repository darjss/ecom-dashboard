"use client";

import { useState } from "react";
import Link from "next/link";
import { getSortedRowModel, SortingState } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, PlusCircle, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  deleteProduct,
  paginated,
  searchProductByNameForTable,
} from "@/server/actions/product";
import { parseProductsForTable } from "@/lib/zod/utils";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import withEditForm from "./edit-product-form";
import SubmitButton from "@/components/submit-button";
import { useAction } from "@/hooks/use-action";
import type { BrandType, CategoryType, ProductType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import RowActions from "./row-actions";

const ProductCard = ({ product, brands, categories }: { 
  product: ProductType, 
  brands: BrandType, 
  categories: CategoryType 
}) => {
  const primaryImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || "/placeholder.svg";
  const brand = brands.find(b => b.id === product.brandId);
  const category = categories.find(c => c.id === product.categoryId);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square w-full relative">
        <img 
          src={primaryImage} 
          alt={product.name} 
          className="h-full w-full object-cover"
        />
        <Badge className="absolute top-2 right-2">
          {product.status.replace("_", " ")}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium truncate text-sm mb-1">{product.name}</h3>
            <div className="text-sm text-muted-foreground">
              {brand?.name} · {category?.name}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-0 h-5">
                Stock: {product.stock}
              </Badge>
              <div className="font-semibold">
                {product.price} ₮
              </div>
            </div>
          </div>
          <RowActions
            id={product.id}
            renderEditComponent={withEditForm(product, categories, brands)}
            deleteFunction={deleteProduct}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ProductGrid = ({
  initialProducts,
  brands,
  categories,
  initialTotalProduct,
}: {
  initialProducts: ProductType[];
  categories: CategoryType;
  brands: BrandType;
  initialTotalProduct: number;
}) => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sorting, setSorting] = useState<SortingState>([]);
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
  const [searchAction, isSearchPending] = useAction(
    searchProductByNameForTable,
  );
  
  const { data, isLoading } = useQuery<{
    products: ProductType[];
    totalCount: number;
  }>(
    ["products" + page + brandFilter + categoryFilter],
    () =>
      paginated(
        page,
        PRODUCT_PER_PAGE,
        sorting,
        brandFilter === 0 ? undefined : brandFilter,
        categoryFilter === 0 ? undefined : categoryFilter,
      ),
    {
      initialData: {
        products: initialProducts,
        totalCount: initialTotalProduct,
      },
    },
  );

  if (data === undefined) {
    throw new Error("Products Not Found");
  }
  
  const { products, totalCount } = data;

  async function handlePageChange(newPage: number) {
    await setPage(newPage);
  }

  async function handleFilterChange(type: "brand" | "category", value: number) {
    if (type === "brand") {
      await setBrandFilter(value);
    } else {
      await setCategoryFilter(value);
    }
    await setPage(1);
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-2 sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <SubmitButton
                onClick={async () => {
                  const searchResult = await searchAction(searchTerm);
                }}
                isPending={isSearchPending}
                className="shrink-0"
              >
                <Search className="h-4 w-4" />
              </SubmitButton>
            </div>
            <div className="flex gap-2">
              <Link href="/products/add">
                <Button size="sm" className="h-9 sm:h-10">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={brandFilter.toString()}
              onValueChange={(value) =>
                handleFilterChange("brand", Number.parseInt(value))
              }
            >
              <SelectTrigger className="h-9 w-fit sm:h-10">
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
            >
              <SelectTrigger className="h-9 w-fit sm:h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectItem value="0">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSorting = sorting.find(s => s.id === "price")
                    ? sorting.map(s => s.id === "price" ? { ...s, desc: !s.desc } : s)
                    : [...sorting, { id: "price", desc: false }];
                  setSorting(newSorting);
                }}
                className="h-9 px-2 sm:h-10"
              >
                Price <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSorting = sorting.find(s => s.id === "stock")
                    ? sorting.map(s => s.id === "stock" ? { ...s, desc: !s.desc } : s)
                    : [...sorting, { id: "stock", desc: false }];
                  setSorting(newSorting);
                }}
                className="h-9 px-2 sm:h-10"
              >
                Stock <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square w-full bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                      <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
          </>
        )}

        <div className="flex flex-col items-center gap-4 px-2 sm:flex-row sm:justify-between sm:px-0">
          <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
            Page {page} of{" "}
            {Math.max(1, Math.ceil(totalCount / PRODUCT_PER_PAGE))}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && handlePageChange(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* First page */}
              {page > 3 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis if needed */}
              {page > 4 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Pages around current page */}
              {Array.from(
                {
                  length: Math.min(
                    3,
                    Math.ceil(totalCount / PRODUCT_PER_PAGE),
                  ),
                },
                (_, i) => {
                  const maxPage = Math.max(
                    1,
                    Math.ceil(totalCount / PRODUCT_PER_PAGE),
                  );
                  let pageNumber;

                  // Calculate which pages to show
                  if (page <= 2) {
                    pageNumber = i + 1;
                  } else if (page >= maxPage - 1) {
                    pageNumber = maxPage - 2 + i;
                  } else {
                    pageNumber = page - 1 + i;
                  }

                  // Only show if page is valid
                  return pageNumber > 0 && pageNumber <= maxPage ? (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={pageNumber === page}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ) : null;
                },
              )}

              {/* Ellipsis if needed */}
              {page < Math.ceil(totalCount / PRODUCT_PER_PAGE) - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page */}
              {page < Math.ceil(totalCount / PRODUCT_PER_PAGE) - 2 &&
                Math.ceil(totalCount / PRODUCT_PER_PAGE) > 3 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(totalCount / PRODUCT_PER_PAGE),
                        )
                      }
                    >
                      {Math.ceil(totalCount / PRODUCT_PER_PAGE)}
                    </PaginationLink>
                  </PaginationItem>
                )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    page < Math.ceil(totalCount / PRODUCT_PER_PAGE) &&
                    handlePageChange(page + 1)
                  }
                  className={
                    page >= Math.ceil(totalCount / PRODUCT_PER_PAGE)
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductGrid;