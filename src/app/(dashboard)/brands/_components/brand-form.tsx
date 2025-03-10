"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addBrandSchema } from "@/lib/zod/schema";
import { useAction } from "@/hooks/use-action";
import { FormWrapper } from "@/components/form-wrapper";
import { Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SubmitButton from "@/components/submit-button";
import { addBrand, updateBrand } from "@/server/actions/brand";
import type { BrandSelectType } from "@/server/db/schema";

interface BrandFormProps {
  brand?: BrandSelectType;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const BrandForm = ({ brand, setDialogOpen }: BrandFormProps) => {
  const [action] = useAction(brand ? updateBrand : addBrand);

  return (
    <div className="w-full bg-background px-2 py-3 sm:px-4 sm:py-6">
      <FormWrapper
        formAction={action}
        schema={addBrandSchema}
        initialData={brand}
        setDialogOpen={setDialogOpen}
        className="space-y-4 sm:space-y-6"
      >
        {(form) => (
          <div className="space-y-4 sm:space-y-6">
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-3 sm:p-6">
                <h3 className="mb-3 text-base font-semibold text-primary sm:mb-4 sm:text-lg">
                  Brand Details
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Brand Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter brand name"
                            {...field}
                            className="h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Logo URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter logo URL"
                            {...field}
                            value={field.value || ""}
                            className="h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="sticky bottom-0 bg-background py-3 sm:py-4">
              <SubmitButton
                isPending={form.formState.isSubmitting}
                className="h-9 w-full rounded-md px-4 text-sm font-medium transition-colors duration-300 hover:bg-primary/90 sm:h-10 sm:px-6 sm:text-base"
              >
                {brand ? "Update Brand" : "Add Brand"}
              </SubmitButton>
            </div>
          </div>
        )}
      </FormWrapper>
    </div>
  );
};

export default BrandForm;
