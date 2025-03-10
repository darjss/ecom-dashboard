"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FormWrapper } from "@/components/form-wrapper";
import { addPurchaseSchema } from "@/lib/zod/schema";
import { useAction } from "@/hooks/use-action";
import { addPurchase } from "@/server/actions/purchases";
import SelectPurchaseProductForm from "./select-purchase-product-form";
import SubmitButton from "@/components/submit-button";

const AddPurchaseForm = () => {
  const [action] = useAction(addPurchase);

  return (
    <div className="mx-auto w-full max-w-3xl bg-background p-4 sm:p-6 md:max-w-4xl lg:max-w-5xl">
      <FormWrapper
        formAction={action}
        schema={addPurchaseSchema}
        className="space-y-6"
      >
        {(form) => (
          <div className="space-y-6">
            <Card className="overflow-visible shadow-sm">
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
                Complete Purchase
              </SubmitButton>
            </div>
          </div>
        )}
      </FormWrapper>
    </div>
  );
};

export default AddPurchaseForm;
