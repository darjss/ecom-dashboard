"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  BrandType,
  CategoryType,
  getPaginatedProduct,
  ProductType,
} from "@/server/queries";
import RowActions from "./row-actions";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState, useTransition } from "react";
import { parseProductsForTable } from "@/lib/zod/utils";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount: number;
}
interface TableProductType {
  id: number;
  name: string;
  price: number;
  status: "active" | "draft" | "out_of_stock";
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
      <img src={row.getValue("imageUrl")} className="h-8 w-8"></img>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">Product Name </div>,
    cell: ({ row }) => (
      <p className="overflow-x-scroll">{row.getValue("name")}</p>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <RowActions
          product={data.fullProduct}
          brands={data.brands}
          categories={data.categories}
        />
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
  const handlePageChange = (newPage: number) => {
    startTransition(async () => {
      setPage(newPage);
      const newPaginatedProducts = await getPaginatedProduct(page, 3);
      setProducts(
        parseProductsForTable(
          newPaginatedProducts.products,
          brands,
          categories,
        ),
      );
      setTotalProducts(newPaginatedProducts.total?.count ?? initialTotalProduct);
    });
  };
  return (
    <div>
      {isPending ? (
        <DataTableSkeleton columnCount={5} rowCount={10} />
      ) : (
        <DataTable columns={columns} data={products} rowCount={totalProducts} />
      )}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page == 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page == Math.ceil(totalProducts / 3)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: rowCount,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default ProductTable;
