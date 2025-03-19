import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const PendingOrdersList = ({ orders }: { orders: any[] }) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Pending Orders</CardTitle>
          </div>
          <Badge variant="default" className="ml-auto">
            {orders.length} pending
          </Badge>
        </div>
        <CardDescription>Orders awaiting processing</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[220px]">
          <div className="space-y-3">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                        {order.customerPhone}
                      </div>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {order.customerPhone}
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="max-w-[150px] truncate text-xs text-muted-foreground">
                          {order.address}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {order.total.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </p>
                    <Badge
                      variant={
                        order.status === "pending" ? "default" : "default"
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No pending orders</p>
                <p className="text-xs text-muted-foreground">
                  All orders have been processed
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={"orders?status=pending"}>
          <Button variant="default" size="sm" className="w-full">
            View All Orders
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
export default PendingOrdersList;
