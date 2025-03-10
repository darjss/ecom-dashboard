"use client";

import { Package, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PurchaseSelectType } from "@/server/db/schema";
import RowActions from "../../../(dashboard)/products/_components/row-actions";
import { deletePurchase } from "@/server/actions/purchases";
import EditPurchaseForm from "./edit-purchase-form";
import type { Dispatch, SetStateAction } from "react";

const PurchaseCard = ({
  purchase,
}: {
  purchase: PurchaseSelectType & {
    product: { name: string; id: number; price: number };
  };
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {purchase.product.name}
              </span>
            </div>
            <Badge variant="neutral" className="text-xs">
              #{purchase.id}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground">Unit:</span>
                <span className="font-medium">
                  ${(purchase.unitCost / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground">Qty:</span>
                <span className="font-medium">
                  {purchase.quantityPurchased}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">
                  $
                  {(
                    (purchase.unitCost * purchase.quantityPurchased) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 border-t pt-2">
            <RowActions
              id={purchase.id}
              renderEditComponent={({
                setDialogOpen,
              }: {
                setDialogOpen: Dispatch<SetStateAction<boolean>>;
              }) => (
                <EditPurchaseForm
                  purchase={purchase}
                  setDialogOpen={setDialogOpen}
                />
              )}
              deleteFunction={deletePurchase}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseCard;
