"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

import { BrandType, CategoryType, ProductType } from "@/server/queries";
import { ReceiptEuroIcon } from "lucide-react";
import RowActions from "./row-actions";
import { Button } from "@/components/ui/button";

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
  products,
  brands,
  categories,
}: {
  products: ProductType[];
  categories: CategoryType;
  brands: BrandType;
}) => {
  const parsedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    status: product.status,
    stock: product.stock,
    imageUrl: product.images[0]?.url as string,
    fullProduct: product,
    brands: brands,
    categories: categories,
  }));
  return <DataTable columns={columns} data={parsedProducts} />;
};

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default ProductTable;
