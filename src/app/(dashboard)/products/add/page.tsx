import AddProductForm from "@/components/add-product-form";
import { SelectForm } from "@/components/shad-example-form";
import { BrandType, getAllBrands, getAllCategories } from "@/server/queries";

// import { ProfileForm } from "@/components/shad-example-form";

// export default async function HomePage() {
//       const categories=await getAllCategories();
//       const brands= await getAllBrands();
//   return (
//     <div className="w-screen flex justify-center items-center h-screen">
//       <AddProductForm categories={categories} brands= {brands} />
//     </div>
//   );
// }
export default async function Page() {
    const categories=await getAllCategories();
    const brands:BrandType= await getAllBrands();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <AddProductForm categories={categories} brands= {brands} />
      {/* <SelectForm /> */}
    </div>
  );
}
