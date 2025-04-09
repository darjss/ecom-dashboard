"use client";
import { Loader2Icon, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { useQuery } from "@tanstack/react-query";
import { searchOrder } from "@/server/actions/order";
import { ShapedOrder } from "@/server/actions/utils";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SearchBarProps {
  // onResultClick?: () => void;
}

const SearchBar = ({}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedValue(value);
    }, 500),
    [],
  );

  const { data, isFetching } = useQuery({
    queryKey: ["orderSearch", debouncedValue],
    queryFn: () => searchOrder(debouncedValue),
    staleTime: 5 * 60 * 1000,
    enabled: !!debouncedValue,
  });

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search Orders (ID, Phone, Name)..."
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
            {data.map((order: ShapedOrder) => (
              <button
                key={order.id}
                className="flex w-full items-center space-x-2 px-3 py-2 text-left transition duration-200 hover:bg-gray-100 sm:space-x-3 sm:px-4"
                onClick={() => {
                  setInputValue("");
                  setDebouncedValue("");
                  redirect(`/orders?query=${debouncedValue}`);
                }}
                type="button"
              >
                <div className="grid h-10 w-10 shrink-0 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md border border-gray-200 bg-gray-50 sm:h-12 sm:w-12">
                  {order.products.slice(0, 4).map((product, index) => (
                    <div
                      key={`${order.id}-img-${product.productId || index}-${index}`}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name || "Product image"}
                        fill
                        sizes="20px"
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ))}
                  {Array.from({
                    length: Math.max(0, 4 - order.products.length),
                  }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="h-full w-full bg-gray-100"
                    ></div>
                  ))}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium sm:text-base">
                    Order #{order.orderNumber} - {order.customerPhone}
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    Total: ${order.total.toFixed(2)} - Status: {order.status}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {data?.length === 0 && inputValue && !isFetching && (
          <div className="absolute left-0 right-0 z-[100] mt-1 w-full rounded-md border border-gray-200 bg-white p-3 text-center shadow-lg">
            No orders found matching "{inputValue}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
