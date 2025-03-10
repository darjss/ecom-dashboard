"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FormWrapper } from "@/components/form-wrapper";
import { editPurchaseSchema } from "@/lib/zod/schema";
import { useAction } from "@/hooks/use-action";
import { updatePurchase } from "@/server/actions/purchases";
import type { PurchaseSelectType } from "@/server/db/schema";
import type { Dispatch, SetStateAction } from "react";
import SelectPurchaseProductForm from "./select-purchase-product-form";
import SubmitButton from "@/components/submit-button";

const EditPurchaseForm = ({
  purchase,
  setDialogOpen,
}: {
  purchase: PurchaseSelectType & {
    product: { name: string; id: number; price: number };
  };
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [updateAction] = useAction(updatePurchase);

  return (
    <div className="mx-auto w-full max-w-3xl bg-background p-4 sm:p-6 md:max-w-4xl lg:max-w-5xl">
      <FormWrapper
        formAction={updateAction}
        schema={editPurchaseSchema}
        className="space-y-6"
        initialData={{
          id: purchase.id,
          products: [
            {
              productId: purchase.productId,
              quantity: purchase.quantityPurchased,
              unitCost: purchase.unitCost,
              name: purchase.product.name,
            },
          ],
        }}
        setDialogOpen={setDialogOpen}
      >
        {(form) => (
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="mb-4 text-lg font-semibold text-primary">
                  Products
                </h3>
                <SelectPurchaseProductForm form={form} />
              </CardContent>
            </Card>

            <div className="sticky bottom-0 bg-background py-4">
              <SubmitButton
                isPending={form.formState.isSubmitting}
                className="w-full rounded-md px-6 py-3 text-base font-medium transition-colors duration-300 hover:bg-primary/90"
              >
                Update Purchase
              </SubmitButton>
            </div>
          </div>
        )}
      </FormWrapper>
    </div>
  );
};

export default EditPurchaseForm;
