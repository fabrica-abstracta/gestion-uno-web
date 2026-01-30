import { z } from "zod";

export const categoryFiltersSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
  parent: z.string().optional(),
});

export const categoryUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  parent: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const categoryFiltersDefaultValues = {
  name: "",
  isActive: undefined,
  parent: "",
};

export const categoryUpsertDefaultValues = {
  id: "",
  name: "",
  description: "",
  parent: "",
  isActive: true,
};

export type CategoryFiltersInput = z.infer<typeof categoryFiltersSchema>;
export type CategoryUpsertInput = z.infer<typeof categoryUpsertSchema>;
