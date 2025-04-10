import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { parseAsString, parseAsInteger } from "nuqs/server"; // Use server parsers
import PurchaseGrid from "./_components/purchase-grid"; // Adjust path if needed
import {
  getPaginatedPurchases,
  searchPurchaseByProductName,
} from "@/server/actions/purchases"; // Use correct action name
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { createLoader, createParser } from "nuqs/server";
import type { SearchParams } from "nuqs/server";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";

// Define cursor type - Must match server action
type PurchaseCursor = {
  id: number;
  quantityPurchased?: number;
  unitCost?: number;
  createdAt?: Date; // Keep as Date on server
} | null;

// Server-side parser for PurchaseCursor
const parseAsCursor = createParser({
  parse: (value: string | null) => {
    if (!value || value === "null") return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed === null) return null;
      if (typeof parsed !== "object") return null;
      if (!("id" in parsed) || typeof parsed.id !== "number") return null;
      // IMPORTANT: Keep createdAt as string for URL
      return parsed as PurchaseCursor;
    } catch {
      return null;
    }
  },
  serialize: (value: PurchaseCursor): string => {
    return JSON.stringify(value);
  },
});

// Define nuqs parameters for the page
const purchasePageParams = {
  sort: parseAsString.withDefault("date"),
  dir: parseAsString.withDefault("desc"),
  productId: parseAsInteger.withDefault(0),
  query: parseAsString.withDefault(""),
  cursor: parseAsCursor,
};

const loadSearchParams = createLoader(purchasePageParams);

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: PageProps) => {
  const queryClient = new QueryClient();
  const {
    productId,
    sort,
    dir,
    query,
    cursor: rawCursor,
  } = await loadSearchParams(searchParams);

  const cursor = rawCursor === undefined ? null : rawCursor;

  await queryClient.prefetchQuery({
    queryKey: ["purchases", productId, sort, dir, query, cursor],
    queryFn: async () => {
      if (query) {
        const searchResult = await searchPurchaseByProductName(query);
        if (
          typeof searchResult === "object" &&
          searchResult !== null &&
          "error" in searchResult
        ) {
          throw new Error(`Error searching purchases: ${searchResult.error}`);
        }
        const purchases = Array.isArray(searchResult) ? searchResult : [];
        return {
          purchases: purchases,
          nextCursor: null,
        };
      } else {
        const result = await getPaginatedPurchases(
          PRODUCT_PER_PAGE,
          sort,
          dir as "asc" | "desc",
          productId === 0 ? undefined : productId,
          cursor,
        );

        if (
          typeof result === "object" &&
          result !== null &&
          "error" in result
        ) {
          throw new Error(`Error fetching purchases: ${result.error}`);
        }

        return {
          purchases: result?.purchases ?? [],
          nextCursor: result?.nextCursor ?? null,
        };
      }
    },
  });

  // TODO: Prefetch necessary data for filters if needed (e.g., list of products)
  // const products = await getAllProducts(); // Example

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={3} />}>
        {/* Render PurchaseGrid - Removed products prop */}
        <PurchaseGrid />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
