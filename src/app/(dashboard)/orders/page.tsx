import { Button } from "@/components/ui/button";
import { getAllorder } from "@/server/actions/order";
import Link from "next/link";

export default async function Page() {
  const orders = await getAllorder();
  console.log(orders);
  return (
    <div className="">
      <Link href="/orders/add">
        <Button>Add Order</Button>
      </Link>
    </div>
  );
}
