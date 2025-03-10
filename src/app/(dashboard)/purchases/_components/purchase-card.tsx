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
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{purchase.product.name}</span>
            </div>
            <Badge variant="default" className="font-medium">
              ID: {purchase.id}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Unit Cost</span>
                <span className="font-medium">
                  ${(purchase.unitCost / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Quantity Purchased
                </span>
                <span className="font-medium">
                  {purchase.quantityPurchased}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Total Cost
                </span>
                <span className="font-medium">
                  $
                  {(
                    (purchase.unitCost * purchase.quantityPurchased) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Purchase Date
                </span>
                <span className="font-medium">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t pt-2">
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
