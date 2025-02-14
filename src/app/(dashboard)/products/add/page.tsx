import { BrandType } from "@/lib/types";
import AddProductForm from "../_components/add-product-form";
import { getAllCategories } from "@/server/actions/category";
import { getAllBrands } from "@/server/actions/brand";

export default async function Page() {
  const categories = await getAllCategories();
  const brands: BrandType = await getAllBrands();
  return (
    <div className="flex w-full items-start justify-center">
      <AddProductForm categories={categories} brands={brands} />
    </div>
  );
}
