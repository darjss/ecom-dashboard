import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BrandType, getAllBrands, getAllCategories, getAllProducts } from "@/server/queries";
import { seedDatabase } from "seed";
import { deleteProduct, ProductType } from "@/server/queries";
import RowActions from "./_components/row-actions";

const Page = async () => {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  const brands: BrandType = await getAllBrands();
  // console.log("products", products);\
  // console.log("categories", categories);
  // console.log("brands", brands);
  // const dummyProduct: ProductType = {
  //   images: [],
  //   id: 1,
  //   name: "Sample Product",
  //   slug: "sample-product",
  //   description: "This is a sample product.",
  //   status: "active",
  //   discount: 0,
  //   amount: "100",
  //   potency: "high",
  //   stock: 10,
  //   price: 100000,
  //   brandId: 1,
  //   categoryId: 1,
  //   dailyIntake:2,
  //   createdAt: new Date(),
  //   updatedAt: new Date()
  //   // Add other properties as needed
  // };
// console.log(dummyProduct);
  return (
    <div>
      <h1>Products</h1>
      <p>This is the products page</p>
      <p>You can add products here</p>
      {products.map((product) => {
        return (
          <div
            key={product.id}
            className="flex w-full justify-between bg-slate-200"
          >
            <Link href={`/products/edit/?id=${product.id}`}>
              Edit product {product.id}
            </Link>
            <RowActions product={product} brands={brands} categories={categories}/>
          </div>
        );
      })}
      <Link href="/products/add">
        <Button>Add Product</Button>
      </Link>
      <form action={seedDatabase}>
        <Button type="submit">Seed database</Button>
      </form>
    </div>
  );
};
export default Page;
