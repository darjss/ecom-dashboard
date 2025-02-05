import { z } from "zod";
import { status } from "../constants";

const imageSchema = z.object({
  url: z.string(),
  id: z.number().int().positive().finite().optional(),
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

export type addProductType = z.infer<typeof addProductSchema>;
export type addImageType=addProductType["images"]

