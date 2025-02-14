import { Suspense } from "react";
import ProductTable from "./_components/product-table";
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { getPaginatedProduct } from "@/server/actions/product";
import { getAllCategories } from "@/server/actions/category";
import { getAllBrands } from "@/server/actions/brand";
import type { BrandType } from "@/lib/types";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const params = await searchParams;
  const page = params.page ?? "1";
  const paginatedResult = await getPaginatedProduct(
    Number.parseInt(page),
    PRODUCT_PER_PAGE,
  );
  const categories = await getAllCategories();
  const brands: BrandType = await getAllBrands();

  return (
    <div className="container mx-auto lg:max-w-[1400px] sm:max-w-[480px] px-2 py-4 sm:px-4 lg:px-8">
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={3} />}>
        <ProductTable
          initialProducts={paginatedResult.products}
          initialTotalProduct={paginatedResult.total?.count ?? 0}
          brands={brands}
          categories={categories}
        />
      </Suspense>
    </div>
  );
};

export default Page;
