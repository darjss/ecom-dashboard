import { getAllBrands } from "@/server/actions/brand";
import { getAllCategories } from "@/server/actions/category";
import { getProductById } from "@/server/actions/product";

export type BrandType = Awaited<ReturnType<typeof getAllBrands>>;
export type CategoryType = Awaited<ReturnType<typeof getAllCategories>>;
export type ProductType = Exclude<
  Exclude<Awaited<ReturnType<typeof getProductById>>, null>,
  { message: string; error: string }
>;