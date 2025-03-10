import { z } from "zod";
import { orderStatus, paymentStatus, status } from "../constants";

export const imageSchema = z.object({
  url: z.string(),
  id: z.number().int().positive().finite().optional(),
});

const productSchema = z.object({
  productId: z.number().int().positive().finite(),
  quantity: z.number().int().positive().finite(),
  price: z.number().int().min(20000),
  name: z.string().optional(),
  imageUrl:z.string().url().optional()
});

export const addProductSchema = z.object({
  id: z.number().int().positive().finite().optional(),
  name: z
    .string()
    .min(1, {
      message: "Product name is too short",
    })
    .max(100),
  description: z.string().min(5, {
    message: "Product description is too short",
  }),
  dailyIntake: z.number().int().positive().finite(),
  brandId: z.coerce.number().int().positive().finite(),
  categoryId: z.coerce.number().int().positive().finite(),
  amount: z.string().min(3, {
    message: "Product amount is too short",
  }),
  potency: z.string().min(2, {
    message: "Product potency is too short",
  }),
  status: z.enum(status),
  stock: z.number().int().positive().finite(),
  price: z.number().int().min(20000),
  images: z.array(imageSchema).nonempty(),
});

export const addOrderSchema = z.object({
  id: z.number().int().positive().finite().optional(),
  customerPhone: z.coerce
    .number()
    .int()
    .min(60000000, { message: "Number must be at least 60000000" })
    .max(99999999, { message: "Number must be at most 99999999" }),
  address: z.string().min(10, {
    message: "Address is too short",
  }),
  notes: z
    .string()
    .min(3, {
      message: "Notes is too short",
    })
    .optional()
    .nullable(),
  status: z.enum(orderStatus),
  paymentStatus: z.enum(paymentStatus),
  isNewCustomer: z.boolean(),
  products: z.array(productSchema),
});

export type addProductType = z.infer<typeof addProductSchema>;
export type addImageType = addProductType["images"];
export type addOrderType = z.infer<typeof addOrderSchema>;
export type addOrderProdyctType = z.infer<typeof productSchema>;
export type imageType=z.infer<typeof imageSchema>;
