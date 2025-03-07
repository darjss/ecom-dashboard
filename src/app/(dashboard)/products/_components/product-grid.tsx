"use client";

import { useState } from "react";
import Link from "next/link";
import type { SortingState } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  Search,
  PlusCircle,
  ArrowUpDown,
  Edit,
  Minus,
  Plus,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  deleteProduct,
  paginated,
  searchProductByNameForTable,
} from "@/server/actions/product";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import withEditForm from "./edit-product-form";
import SubmitButton from "@/components/submit-button";
import type { BrandType, CategoryType, ProductType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import RowActions from "./row-actions";
import { DataPagination } from "@/components/data-pagination";
import { useAction } from "@/hooks/use-action";

const ProductCard = ({
  product,
  brands,
  categories,
  onUpdateStock,
}: {
  product: ProductType;
  brands: BrandType;
  categories: CategoryType;
  onUpdateStock: (id: number, newStock: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stockValue, setStockValue] = useState(product.stock);

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "/placeholder.svg";
  const brand = brands.find((b) => b.id === product.brandId);
  const category = categories.find((c) => c.id === product.categoryId);

  const handleSave = () => {
    onUpdateStock(product.id, stockValue);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-300";
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800 border-red-300";
      case "DISCONTINUED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStockColor = (stock: number) => {
    if (stock > 10) return "text-green-600";
    if (stock > 0) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="bg-bg p-4">
        <div className="flex flex-row">
          {/* Image container - always on left side */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-muted/10 p-2">
            <img
              src={primaryImage || "/placeholder.svg"}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>

          {/* Content container */}
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-base font-medium">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  {brand?.name && <span>{brand.name}</span>}
                  {brand?.name && category?.name && <span>•</span>}
                  {category?.name && <span>{category.name}</span>}
                </div>
              </div>
              <Badge
                className={`${getStatusColor(product.status)} shrink-0 whitespace-nowrap border text-xs`}
              >
                {product.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
              {/* Stock section - now more prominent */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center ${getStockColor(product.stock)}`}
                >
                  <Package className="mr-1 h-4 w-4" />
                  <span className="text-base font-medium">{product.stock}</span>
                  <span className="ml-1 font-medium">in stock</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {isEditing ? (
                <div className="mt-2 flex items-center gap-1 sm:mt-0">
                  <Input
                    className="h-7 w-24 text-center"
                    value={stockValue}
                    type="number"
                    min="0"
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? 0
                          : Number.parseInt(e.target.value);
                      setStockValue(Math.max(0, value));
                    }}
                  />

                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="ml-1 h-7 text-xs"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex gap-1 sm:mt-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit Stock
                  </Button>
                  <RowActions
                    id={product.id}
                    renderEditComponent={withEditForm(
                      product,
                      categories,
                      brands,
                    )}
                    deleteFunction={deleteProduct}
                  />
                </div>
              )}
            </div>
          </div>
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

  if (!data) throw new Error("Products Not Found");

  const { products, totalCount } = data;

  async function handlePageChange(newPage: number) {
    await setPage(newPage);
  }

  async function handleFilterChange(type: "brand" | "category", value: number) {
    if (type === "brand") await setBrandFilter(value);
    else await setCategoryFilter(value);
    await setPage(1);
  }

  const updateStock = (id: number, newStock: number) => {
    // Implement the stock update logic here
    console.log(`Updating stock for product ${id} to ${newStock}`);
    // You might want to call an API or update the state here
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-2 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search products..."
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
                onClick={() => {
                  const newSorting = sorting.find((s) => s.id === "price")
                    ? sorting.map((s) =>
                        s.id === "price" ? { ...s, desc: !s.desc } : s,
                      )
                    : [...sorting, { id: "price", desc: false }];
                  setSorting(newSorting);
                }}
                className="h-9 px-3"
              >
                Price <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const newSorting = sorting.find((s) => s.id === "stock")
                    ? sorting.map((s) =>
                        s.id === "stock" ? { ...s, desc: !s.desc } : s,
                      )
                    : [...sorting, { id: "stock", desc: false }];
                  setSorting(newSorting);
                }}
                className="h-9 px-3"
              >
                Stock <ArrowUpDown className="ml-1 h-4 w-4" />
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
                    <div className="h-24 w-24 animate-pulse bg-muted/50" />
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

        <div className="space-y-4">
          <DataPagination
            currentPage={page}
            totalItems={totalCount}
            itemsPerPage={PRODUCT_PER_PAGE}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductGrid;
