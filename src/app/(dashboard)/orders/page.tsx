import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { parseAsInteger, parseAsString, parseAsJson } from "nuqs/server"; // Use server parsers
import OrderGrid from "./_components/order-grid";
import { getPaginatedOrders, searchOrder } from "@/server/actions/order";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { createLoader } from "nuqs/server";
import type { SearchParams } from "nuqs/server";
import { OrderStatusType, PaymentStatusType } from "@/lib/types";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
import { createParser } from "nuqs/server";

// Define cursor type to match grid and backend
type OrderCursor = {
  id: number;
  total?: number;
  createdAt?: string | Date;
} | null;

// Create a proper parser for the cursor type first
const parseAsCursor = createParser({
  parse: (value: string | null) => {
    if (!value || value === "null") return null; // Handle serialized null
    try {
      const parsed = JSON.parse(value);
      // Add more robust validation if needed
      if (parsed === null) return null;
      if (typeof parsed !== "object") return null;
      if (!("id" in parsed) || typeof parsed.id !== "number") return null;
      return parsed as OrderCursor;
    } catch {
      return null;
    }
  },
  // Serialize null as the string 'null' or handle differently if needed
  serialize: (value: OrderCursor): string => {
    return JSON.stringify(value); // This correctly handles null -> 'null'
  },
});

const orderPageParams = {
  sort: parseAsString.withDefault(""),
  query: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""), // Keep as string
  payment: parseAsString.withDefault(""), // Keep as string
  dir: parseAsString.withDefault("asc"),
  cursor: parseAsCursor, // Remove withDefault here
};

const loadSearchParams = createLoader(orderPageParams);

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: PageProps) => {
  const queryClient = new QueryClient();
  const {
    query,
    status: rawStatus,
    payment: rawPayment,
    sort,
    dir,
    cursor: rawCursor, // Get raw cursor
  } = await loadSearchParams(searchParams);

  // Validate and cast status/payment here
  const payment =
    rawPayment === "" ? undefined : (rawPayment as PaymentStatusType);
  const status = rawStatus === "" ? undefined : (rawStatus as OrderStatusType);
  // Handle potentially undefined cursor from loader, default to null
  const cursor = rawCursor === undefined ? null : rawCursor;

  // Prefetch the initial data
  await queryClient.prefetchQuery({
    // Use validated status/payment and processed cursor in queryKey and queryFn
    queryKey: ["orders", status, payment, sort, dir, query, cursor],
    queryFn: async () => {
      if (query) {
        const searchResult = await searchOrder(query);
        if ("message" in searchResult && "error" in searchResult) {
          throw new Error(`Error fetching orders: ${searchResult.error}`);
        }

        if (!Array.isArray(searchResult)) {
          return {
            orders: [],
            nextCursor: null,
          };
        }

        return {
          orders: searchResult,
          nextCursor: null, // Search results don't have pagination
        };
      }

      const result = await getPaginatedOrders(
        PRODUCT_PER_PAGE,
        payment, // Use validated payment
        status, // Use validated status
        sort || undefined,
        dir as "asc" | "desc",
        cursor, 
      );

      if ("message" in result && "error" in result) {
        throw new Error(`Error fetching orders: ${result.error}`);
      }

      return {
        orders: result.orders,
        nextCursor: result.nextCursor,
      };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={3} />}>
        <OrderGrid />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
