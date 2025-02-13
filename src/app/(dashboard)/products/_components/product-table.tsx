"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  PlusCircle,
  Database,
} from "lucide-react";

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
  type BrandType,
  type CategoryType,
  deleteProduct,
  getPaginatedProduct,
  type ProductType,
} from "@/server/queries";
import { seedDatabase } from "seed";
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
import { searchProductByName } from "@/server/queries/product";

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
    accessorKey: "imageUrl",
    header: "",
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
    header: "Product Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <p className="font-medium">{name.substring(0, 30)}</p>;
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-center"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <p className="text-center">{row.getValue("stock")}</p>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <p className="text-right">{row.getValue("price") as number} ₮</p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex justify-center">
          <Badge>{status.replace("_", " ")}</Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
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
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useQueryState(
    "brand",
    parseAsInteger.withDefault(0),
  );
  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    parseAsInteger.withDefault(0),
  );
  const [searchAction, isSearchPending] = useAction(searchProductByName);
  // const filteredProducts = products.filter((product) =>
  //   product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  // );

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
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex w-full items-center sm:w-auto">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <SubmitButton onClick={()=>searchAction(searchTerm)} isPending={isSearchPending}>
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          </SubmitButton>
        </div>
        <div className="flex gap-2">
          <Select
            value={brandFilter.toString()}
            onValueChange={(value) =>
              handleFilterChange("brand", parseInt(value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
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
              handleFilterChange("category", parseInt(value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
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
      <div className="flex w-full gap-2 sm:w-auto">
        <Link href="/products/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
        {process.env.NODE_ENV === "development" && (
          <form action={seedDatabase}>
            <Button type="submit" variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Seed Database
            </Button>
          </form>
        )}
      </div>
      {isPending ? (
        <DataTableSkeleton columnCount={6} rowCount={3} />
      ) : (
        <div className="rounded-md border">
          <Table>
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
      )}

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * PRODUCT_PER_PAGE + 1} to{" "}
          {Math.min(page * PRODUCT_PER_PAGE, totalProducts)} of {totalProducts}{" "}
          products
        </p>
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === Math.ceil(totalProducts / PRODUCT_PER_PAGE)}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
