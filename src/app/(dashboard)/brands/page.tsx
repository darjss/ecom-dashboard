import { getAllBrands } from "@/server/actions/brand";
import BrandsClient from "./_components/brands-client";

export default async function BrandsPage() {
  const brands = await getAllBrands();
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <BrandsClient brands={brands} />
    </div>
  );
}
