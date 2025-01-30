"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addProductSchema } from "@/lib/zod/schema";
import { addProduct, BrandType, CategoryType, ProductType } from "@/server/queries";
import { useAction } from "@/hooks/use-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormWrapper } from "@/components/form-wrapper";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SubmitButton from "@/components/submit-button";
import { status } from "@/lib/constants";
import { AddImageForm } from "./image-form";
import { parseProduct } from "@/lib/zod/utils";

interface AddProductFormProps {
  product: ProductType;
  categories: CategoryType;
  brands: BrandType;
}

const EditProductForm = ({ categories, brands, product }: AddProductFormProps) => {
  const [action, isLoading] = useAction(addProduct);
  const parsedProducts = parseProduct(product);
  return (
    <div className="mx-auto w-full max-w-6xl bg-background p-4 sm:p-6 lg:p-8 overflow-auto">
      <FormWrapper
        formAction={action}
        schema={addProductSchema}
        initialData={parsedProducts}
        className="space-y-8"
      >
        {(form) => (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <Card className="overflow-auto shadow-md transition-shadow duration-300 hover:shadow-lg">
              <CardContent className="space-y-4 p-6">
                <h3 className="mb-4 text-xl font-semibold">Product Details</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
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
                        <Textarea
                          placeholder="Enter product description"
                          {...field}
                          className="h-20 resize-none"
                        />
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
                        defaultValue={field.value || ""}
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
                        defaultValue={field.value || ""}
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
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || status[0]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>{field.value}</SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {status.map((statusOption) => (
                            <SelectItem key={statusOption} value={statusOption}>
                              {statusOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
              <CardContent className="space-y-4 p-6">
                <h3 className="mb-4 text-xl font-semibold">Pricing & Stock</h3>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          placeholder="Enter price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter stock quantity"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="potency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Potency</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 100mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 30 capsules" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Intake</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter daily intake"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-2">
              <CardContent className="space-y-4 p-6">
                <h3 className="mb-4 text-xl font-semibold">Product Images</h3>
                <Suspense fallback={<div>Loading...</div>}>
                  <AddImageForm form={form} />
                </Suspense>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end lg:col-span-2">
              <SubmitButton
                isPending={isLoading}
                className="w-full px-8 py-3 text-lg font-semibold transition-colors duration-300 hover:bg-primary/90 sm:w-auto"
              >
                Add Product
              </SubmitButton>
            </div>
          </div>
        )}
      </FormWrapper>
    </div>
  );
};

export default EditProductForm;
