"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  MinusIcon,
  PlusIcon,
  XIcon,
  SearchIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductType } from "@/lib/types";

 const SelectProductForm = ({
  form,
  products,
}: {
  form: UseFormReturn<any>;
  products: ProductType[];
}) => {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "products",
  });
  const [results, setResults] = useState<ProductType[]>([]);

  const handleQuantityChange = (index: number, type: "add" | "minus") => {
    const currentValue = form.getValues(`products.${index}.quantity`);
    const newQuantity =
      type === "add" ? currentValue + 1 : Math.max(1, currentValue - 1);
    update(index, { ...fields[index], quantity: newQuantity });
  };

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow-md sm:p-6">
      <div className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search products..."
            className="w-full rounded-md border-2 border-gray-200 py-2 pl-10 pr-4 transition duration-200 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            onChange={(e) => {
              const searchValue = e.target.value.toLowerCase();
              setResults(
                searchValue === ""
                  ? []
                  : products.filter((product) =>
                      product.name.toLowerCase().includes(searchValue),
                    ),
              );
            }}
          />
        </div>
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
            {results.map((product) => (
              <button
                key={product.id}
                className="flex w-full items-center space-x-2 px-3 py-2 text-left transition duration-200 hover:bg-gray-100 sm:space-x-3 sm:px-4"
                onClick={() => {
                  append({
                    productId: product.id,
                    quantity: 1,
                    price: product.price,
                    name: product.name,
                    image: product.images[0]?.url,
                  });
                  setResults([]);
                }}
              >
                <img
                  src={product.images[0]?.url || "/placeholder.svg"}
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
                />
                <div className="flex-grow">
                  <p className="text-sm font-medium sm:text-base">{product.name}</p>
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
            <ShoppingCartIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Selected Products
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {fields.map((field, index) => {
              const product = form.getValues(`products.${index}`);
              return (
                <div
                  key={field.id}
                  className="flex flex-col rounded-lg bg-gray-50 p-3 shadow-sm transition duration-200 hover:shadow-md sm:flex-row sm:items-center sm:p-4 sm:space-x-4"
                >
                  <div className="flex items-center space-x-3 pb-3 sm:pb-0">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover sm:h-16 sm:w-16"
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-medium sm:text-base">{product.name}</p>
                      <p className="text-xs text-gray-500 sm:text-sm">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 sm:border-t-0 sm:pt-0 sm:ml-auto">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(index, "minus")}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium sm:w-8 sm:text-base">
                        {product.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(index, "add")}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="ml-3 text-red-500 transition duration-200 hover:bg-red-100 hover:text-red-600 h-7 w-7 sm:h-8 sm:w-8"
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
export default SelectProductForm