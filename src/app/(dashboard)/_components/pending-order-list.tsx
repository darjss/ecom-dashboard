// "use client"
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card, CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  User2Icon,
  Phone,
  MapPin,
  MoreHorizontal, CreditCard
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { connection } from "next/server";
import { ShapedOrder } from "@/server/actions/utils";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PendingOrdersList = async ({ orders }: { orders: ShapedOrder[] }) => {
  await connection();
  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 sm:h-8 sm:w-8">
              <ShoppingBag className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            </div>
            <CardTitle className="text-sm sm:text-base">
              Pending Orders
            </CardTitle>
          </div>
          <Badge variant="default" className="ml-auto text-xs">
            {orders.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow px-0">
        <ScrollArea className="h-[320px] px-3 sm:h-[350px] sm:px-4 md:h-[380px] md:px-6">
          <div className="space-y-3 sm:space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="group relative rounded-lg border border-border p-2.5 transition-all hover:border-primary/50 hover:shadow-sm sm:p-3 md:p-4"
                >
                  {/* Status Badge
                  <div className="absolute right-2 top-2">
                    <Badge
                      className={`px-1.5 py-0.5 text-[10px] sm:text-xs ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </Badge>
                  </div> */}

                  {/* Customer Info */}
                  <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0 border sm:h-9 sm:w-9 md:h-10 md:w-10">
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                        <User2Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-medium sm:text-sm">
                          #{order.orderNumber}
                        </p>
                        <Badge
                          variant="neutral"
                          className="hidden h-4 border-dashed px-1 text-[10px] sm:inline-flex"
                        >
                          💵
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <div className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5 flex-shrink-0 text-muted-foreground sm:h-3 sm:w-3" />
                          <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                            {order.customerPhone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 flex-shrink-0 text-muted-foreground sm:h-3 sm:w-3" />
                          <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                            {formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="neutral"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0 sm:h-7 sm:w-7 md:h-8 md:w-8"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 sm:w-48">
                        <DropdownMenuItem className="text-xs sm:text-sm">
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs sm:text-sm">
                          Call customer
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs sm:text-sm">
                          Cancel order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Products Preview */}
                  <div className="mb-2 overflow-hidden rounded-md border bg-muted/30 sm:mb-3">
                    <div className="scrollbar-none flex items-center gap-1 overflow-x-auto p-1.5 sm:p-2">
                      {order.products.slice(0, 4).map((product, idx) => (
                        <div
                          key={`${order.id}-${product.productId}-${idx}`}
                          className="relative flex-shrink-0"
                        >
                          <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-background sm:h-12 sm:w-12 md:h-14 md:w-14">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-[9px] text-muted-foreground sm:text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <Badge
                            variant="neutral"
                            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[9px] sm:h-5 sm:w-5 sm:text-[10px]"
                          >
                            {product.quantity}
                          </Badge>
                        </div>
                      ))}
                      {order.products.length > 4 && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/50 text-[10px] font-medium text-muted-foreground sm:h-12 sm:w-12 md:h-14 md:w-14">
                          +{order.products.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Details - Simplified for mobile */}
                  <div className="mb-2 space-y-1 sm:mb-3 sm:space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                        <p className="text-[10px] text-muted-foreground sm:text-xs">
                          {order.paymentProvider}
                        </p>
                      </div>
                      <p className="text-xs font-medium sm:text-sm">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                      <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                        {order.address}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-xs"
                      // onClick={() => updateOrderStatus(order.id, "pending")}
                    >
                      Process
                    </Button>
                    <Button
                      variant="neutral"
                      size="sm"
                      className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-xs"
                      // onClick={() => updateOrderStatus(order.id, "shipped")}
                    >
                      Deliver
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-2 h-8 w-8 text-emerald-500 sm:h-10 sm:w-10" />
                <p className="text-xs font-medium sm:text-sm">All caught up!</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  No pending orders to process
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-1 sm:pt-2">
        <Link href="/orders?status=pending" className="w-full">
          <Button
            variant="neutral"
            size="sm"
            className="h-7 w-full text-xs sm:h-8 sm:text-sm"
          >
            View All Orders
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PendingOrdersList;
