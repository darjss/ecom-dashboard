"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addCategorySchema } from "@/lib/zod/schema";
import { useAction } from "@/hooks/use-action";
import { FormWrapper } from "@/components/form-wrapper";
import { Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SubmitButton from "@/components/submit-button";
import { addCategory, updateCategory } from "@/server/actions/category";
import type { CategorySelectType } from "@/server/db/schema";

interface CategoryFormProps {
  category?: CategorySelectType;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const CategoryForm = ({ category, setDialogOpen }: CategoryFormProps) => {
  const [action] = useAction(category ? updateCategory : addCategory);

  return (
    <div className="w-full bg-background px-2 py-3 sm:px-4 sm:py-6">
      <FormWrapper
        formAction={action}
        schema={addCategorySchema}
        initialData={category}
        setDialogOpen={setDialogOpen}
        className="space-y-4 sm:space-y-6"
      >
        {(form) => (
          <div className="space-y-4 sm:space-y-6">
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-3 sm:p-6">
                <h3 className="mb-3 text-base font-semibold text-primary sm:mb-4 sm:text-lg">
                  Category Details
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Category Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter category name"
                            {...field}
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
                {category ? "Update Category" : "Add Category"}
              </SubmitButton>
            </div>
          </div>
        )}
      </FormWrapper>
    </div>
  );
};

export default CategoryForm;
