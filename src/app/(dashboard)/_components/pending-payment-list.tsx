import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";  
import { CreditCard, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

const PendingPaymentsList = ({ payments }: { payments: any[] }) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Pending Payments</CardTitle>
          </div>
          <Badge variant="default" className="ml-auto">
            {payments.length} pending
          </Badge>
        </div>
        <CardDescription>Payments awaiting confirmation</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[220px]">
          <div className="space-y-3">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      {payment.provider === "qpay" ? (
                        <CreditCard className="h-4 w-4 text-primary" />
                      ) : payment.provider === "transfer" ? (
                        <DollarSign className="h-4 w-4 text-primary" />
                      ) : (
                        <Clock className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {payment.provider} Payment
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">
                          Order #{payment.orderId}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge
                      variant={
                        payment.status === "pending" ? "default" : "neutral"
                      }
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <CreditCard className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No pending payments</p>
                <p className="text-xs text-muted-foreground">
                  All payments have been processed
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
export default PendingPaymentsList