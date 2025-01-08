import { z } from "zod";
const variantSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Product Variation name is too short",
    })
    .max(30),
  stock: z.number().finite().safe().positive(),
  price: z.number().finite().safe().positive(),
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
  // brandId: z.string().max(2),
  // categoryId: z.string().max(2),
  // status: z.enum(["Active", "Draft", "Archived"]),
  brandId: z.string().min(1, "Please select a brand"),
  categoryId: z.string().min(1, "Please select a category"),
  //   variants:z.array(variantSchema).nonempty(),
  //   images:z.array(productImageSchema).nonempty()
});

export type addProductType = z.infer<typeof addProductSchema>;
