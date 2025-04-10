"use client";

import { Package, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  const unitCostDollars = purchase.unitCost / 100;
  const totalCostDollars =
    (purchase.unitCost * purchase.quantityPurchased) / 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-muted-foreground" />
            {purchase.product.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4" />
            {new Date(purchase.createdAt).toLocaleDateString()}
            <Badge variant="neutral" className="ml-2 font-mono text-xs">
              ID: {purchase.id}
            </Badge>
          </CardDescription>
        </div>
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
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-0 sm:flex-row sm:items-center sm:justify-around">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="text-sm font-medium">{purchase.quantityPurchased}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Unit Cost</p>
            <p className="text-sm font-medium">${unitCostDollars.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-base font-semibold">
              ${totalCostDollars.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseCard;
