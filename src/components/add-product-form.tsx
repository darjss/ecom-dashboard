"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormWrapper } from "./formWrapper";
import SubmitButton from "./submit-button";
import { addProductSchema, addProductType } from "@/lib/zod/schema";
import {
  addBrandsAndCategories,
  addProduct,
  BrandType,
  CategoryType,
} from "@/server/queries";
import { useAction } from "@/hooks/use-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

interface AddProductFormProps {
  categories: CategoryType;
  brands: BrandType;
}

const AddProductForm = ({ categories, brands }: AddProductFormProps) => {
  const [action, isLoading] = useAction(addProduct);
  return (
    <div className="h-2/4 w-1/3 rounded-lg bg-slate-300 p-4">
      <Button onClick={addBrandsAndCategories}>
        Add Brands and Categories
      </Button>
      <FormWrapper
        formAction={action}
        schema={addProductSchema}
        className="space-y-4"
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="P" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Input placeholder="P1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand, index) => {
                        return (
                          <SelectItem key={index} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitButton isPending={isLoading}>Add Product</SubmitButton>
          </>
        )}
      </FormWrapper>
    </div>
  );
};

export default AddProductForm;
