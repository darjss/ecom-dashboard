import { db } from "@/server/db";
import PurchaseGrid from "./_components/purchase-grid";

export default async function Page() {
  const products = await db.query.ProductsTable.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="space-y-4">
      <PurchaseGrid products={products} />
    </div>
  );
}
