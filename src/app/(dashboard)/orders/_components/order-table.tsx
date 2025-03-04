"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { parseAsInteger, useQueryState } from "nuqs"
import { Search, PlusCircle, Package, ArrowUpDown } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { deleteOrder, getPaginatedOrders, searchOrderByNumber } from "@/server/actions/order"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { PRODUCT_PER_PAGE, orderStatus } from "@/lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SubmitButton from "@/components/submit-button"
import { useAction } from "@/hooks/use-action"
import { OrderType } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import withEditForm from "./edit-order-form"
import RowActions from "./row-actions"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  rowCount: number
}

interface TableOrderType {
  id: number
  orderNumber: string
  customerPhone: number
  status: string
  total: number
  createdAt: string
  updatedAt: string
  notes?: string | null
  products: Array<{
    quantity: number
    name: string
    id: number
    imageUrl?: string
  }>
}

const columns: ColumnDef<TableOrderType>[] = [
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const data = row.original
      return (
        <div className="flex justify-end">
          <RowActions
            id={data.id}
            renderEditComponent={withEditForm(data)}
            deleteFunction={deleteOrder}
          />
        </div>
      )
    },
  },
  {
    accessorKey: "products",
    header: () => <div className="text-center">Products</div>,
    cell: ({ row }) => {
      const products = row.getValue("products") as TableOrderType["products"]
      return (
        <div className="flex items-center gap-2">
          {products.slice(0, 1).map((product) => (
            <div key={product.id} className="flex items-center gap-2">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{product.name.substring(0, 20)}</p>
                <p className="text-xs text-muted-foreground">
                  {products.length > 1 ? `+${products.length - 1} more` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "orderNumber",
    header: () => <div className="text-left">Order Number</div>,
    cell: ({ row }) => {
      const orderNumber = row.getValue("orderNumber") as string
      return <p className="text-left text-sm font-medium">{orderNumber}</p>
    },
  },
  {
    accessorKey: "customerPhone",
    header: () => <div className="text-left">Customer</div>,
    cell: ({ row }) => {
      const phone = row.getValue("customerPhone") as number
      return <p className="text-left text-sm">{phone}</p>
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="neutral"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <p className="text-right text-sm">{row.getValue("total") as number} ₮</p>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex justify-center">
          <Badge 
            className={`text-xs ${
              status === "delivered" 
                ? "bg-green-500" 
                : status === "pending" 
                ? "bg-amber-500" 
                : status === "shipped" 
                ? "bg-blue-500" 
                : status === "cancelled" 
                ? "bg-red-500" 
                : ""
            }`}
          >
            {status.replace("_", " ")}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="neutral"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt") as string)
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(createdAt)
      return <p className="text-right text-sm">{formattedDate}</p>
    },
  },
]

const OrderTable = ({
  initialOrders,
  initialTotalOrder,
}: {
  initialOrders: TableOrderType[]
  initialTotalOrder: number
}) => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [orders, setOrders] = useState<TableOrderType[]>(initialOrders)
  const [isPending, startTransition] = useTransition()
  const [totalOrders, setTotalOrders] = useState(initialTotalOrder)
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "all" })
  const [searchAction, isSearchPending] = useAction(searchOrderByNumber)

  async function fetchOrders(
    newPage: number, 
    newSorting: SortingState, 
    status?: string
  ) {
    try {
      const result = await getPaginatedOrders(
        newPage,
        PRODUCT_PER_PAGE,
        newSorting,
        status === "all" ? undefined : status
      )
      
      if ("orders" in result && Array.isArray(result.orders)) {
        setOrders(result.orders as TableOrderType[])
        setTotalOrders(result.total?.count ?? initialTotalOrder)
      } else {
        console.error("Unexpected response format:", result)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: totalOrders,
    onSortingChange: (updater) => {
      startTransition(() => {
        const newSorting = typeof updater === "function" ? updater(sorting) : updater
        setSorting(newSorting)
        setPage(1)
        fetchOrders(1, newSorting, statusFilter)
      })
    },
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  async function handlePageChange(newPage: number) {
    startTransition(async () => {
      await setPage(newPage)
      fetchOrders(newPage, sorting, statusFilter)
    })
  }

  async function handleStatusFilterChange(value: string) {
    startTransition(async () => {
      await setStatusFilter(value)
      await setPage(1)
      fetchOrders(1, sorting, value)
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-2 sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <SubmitButton
                onClick={async () => {
                  const searchResult = await searchAction(searchTerm)
                  if (Array.isArray(searchResult)) {
                    setOrders(searchResult as TableOrderType[])
                  }
                }}
                isPending={isSearchPending}
                className="shrink-0"
              >
                <Search className="h-4 w-4" />
              </SubmitButton>
            </div>
            <div className="flex gap-2">
              <Link href="/orders/add">
                <Button size="sm" className="h-9 sm:h-10">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Order
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="h-9 w-fit sm:h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatus.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
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
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="">
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
          </div>
        )}

        <div className="flex flex-col items-center gap-4 px-2 sm:flex-row sm:justify-between sm:px-0">
          <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
            Page {page} of {Math.ceil(totalOrders / PRODUCT_PER_PAGE)}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => handlePageChange(page - 1)} isActive={page !== 1} />
              </PaginationItem>
              {Array.from({ length: Math.min(5, Math.ceil(totalOrders / PRODUCT_PER_PAGE)) }, (_, i) => {
                const pageNumber = page <= 3 ? i + 1 : page - 2 + i
                return pageNumber <= Math.ceil(totalOrders / PRODUCT_PER_PAGE) ? (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={pageNumber === page}>
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ) : null
              })}
              {Math.ceil(totalOrders / PRODUCT_PER_PAGE) > 5 &&
                page < Math.ceil(totalOrders / PRODUCT_PER_PAGE) - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              {Math.ceil(totalOrders / PRODUCT_PER_PAGE) > 5 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(Math.ceil(totalOrders / PRODUCT_PER_PAGE))}
                    isActive={page === Math.ceil(totalOrders / PRODUCT_PER_PAGE)}
                  >
                    {Math.ceil(totalOrders / PRODUCT_PER_PAGE)}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  isActive={page !== Math.ceil(totalOrders / PRODUCT_PER_PAGE)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderTable