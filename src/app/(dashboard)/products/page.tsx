import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllProducts } from "@/server/queries";

const Page =async () => {
  const products= await getAllProducts();
  console.log(products);
  return (
    <div>
      <h1>Products</h1>
      <p>This is the products page</p>
      <p>You can add products here</p>
      {products.map((product)=>{
        return (<div key={product.product.id} className="w-full flex justify-between bg-slate-200" >
        <Link href={`/products/edit/?id=${product.product.id}`}>Edit product {product.product.id}</Link>
        </div>)
      })}
      <Link href="/products/add">
        <Button>Add Product</Button>
      </Link>
    </div>
  );
};
export default Page;
