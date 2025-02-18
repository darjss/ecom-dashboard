import { addOrderType } from "@/lib/zod/schema";
import { db } from "../db";
import { OrdersTable } from "../db/schema";
import { generateOrderNumber } from "@/lib/utils";
import { getAllProducts } from "./product";

export const addOrder = async (orderInfo: addOrderType) => {
    const products=await getAllProducts();
    const selectedProducts=products.filter((product)=>{
        orderInfo.products.
    })
    for (let i = 0; i < products.length; i++) {
        for (let j = 0; j < orderInfo.products.length; j++) {
            if
            
        }
        
    }
    const order=await db.insert(OrdersTable).values({
        orderNumber: generateOrderNumber(),
        customerPhone: orderInfo.customerPhone,
        status:orderInfo.status,
        notes: orderInfo.notes,
        total:
    })
};
