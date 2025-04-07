"use client";
import { Loader2Icon, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { useQuery } from "@tanstack/react-query";
import { searchProductByNameForOrder } from "@/server/actions/product";
import { redirect } from "next/navigation";

interface SearchBarProps {
  isMobile?: boolean;
}

const SearchBar = ({ isMobile }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedValue(value);
    }, 500),
    [],
  );

  const { data, isFetching } = useQuery({
    queryKey: ["productSearch", debouncedValue],
    queryFn: () => searchProductByNameForOrder(debouncedValue),
    staleTime: 5 * 60 * 1000,
    enabled: !!debouncedValue,
  });

  return (
    <div className={`relative ${isMobile ? "w-full" : "hidden w-96 md:block"}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          className="h-10 w-full bg-transparent pl-10 pr-4"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);
            debouncedSearch(value);
          }}
        />
      </div>

      {/* Search Results and Loading States */}
      <div className="relative">
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
                onClick={() => redirect(`/products?query=${product.name}`)}
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

        {data?.length === 0 && inputValue && !isFetching && (
          <div className="absolute left-0 right-0 z-[100] mt-1 w-full rounded-md border border-gray-200 bg-white p-3 text-center shadow-lg">
            No products found matching "{inputValue}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
