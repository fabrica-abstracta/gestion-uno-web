import { z } from "zod";

// Brand schemas
export const brandUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const brandFiltersSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const brandFiltersDefaultValues = {
  name: "",
  isActive: undefined,
};

export const brandUpsertDefaultValues = {
  id: "",
  name: "",
  description: "",
};

export type BrandUpsertInput = z.infer<typeof brandUpsertSchema>;
export type BrandFiltersInput = z.infer<typeof brandFiltersSchema>;
