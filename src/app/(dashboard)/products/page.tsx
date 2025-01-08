import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div>
      <h1>Products</h1>
      <p>This is the products page</p>
      <p>You can add products here</p>

      <Link href="/products/add">
        <Button>Add Product</Button>
      </Link>
    </div>
  );
};
export default Page;
