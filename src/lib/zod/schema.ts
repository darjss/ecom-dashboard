import { z } from "zod";
const variantSchema = z.object({
  amount: z.string().min(3, {
    message: "Product Variation amount is too short",
  }),
  potency: z.string().min(2, {
    message: "Product Variation potency is too short",
  }).optional(),
  stock: z.number().int().positive().finite(),
  price: z.number().int().positive().finite(),
});

const productImageSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean(),
});

export const addProductSchema = z.object({
  name: z
    .string()
    .min(5, {
      message: "Product name is too short",
    })
    .max(100),
  description: z.string().min(5, {
    message: "Product description is too short",
  }),
  dailyIntake: z.number().int().positive().finite(),
  brandId: z.coerce.number().int().positive().finite(),
  categoryId: z.coerce.number().int().positive().finite(),

  //   variants:z.array(variantSchema).nonempty(),
  //   images:z.array(productImageSchema).nonempty()
});

export type addProductType = z.infer<typeof addProductSchema>;
