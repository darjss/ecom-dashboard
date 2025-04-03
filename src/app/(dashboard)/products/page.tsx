import { Suspense } from "react";
import ProductGrid from "./_components/product-grid";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { getAllCategories } from "@/server/actions/category";
import { getAllBrands } from "@/server/actions/brand";
import type { BrandType } from "@/lib/types";
import { getPaginatedProducts, searchProductByName } from "@/server/actions/product";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  SearchParams,
} from "nuqs/server";

const productPageParams = {
  page: parseAsInteger.withDefault(1),
  sort: parseAsString.withDefault(""),
  query: parseAsString.withDefault(""),
  category: parseAsInteger.withDefault(0),
  brand: parseAsInteger.withDefault(0),
  dir: parseAsString.withDefault("asc"),
};
const loadSearchParams = createLoader(productPageParams);
const Page = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const queryClient = new QueryClient();
  const { page, query, category, brand, sort, dir } =
    await loadSearchParams(searchParams);

  // Prefetch the initial data
  await queryClient.prefetchQuery({
    queryKey: ["products", page, brand, category, sort, dir, query],
   queryFn: async () => {
        if (query) {
          const searchResults = await searchProductByName(query);
          return {
            products: searchResults,
            totalCount: searchResults.length,
          };
        }
        return getPaginatedProducts(
          page ?? 1,
          PRODUCT_PER_PAGE,
          sort || undefined,
          dir as "asc" | "desc",
          brand === 0 ? undefined : brand,
          category === 0 ? undefined : category,
        );
      },
    });
  const categories = await getAllCategories();
  const brands: BrandType = await getAllBrands();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={3} />}>
        <ProductGrid brands={brands} categories={categories} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
