"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  MinusIcon,
  PlusIcon,
  XIcon,
  SearchIcon,
  ShoppingCartIcon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/server/actions/product";
import { toast } from "sonner";

const SelectProductForm = ({ form }: { form: UseFormReturn<any> }) => {
  // Properly handle all states from the query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => getAllProducts(),
    // Add some retry logic and staleTime for better UX
    // retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const [results, setResults] = useState<ProductType[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const handleQuantityChange = (index: number, type: "add" | "minus") => {
    const currentValue = form.getValues(`products.${index}.quantity`);
    const newQuantity =
      type === "add" ? currentValue + 1 : Math.max(1, currentValue - 1);
    update(index, { ...fields[index], quantity: newQuantity });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (!data) return;

    const searchLower = value.toLowerCase();
    setResults(
      searchLower === ""
        ? []
        : data.filter((product) =>
            product.name.toLowerCase().includes(searchLower),
          ),
    );
  };

  const handleSelectProduct = (product: ProductType) => {
    // Check if product is already selected
    const existingIndex = fields.findIndex(
      (field: any) => field.productId === product.id,
    );

    if (existingIndex >= 0) {
      // Increment quantity if already selected
      handleQuantityChange(existingIndex, "add");
    } else {
      // Add new product
      append({
        productId: product.id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.images[0]?.url,
        stock: product.stock
      });
    }

    // Clear search results
    setResults([]);
    setSearchValue("");
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-white p-4 shadow-md">
        <Loader2Icon className="mr-2 h-6 w-6 animate-spin text-primary" />
        <p>Loading products...</p>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return toast("Error fetching product info add new products");
  }

  // Handle no data
  if (!data || data.length === 0) {
    return toast("Error fetching product info add new products");
  }

  return (
    <div className="relative space-y-4 rounded-lg bg-white p-4 shadow-md sm:p-6">
      <div className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search products..."
            className="w-full rounded-md border-2 border-gray-200 py-2 pl-10 pr-4 transition duration-200 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {results.length > 0 && (
          <div className="absolute left-0 right-0 z-[100] mt-1 max-h-[400px] w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {results.map((product) => (
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
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h2 className="mb-3 flex items-center text-base font-semibold sm:mb-4 sm:text-lg">
            <ShoppingCartIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Selected
            Products
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {fields.map((field, index) => {
              const product = form.getValues(`products.${index}`);
              return (
                <div
                  key={field.id}
                  className="flex flex-col rounded-lg bg-gray-50 p-3 shadow-sm transition duration-200 hover:shadow-md sm:flex-row sm:items-center sm:space-x-4 sm:p-4"
                >
                  <div className="flex items-center space-x-3 pb-3 sm:pb-0">
                    <img
                      src={
                        product.image || "/placeholder.svg?height=64&width=64"
                      }
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover sm:h-16 sm:w-16"
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-medium sm:text-base">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 sm:text-sm">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 pt-2 sm:ml-auto sm:border-t-0 sm:pt-0">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button
                        type="button"
                        variant="default"
                        size="icon"
                        onClick={() => handleQuantityChange(index, "minus")}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        disabled={product.quantity <= 1}
                      >
                        <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium sm:w-8 sm:text-base">
                        {product.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="default"
                        size="icon"
                        onClick={() => handleQuantityChange(index, "add")}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        disabled={product.quantity > product.stock}
                      >
                        <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="ml-3 h-7 w-7 transition duration-200 hover:bg-red-100 hover:text-red-600 sm:h-8 sm:w-8"
                    >
                      <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectProductForm;
