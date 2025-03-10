import { db } from "@/server/db";
import AddPurchaseForm from "../_components/add-purchase-form";

export default async function Page() {
  const products = await db.query.ProductsTable.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="flex w-full items-start justify-center">
      <AddPurchaseForm />
    </div>
  );
}
