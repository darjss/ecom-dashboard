import { Button } from "@/components/ui/button";
import { PRODUCT_PER_PAGE } from "@/lib/constants";
import {  getPaginatedOrders } from "@/server/actions/order";
import Link from "next/link";

export default async function Page() {
  const orders = await getPaginatedOrders(1,PRODUCT_PER_PAGE);
  console.log("ORDERS",orders);
  return (
    <div className="">
      <Link href="/orders/add">
        <Button>Add Order</Button>
      </Link>
    </div>
  );
}
