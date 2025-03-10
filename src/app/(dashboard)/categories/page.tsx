import { getAllCategories } from "@/server/actions/category";
import CategoriesClient from "./_components/categories-client";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <CategoriesClient categories={categories} />
    </div>
  );
}
