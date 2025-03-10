
import { getAllProducts } from "@/server/actions/product";
import PurchaseGrid from "./_components/purchase-grid";

export default async function Page() {
  const products = await getAllProducts()

  return (
    <div className="space-y-4">
      <PurchaseGrid products={products} />
    </div>
  );
}
