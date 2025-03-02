"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import { Search, PlusCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  deleteProduct,
  getPaginatedProduct,
  paginated,
} from "@/server/actions/product";
import RowActions from "./row-actions";
import { parseProductsForTable } from "@/lib/zod/utils";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
import { PRODUCT_PER_PAGE, type status } from "@/lib/constants";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import withEditForm from "./edit-product-form";
import SubmitButton from "@/components/submit-button";
import { useAction } from "@/hooks/use-action";
import { searchProductByNameForTable } from "@/server/actions/product";
import type { BrandType, CategoryType, ProductType } from "@/lib/types";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount: number;
}

interface TableProductType {
  id: number;
  name: string;
  price: number;
  status: (typeof status)[number];
  stock: number;
  imageUrl: string;
  fullProduct: ProductType;
  categories: CategoryType;
  brands: BrandType;
}

const columns: ColumnDef<TableProductType>[] = [
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex justify-end">
          <RowActions
            id={data.fullProduct.id}
            renderEditComponent={withEditForm(
              data.fullProduct,
              data.categories,
              data.brands,
            )}
            deleteFunction={deleteProduct}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "imageUrl",
    header: () => <div className="text-center">Image</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <img
          src={row.getValue("imageUrl") || "/placeholder.svg"}
          alt={"image"}
          className="h-10 w-10 rounded-full object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left">Product Name</div>,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <p className="text-left text-sm font-medium">{name.substring(0, 20)}</p>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="neutral"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <p className="text-center text-sm">{row.getValue("stock")}</p>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="neutral"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <p className="text-right text-sm">{row.getValue("price") as number} ₮</p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex justify-center">
          <Badge className="text-xs">{status.replace("_", " ")}</Badge>
        </div>
      );
    },
  },
];

const ProductTable = ({
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
  const [products, setProducts] = useState(
    parseProductsForTable(initialProducts, brands, categories),
  );
  const [isPending, startTransition] = useTransition();
  const [totalProducts, setTotalProducts] = useState(initialTotalProduct);
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
  const [data, isLoading] = useQuery(
    ["products" + page + brandFilter + categoryFilter],
    () =>
      paginated(
        page,
        PRODUCT_PER_PAGE,
        sorting,
        brandFilter === 0 ? undefined : brandId,
        categoryFilter === 0 ? undefined : categoryId,
      ),
  );

  async function fetchProducts(
    newPage: number,
    newSorting: SortingState,
    brandId?: number,
    categoryId?: number,
  ) {
    try {
      const newPaginatedProducts = await getPaginatedProduct(
        newPage,
        PRODUCT_PER_PAGE,
        newSorting,
        brandId === 0 ? undefined : brandId,
        categoryId === 0 ? undefined : categoryId,
      );
      const paginatedP = await paginated(
        newPage,
        PRODUCT_PER_PAGE,
        newSorting,
        brandId === 0 ? undefined : brandId,
        categoryId === 0 ? undefined : categoryId,
      );
      setProducts(
        parseProductsForTable(
          newPaginatedProducts.products,
          brands,
          categories,
        ),
      );
      setTotalProducts(
        newPaginatedProducts.total?.count ?? initialTotalProduct,
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: totalProducts,
    onSortingChange: (updater) => {
      startTransition(() => {
        const newSorting =
          typeof updater === "function" ? updater(sorting) : updater;
        setSorting(newSorting);
        setPage(1);
        fetchProducts(1, newSorting, brandFilter, categoryFilter);
      });
    },
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  async function handlePageChange(newPage: number) {
    startTransition(async () => {
      await setPage(newPage);
      fetchProducts(newPage, sorting, brandFilter, categoryFilter);
    });
  }

  async function handleFilterChange(type: "brand" | "category", value: number) {
    startTransition(async () => {
      if (type === "brand") {
        await setBrandFilter(value);
      } else {
        await setCategoryFilter(value);
      }
      await setPage(1);
      fetchProducts(
        1,
        sorting,
        type === "brand" ? value : brandFilter,
        type === "category" ? value : categoryFilter,
      );
    });
  }
  console.log("brand", brandFilter, "category", categoryFilter);
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
                  setProducts(
                    parseProductsForTable(searchResult, brands, categories),
                  );
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
          </div>
        </div>

        {isPending ? (
          <DataTableSkeleton columnCount={6} rowCount={3} />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <div className="max-w-full overflow-auto">
              <Table className="max-w-full overflow-auto">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead className="text-center" key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 px-2 sm:flex-row sm:justify-between sm:px-0">
          <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
            Page {page} of {Math.ceil(totalProducts / PRODUCT_PER_PAGE)}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  isActive={page !== 1}
                />
              </PaginationItem>
              {Array.from(
                {
                  length: Math.min(
                    5,
                    Math.ceil(totalProducts / PRODUCT_PER_PAGE),
                  ),
                },
                (_, i) => {
                  const pageNumber = page <= 3 ? i + 1 : page - 2 + i;
                  return pageNumber <=
                    Math.ceil(totalProducts / PRODUCT_PER_PAGE) ? (
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
              {Math.ceil(totalProducts / PRODUCT_PER_PAGE) > 5 &&
                page < Math.ceil(totalProducts / PRODUCT_PER_PAGE) - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              {Math.ceil(totalProducts / PRODUCT_PER_PAGE) > 5 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      handlePageChange(
                        Math.ceil(totalProducts / PRODUCT_PER_PAGE),
                      )
                    }
                    isActive={
                      page === Math.ceil(totalProducts / PRODUCT_PER_PAGE)
                    }
                  >
                    {Math.ceil(totalProducts / PRODUCT_PER_PAGE)}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  isActive={
                    page !== Math.ceil(totalProducts / PRODUCT_PER_PAGE)
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

export default ProductTable;
