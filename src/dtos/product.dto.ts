import z from "zod";

export const CreateProductDto = z.object({
  sellerId: z.string().trim().min(1).default("local-seller"),
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  price: z.coerce.number().positive("price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "stock cannot be negative"),
  imageUrl: z.string().trim().optional(),
});

export const InventoryQueryDto = z.object({
  sellerId: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type InventoryQueryDto = z.infer<typeof InventoryQueryDto>;

