import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { parseAsInteger, parseAsString } from "nuqs/server"; // Use server parsers
import OrderGrid from "./_components/order-grid";
import { getPaginatedOrders, searchOrder } from "@/server/actions/order";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { createLoader } from "nuqs/server";
import type { SearchParams } from "nuqs/server";
import { OrderStatusType, PaymentStatusType } from "@/lib/types";

interface PageProps{
  searchParams: Promise<SearchParams>;
};

const orderPageParams = {
  page: parseAsInteger.withDefault(1),
  query: parseAsString.withDefault(""),
  status: parseAsString,
  dir :parseAsString.withDefault("asc"),
  payment: parseAsString,
  sort: parseAsString.withDefault(""),  

}

const loadSearchParams = createLoader(orderPageParams);

export default async function Page({
  searchParams,
}:PageProps) {
  const queryClient = new QueryClient();
const {page, query, status, dir, payment, sort} = await loadSearchParams(searchParams);

  const queryKey = [
    "orders",
    page,
    status,
    payment,
    sort,
    dir,
    query,
  ];

  await queryClient.prefetchQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (query) {
        try {
          const searchResult = await searchOrder(query);
          if (!Array.isArray(searchResult)) {
            console.error("Search error:", searchResult); 
            return { orders: [], total: 0 }; 
          }
          return {
            orders: searchResult,
            total: searchResult.length,
          };
        } catch (error) {
          console.error("Failed to search orders:", error);
          return { orders: [], total: 0 }; 
        }
      }

      try {
        const result = await getPaginatedOrders(
          page,
          PRODUCT_PER_PAGE,
          payment as PaymentStatusType ?? undefined ,
          status as OrderStatusType ?? undefined,
          sort ?? undefined,
          dir as "asc" | "desc",
        );

    
        if ("error" in result) {
          console.error("Pagination error:", result.error);
          return { orders: [], total: 0 };
        }
        return result; 
      } catch (error) {
        console.error("Failed to fetch paginated orders:", error);
        return { orders: [], total: 0 };
      }
    },
    staleTime: 1000 * 60 * 5, 
  });

  return (
    <div className="space-y-4">
      {/* Pass the dehydrated state to the client */}
      <HydrationBoundary state={dehydrate(queryClient)}>

        <OrderGrid />
      </HydrationBoundary>
    </div>
  );
}
