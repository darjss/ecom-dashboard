import { z } from "zod";
import { orderStatus, status } from "../constants";

const imageSchema = z.object({
  url: z.string(),
  id: z.number().int().positive().finite().optional(),
});

const productSchema = z.object({
  productId: z.number().int().positive().finite(),
  quaninty:z.number().int().positive().finite()
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
  customerPhone: z
    .string()
    .length(8)
    .regex(/^[6789]\d+$/)
    .transform(Number)
    .refine((num) => num >= 60000000 && num <= 99999999, {
      message: "Number must be 8 digits and start with 6, 8, or 9",
    }),
  address: z.string().min(10, {
    message: "Address is too short",
  }),
  notes: z.string().min(3, {
    message: "Notes is too short",
  }).optional(),
  status: z.enum(orderStatus),
  products: z.array(productSchema).nonempty(),
});

export type addProductType = z.infer<typeof addProductSchema>;
export type addImageType=addProductType["images"]
export type addOrderType=z.infer<typeof addOrderSchema>
