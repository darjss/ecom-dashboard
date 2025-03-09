"use client";
import { Package, Phone, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderType } from "@/lib/types";
import RowActions from "../../../(dashboard)/products/_components/row-actions";
import { deleteOrder } from "@/server/actions/order";
import EditOrderForm from "./edit-order-form";
import type { Dispatch, SetStateAction } from "react";

const OrderCard = ({ order }: { order: OrderType }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-200 text-emerald-950 border-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-950 border-amber-200";
      case "shipped":
        return "bg-sky-100 text-sky-950 border-sky-200";
      case "cancelled":
        return "bg-rose-100 text-rose-950 border-rose-200";
      case "refunded":
        return "bg-slate-200 text-slate-950 border-slate-300";
      default:
        return "bg-slate-200 text-slate-950 border-slate-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-emerald-200 bg-emerald-100 text-emerald-950";
      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-950";
      case "failed":
        return "border-rose-200 bg-rose-100 text-rose-950";
      default:
        return "border-slate-200 bg-slate-100 text-slate-950";
    }
  };

  const getPaymentProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "qpay":
        return "📱";
      case "cash":
        return "💵";
      case "transfer":
        return "🏦";
      default:
        return "💳";
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        {/* Header section */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/10 p-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">{order.customerPhone}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>#{order.orderNumber}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <Badge
            className={`shrink-0 ${getStatusColor(order.status)} px-2 py-0.5 text-xs`}
          >
            {order.status}
          </Badge>
        </div>

        {/* Main content */}
        <div className="p-2">
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="mb-2 sm:mb-0 sm:flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Products
                  </h4>
                  <RowActions
                    id={order.id}
                    renderEditComponent={({
                      setDialogOpen,
                    }: {
                      setDialogOpen: Dispatch<SetStateAction<boolean>>;
                    }) => (
                      <EditOrderForm
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
                <div className="flex items-center gap-2">
                  {order.paymentStatus &&
                    order.paymentStatus[0] &&
                    order.paymentProvider?.[0] && (
                      <Badge
                        className={`flex h-5 items-center gap-1.5 rounded-md px-2 text-[12px] ${getPaymentStatusColor(
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
                  <span className="flex items-center gap-1 text-sm font-bold text-[#FFDC58]">
                    ₮{order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-1 flex gap-2 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible">
                {order.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex min-w-[150px] items-center gap-1 rounded border p-1 text-xs"
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
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-muted-foreground">
                        x{product.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
