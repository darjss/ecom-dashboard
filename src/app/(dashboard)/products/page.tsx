import { Suspense } from "react";
import ProductGrid from "./_components/product-grid";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { getAllCategories } from "@/server/actions/category";
import { getAllBrands } from "@/server/actions/brand";
import type { BrandType } from "@/lib/types";
import { getPaginatedProducts } from "@/server/actions/product";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const categories = await getAllCategories();
  const brands: BrandType = await getAllBrands();

  return (
    <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={3} />}>
      <ProductGrid brands={brands} categories={categories} />
    </Suspense>
  );
};

export default Page;
