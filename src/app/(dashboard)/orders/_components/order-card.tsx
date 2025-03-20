"use client";
import {
  Package,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle, Copy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderType } from "@/lib/types";
import RowActions from "../../../(dashboard)/products/_components/row-actions";
import { deleteOrder } from "@/server/actions/order";
import EditOrderForm from "./edit-order-form";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPaymentProviderIcon, getPaymentStatusColor, getStatusColor } from "@/lib/utils";

const OrderCard = ({ order }: { order: OrderType }) => {



  return (
    <Card
      className="overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md"
      style={{
        borderLeftColor:
          order.status === "delivered"
            ? "#10b981"
            : order.status === "pending"
              ? "#f59e0b"
              : order.status === "shipped"
                ? "#0ea5e9"
                : "#f43f5e",
      }}
    >
      <CardContent className="p-0">
        {/* Header section */}
        <div className="flex items-center justify-between gap-2 border-b bg-muted/5 p-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">{order.customerPhone}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                <span className="font-medium">#{order.orderNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge
              className={`${getStatusColor(order.status)} px-2 py-0.5 text-xs shadow-sm`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>

            {order.paymentStatus &&
              order.paymentStatus[0] &&
              order.paymentProvider?.[0] && (
                <Badge
                  className={`flex h-5 items-center gap-1.5 rounded-md px-2 text-[10px] shadow-sm ${getPaymentStatusColor(
                    order.paymentStatus[0],
                  )}`}
                >
                  <span>
                    {getPaymentProviderIcon(order.paymentProvider[0])}
                  </span>
                  <span>
                    {order.paymentStatus[0] === "success"
                      ? "Paid"
                      : order.paymentStatus[0] === "failed"
                        ? "Failed"
                        : "Pending"}
                  </span>
                </Badge>
              )}
          </div>
        </div>

        <div className="border-b bg-muted/5 px-3 py-2">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className=" text-sm font-semibold">
              {order.address || "No address provided"}
            </span>
            <Button size={"icon"} className="w-7 h-7" variant={"noShadow"} onClick={async ()=>{
              await navigator.clipboard.writeText(order.address)
              toast("Address Copied")
            }}>  <Copy className="w-4 h-4"/></Button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-3">
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="w-full">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Products
                  </h4>
                  <span className="rounded-full bg-muted/20 px-1.5 py-0.5 text-xs">
                    {order.products.length}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-primary">
                  <DollarSign className="h-3.5 w-3.5" />₮
                  {order.total.toFixed(2)}
                </span>
              </div>

              <div className="mb-2 grid grid-cols-2 gap-1.5">
                {order.products.map((product) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-1.5 rounded border bg-card p-1.5 text-xs"
                  >
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-muted/10">
                      <img
                        src={product.imageUrl || "/placeholder.jpg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {product.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        x{product.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t pt-1">
                {/* Action buttons */}
                <Button
                  variant="neutral"
                  size="sm"
                  className="h-7 gap-1 border-emerald-200 px-2 text-xs text-emerald-700 hover:bg-emerald-50"
                  disabled={order.status === "delivered"}
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>Mark Delivered</span>
                </Button>

                <RowActions
                  id={order.id}
                  renderEditComponent={({
                    setDialogOpen,
                  }: {
                    setDialogOpen: Dispatch<SetStateAction<boolean>>;
                  }) => (
                    <EditOrderForm
                      order={{ ...order, isNewCustomer: false }}
                      setDialogOpen={setDialogOpen}
                    />
                  )}
                  deleteFunction={deleteOrder}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
