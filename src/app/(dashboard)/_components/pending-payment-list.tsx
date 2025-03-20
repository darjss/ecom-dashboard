import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getPaymentProviderIcon } from "@/lib/utils";
import { connection } from "next/server";

const PendingPaymentsList = async ({ payments }: { payments: any[] }) => {
  await connection();
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Pending Payments</CardTitle>
          </div>
          <Badge variant="default" className="ml-auto">
            {payments.length} pending
          </Badge>
        </div>
        <CardDescription>Payments awaiting confirmation</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-0">
        <ScrollArea className="h-[250px] px-6 sm:h-[280px] md:h-[320px]">
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="group relative rounded-lg border border-border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {getPaymentProviderIcon(payment.provider)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium capitalize">
                            {payment.provider} Payment
                          </p>
                          <Badge className="text-xs">{payment.status}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                          <p className="truncate text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(payment.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium">
                        {payment.amount?.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        }) || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Order #{payment.orderId} 
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 sm:flex-row">
                    <Link href={`/payments/${payment.id}`} className="w-full">
                      <Button variant="neutral" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <div className="flex w-full flex-col gap-2 sm:flex-row">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        // onClick={() => {
                        //   /* Handle reject payment */
                        // }}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        // onClick={() => {
                        //   /* Handle approve payment */
                        // }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-2 h-10 w-10 text-emerald-500" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground">
                  No pending payments to process
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href="/payments?status=pending" className="w-full">
          <Button variant="neutral" size="sm" className="w-full">
            View All Payments
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PendingPaymentsList;
