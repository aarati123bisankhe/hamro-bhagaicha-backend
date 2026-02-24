import z from "zod";

export const NurseriesQueryDto = z
  .object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().positive().max(100).default(20).optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    size: z.coerce.number().int().positive().max(100).default(20).optional(),
    search: z.string().trim().optional(),
  })
  .refine((data) => !(data.lat !== undefined && data.lng === undefined), {
    message: "lng is required when lat is provided",
    path: ["lng"],
  })
  .refine((data) => !(data.lng !== undefined && data.lat === undefined), {
    message: "lat is required when lng is provided",
    path: ["lat"],
  });

export type NurseriesQueryDto = z.infer<typeof NurseriesQueryDto>;
