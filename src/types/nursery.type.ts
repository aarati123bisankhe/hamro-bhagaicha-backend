import z from "zod";

export const NurserySchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(3, "Address is required"),
  city: z.string().optional(),
  description: z.string().optional(),
  phoneNumber: z.string().optional(),
  imageUrl: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()).default([]),
  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z
      .tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
      ])
      .refine(
        ([lng, lat]) => !(lng === 0 && lat === 0),
        "Coordinates cannot be [0,0]"
      ),
  }),
});

export type NurseryType = z.infer<typeof NurserySchema>;
