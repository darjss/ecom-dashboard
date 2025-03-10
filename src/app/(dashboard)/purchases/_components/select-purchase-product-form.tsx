"use client";

import { useState, useCallback } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { XIcon, SearchIcon, PackageIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductSearchForOrderType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { searchProductByNameForOrder } from "@/server/actions/product";
import { debounce } from "lodash";
import type { addPurchaseType } from "@/lib/zod/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const SelectPurchaseProductForm = ({
  form,
}: {
  form: UseFormReturn<addPurchaseType>;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchValue(value);
    }, 500),
    [],
  );

  const { data, isFetching } = useQuery({
    queryKey: ["productSearch", debouncedSearchValue],
    queryFn: () => searchProductByNameForOrder(debouncedSearchValue),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!debouncedSearchValue,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const handleSelectProduct = (product: ProductSearchForOrderType) => {
    const existingIndex = fields.findIndex(
      (field: any) => field.productId === product.id,
    );

    if (existingIndex === -1) {
      append({
        productId: product.id,
        quantity: 1,
        unitCost: product.price,
        name: product.name,
      });
    }
    setInputValue("");
    setDebouncedSearchValue("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="relative space-y-4">
      <div className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search products..."
            className="w-full rounded-md border-2 border-gray-200 py-2 pl-10 pr-4 transition duration-200 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>
        {isFetching && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}
        {data !== undefined && data?.length > 0 && inputValue && (
          <div className="absolute left-0 right-0 z-[100] mt-1 max-h-[400px] w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {data.map((product) => (
              <button
                key={product.id}
                className="flex w-full items-center space-x-2 px-3 py-2 text-left transition duration-200 hover:bg-gray-100 sm:space-x-3 sm:px-4"
                onClick={() => handleSelectProduct(product)}
                type="button"
              >
                <img
                  src={
                    product.images[0]?.url ||
                    "/placeholder.svg?height=48&width=48" ||
                    "/placeholder.svg"
                  }
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
                />
                <div className="flex-grow">
                  <p className="text-sm font-medium sm:text-base">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    Current Price: ${(product.price / 100).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        {data?.length === 0 && inputValue && !isFetching && (
          <div className="absolute left-0 right-0 z-[100] mt-1 w-full rounded-md border border-gray-200 bg-white p-3 text-center shadow-lg">
            No products found matching "{inputValue}"
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="mt-4 space-y-4">
          <h2 className="flex items-center text-base font-semibold sm:text-lg">
            <PackageIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Selected
            Products
          </h2>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium sm:text-base">
                    {field.name}
                  </h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 w-8"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`products.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Quantity to Purchase
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            min={1}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`products.${index}.unitCost`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Unit Cost (in cents)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter unit cost"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            min={1}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectPurchaseProductForm;
