import { PRODUCT_PER_PAGE } from "@/lib/constants";
import { getPaginatedOrders } from "@/server/actions/order";
import OrderGrid from "./_components/order-grid";

export default async function Page() {
  const data = await getPaginatedOrders(1, PRODUCT_PER_PAGE);
  
  if ('message' in data && 'error' in data) {
    throw new Error(`Error fetching orders: ${data.error}`);
  }
  
  if (!('orders' in data) || !Array.isArray(data.orders)) {
    throw new Error('Invalid order data format');
  }

  return (
    <div className="space-y-4">
      <OrderGrid 
        initialOrders={data.orders} 
        initialTotalOrder={data.total || 0} 
      />
    </div>
  );
}
