import { Suspense } from "react";
import ProductGrid from "./_components/product-grid";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { getAllCategories } from "@/server/actions/category";
import { getAllBrands } from "@/server/actions/brand";
import type { BrandType } from "@/lib/types";
import {
  getPaginatedProducts,
  searchProductByName,
} from "@/server/actions/product";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  createParser,
  SearchParams,
} from "nuqs/server";

// Define cursor type to match grid and backend
type ProductCursor = {
  id: number;
  price?: number;
  stock?: number;
  createdAt?: string | Date;
} | null;

// Create a proper parser for the cursor type
const parseAsCursor = createParser({
  parse: (value: string | null) => {
    if (!value || value === "null") return null; // Handle serialized null
    try {
      const parsed = JSON.parse(value);
      if (parsed === null) return null;
      if (typeof parsed !== "object") return null;
      if (!("id" in parsed) || typeof parsed.id !== "number") return null;
      return parsed as ProductCursor;
    } catch {
      return null;
    }
  },
  serialize: (value: ProductCursor): string => {
    // Always stringify, JSON.stringify handles null correctly
    return JSON.stringify(value);
  },
});

const productPageParams = {
  // Remove page parameter, add cursor parameters
  sort: parseAsString.withDefault(""),
  query: parseAsString.withDefault(""),
  category: parseAsInteger.withDefault(0),
  brand: parseAsInteger.withDefault(0),
  dir: parseAsString.withDefault("asc"),
  cursor: parseAsCursor,
};
const loadSearchParams = createLoader(productPageParams);
const Page = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const queryClient = new QueryClient();
  const {
    query,
    category,
    brand,
    sort,
    dir,
    cursor: rawCursor,
  } = await loadSearchParams(searchParams);

  // Handle potentially undefined cursor from loader, default to null
  const cursor = rawCursor === undefined ? null : rawCursor;

  // Prefetch the initial data
  await queryClient.prefetchQuery({
    queryKey: ["products", brand, category, sort, dir, query, cursor],
    queryFn: async () => {
      if (query) {
        const searchResults = await searchProductByName(query);
        return {
          products: searchResults,
          nextCursor: null,
        };
      }
      return getPaginatedProducts(
        PRODUCT_PER_PAGE,
        sort || undefined,
        dir as "asc" | "desc",
        brand === 0 ? undefined : brand,
        category === 0 ? undefined : category,
        cursor, // Pass the processed cursor to the API
      );
    },
  });
  const categories = await getAllCategories();
  const brands: BrandType = await getAllBrands();
  console.log("brands", brands, "categories", categories)
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={3} />}>
        <ProductGrid brands={brands} categories={categories} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
