import { getAllProducts } from "@/server/actions/product";
import AddOrderForm from "../_components/add-order-form";

const Page = async() => {
  const allProducts=await getAllProducts();
  return (
    <div className="flex w-full items-start justify-center">
      <AddOrderForm products={allProducts} />
    </div>
  );
};
export default Page;