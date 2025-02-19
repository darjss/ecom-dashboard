  "use server";
  import "server-only";

  import { addOrderType } from "@/lib/zod/schema";
  import { db } from "../db";
  import { CustomersTable, OrderDetailsTable, OrdersTable } from "../db/schema";
  import { generateOrderNumber } from "@/lib/utils";
  import { createPayment } from "./payment";

  export const addOrder = async (orderInfo: addOrderType) => {
    console.log("addOrder called with", orderInfo);
    try {
      const orderTotal = orderInfo.products.reduce(
        (acc, currentProduct) => acc + currentProduct.price,
        0,
      );

      await db.transaction(async (tx) => {

        if(orderInfo.isNewCustomer){
          const userResult= await tx.insert(CustomersTable).values({
            phone:orderInfo.customerPhone,
            address: orderInfo.address
          })
        }

        const [order] = await tx
          .insert(OrdersTable)
          .values({
            orderNumber: generateOrderNumber(),
            customerPhone: orderInfo.customerPhone,
            status: orderInfo.status,
            notes: orderInfo.notes,
            total: orderTotal,
          })
          .returning({ orderId: OrdersTable.id });
        if (order?.orderId === undefined) {
          return;
        }
        const orderId = order?.orderId;
        const orderDetailsPromise = orderInfo.products.map(async (product) =>
          tx.insert(OrderDetailsTable).values({
            orderId: orderId,
            productId: product.productId,
            quantity: product.quantity,
          }),
        );
        const paymentPromise = createPayment(orderId, orderInfo.paymentStatus);
        await Promise.allSettled([...orderDetailsPromise, paymentPromise]);
      });
    } catch (e) {
      if (e instanceof Error) {
        return { message: "Adding order failed", error: e.message };
      }
      console.log("error", e);
    }
  };
