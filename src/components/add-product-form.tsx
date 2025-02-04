"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SubmitButton from "./submit-button";
import { addProductSchema } from "@/lib/zod/schema";
import { addProduct, BrandType, CategoryType } from "@/server/queries";
import { useAction } from "@/hooks/use-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FormWrapper } from "./form-wrapper";
import { useFieldArray } from "react-hook-form";

interface AddProductFormProps {
  categories: CategoryType;
  brands: BrandType;
}

const AddProductForm = ({ categories, brands }: AddProductFormProps) => {
  const [action, isLoading] = useAction(addProduct);

  return (
    <div className="h-2/4 w-1/3 rounded-lg bg-slate-300 p-4">
      <FormWrapper
        formAction={action}
        schema={addProductSchema}
        className="space-y-4"
      >
        {(form) => {
            const {fields, append, remove}=useFieldArray({
              control: form.control,
              name: "variants",
            })
          
          return (
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
                        {brands.map((brand, index) => (
                          <SelectItem key={index} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Category</FormLabel>
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
                          <SelectItem
                            key={index}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.map((field,index)=>(
                <div key={field.id}>
                   <FormField
                control={form.control}
                name={`variants.${index}.potency`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Variation potency</FormLabel>
                    <FormControl>
                      <Input placeholder="100mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name={`variants.${index}.capsuleCount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Capsule Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="240"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                 <FormField
                control={form.control}
                name={`variants.${index}.stock`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`varaints.${index}.price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={1000}
                        placeholder="1000%"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              )
                
              )}
              <SubmitButton isPending={isLoading}>Add Product</SubmitButton>
            </>
          );
        }}
      </FormWrapper>
    </div>
  );
};

export default AddProductForm;
