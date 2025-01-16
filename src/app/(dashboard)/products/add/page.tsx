
import { BrandType, getAllBrands, getAllCategories } from "@/server/queries";
import AddProductForm from "../_components/add-product-form";

export default async function Page() {
  const categories = await getAllCategories();
  const brands: BrandType = await getAllBrands();
  return (
    <div className="flex w-full items-start justify-center">
      <AddProductForm categories={categories} brands={brands} />
    </div>
  );
}
