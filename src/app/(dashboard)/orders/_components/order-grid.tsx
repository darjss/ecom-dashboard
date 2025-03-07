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
  Package,
  Truck,
} from "lucide-react";
import { paymentStatus } from "@/lib/constants";

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
  deleteOrder,
  getPaginatedOrders,
  searchOrderByNumber,
} from "@/server/actions/order";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import EditOrderForm from "./edit-order-form";
import { Dispatch, JSX, SetStateAction } from "react";
import SubmitButton from "@/components/submit-button";
import { OrderStatusType, OrderType, PaymentStatusType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import RowActions from "../../../(dashboard)/products/_components/row-actions";
import { DataPagination } from "@/components/data-pagination";
import { useAction } from "@/hooks/use-action";

const OrderCard = ({ order }: { order: OrderType }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "refunded":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="bg-bg p-4">
        <div className="flex flex-row">
          {/* Order info container */}
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-base font-medium">
                  #{order.orderNumber}
                </h3>
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <span>Phone: {order.customerPhone}</span>
                  <span>•</span>
                  <span>
                    Created: {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge
                className={`${getStatusColor(order.status)} shrink-0 whitespace-nowrap border text-xs`}
              >
                {order.status}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {order.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="h-8 w-8 bg-muted/10 p-1">
                    <img
                      src={product.imageUrl || "/placeholder.jpg"}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span>
                    {product.name} (x{product.quantity})
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Truck className="mr-1 h-4 w-4" />
                  <span className="text-base font-medium">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex gap-2">
                  {order.paymentStatus &&
                    order.paymentStatus.map((status, index) => (
                      <Badge
                        key={index}
                        className={`${getPaymentStatusColor(status)} shrink-0 whitespace-nowrap border text-xs`}
                      >
                        {status} ({order.paymentProvider?.[index] || "unknown"})
                      </Badge>
                    ))}
                </div>
                <div className="mt-2 flex gap-4 sm:mt-0">
                  <RowActions
                    id={order.id}
                    renderEditComponent={({
                      setDialogOpen,
                    }: {
                      setDialogOpen: Dispatch<SetStateAction<boolean>>;
                    }) => (
                      <EditOrderForm
                        products={[]}
                        order={{
                          id: order.id,
                          customerPhone: order.customerPhone,
                          address: "",
                          isNewCustomer: false,
                          notes: order.notes || "",
                          status: order.status,
                          paymentStatus: order.paymentStatus?.[0] || "pending",
                          products: order.products.map((p) => ({
                            productId: p.id,
                            quantity: p.quantity,
                            price: 0,
                          })),
                        }}
                      />
                    )}
                    deleteFunction={deleteOrder}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderGrid = ({
  initialOrders,
  initialTotalOrder,
}: {
  initialOrders: OrderType[];
  initialTotalOrder: number;
}) => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useQueryState("query", {
    defaultValue: "",
  });
  const [orderStatusFilter, setOrderStatusFilter] = useQueryState("status");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useQueryState("payment");
  const [searchAction, isSearchPending] = useAction(searchOrderByNumber);

  const { data, isLoading } = useQuery(
    ["orders" + page + orderStatusFilter + paymentStatusFilter],
    async () => {
      const result = await getPaginatedOrders(
        page,
        PRODUCT_PER_PAGE,
        paymentStatusFilter === null
          ? undefined
          : (paymentStatusFilter as PaymentStatusType),
        orderStatusFilter === null
          ? undefined
          : (orderStatusFilter as OrderStatusType),
      );

      // Ensure we have the right shape of data
      if ("message" in result && "error" in result) {
        throw new Error(`Error fetching orders: ${result.error}`);
      }

      if (!Array.isArray(result.orders)) {
        return {
          orders: [] as OrderType[],
          total: 0,
        };
      }

      return {
        orders: result.orders as OrderType[],
        total: result.total || 0,
      };
    },
    {
      initialData: {
        orders: initialOrders,
        total: initialTotalOrder,
      },
    },
  );

  if (!data) throw new Error("Orders Not Found");

  const { orders, total } = data;

  async function handlePageChange(newPage: number) {
    await setPage(newPage);
  }

  async function handleFilterChange(type: "status" | "payment", value: string) {
    if (type === "status") await setOrderStatusFilter(value);
    else await setPaymentStatusFilter(value);
    await setPage(1);
  }
  console.log(
    "orders",
    data.orders,
    "filters",
    orderStatusFilter,
    paymentStatusFilter,
    "products",
    data.orders[0]?.products,
  );
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-2 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Search order number..."
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
            <Link href="/orders/add">
              <Button size="sm" className="h-9 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              <Select
                value={orderStatusFilter || undefined}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={paymentStatusFilter || undefined}
                onValueChange={(value) => handleFilterChange("payment", value)}
              >
                <SelectTrigger className="h-9 w-full sm:w-[140px]">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 sm:ml-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const newSorting = sorting.find((s) => s.id === "total")
                    ? sorting.map((s) =>
                        s.id === "total" ? { ...s, desc: !s.desc } : s,
                      )
                    : [...sorting, { id: "total", desc: false }];
                  setSorting(newSorting);
                }}
                className="h-9 px-3"
              >
                Total <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const newSorting = sorting.find((s) => s.id === "createdAt")
                    ? sorting.map((s) =>
                        s.id === "createdAt" ? { ...s, desc: !s.desc } : s,
                      )
                    : [...sorting, { id: "createdAt", desc: false }];
                  setSorting(newSorting);
                }}
                className="h-9 px-3"
              >
                Date <ArrowUpDown className="ml-1 h-4 w-4" />
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
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: OrderType) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <div className="space-y-4">
          <DataPagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={PRODUCT_PER_PAGE}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderGrid;
