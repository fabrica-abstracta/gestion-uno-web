import { z } from "zod";

// Unit schemas
export const unitUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  dimension: z.string().optional(),
  base: z.string().optional(),
  toBaseFactor: z.number().optional(),
});

export const unitFiltersSchema = z.object({
  name: z.string().optional(),
  dimension: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const unitFiltersDefaultValues = {
  name: "",
  dimension: "",
  isActive: undefined,
};

export const unitUpsertDefaultValues = {
  id: "",
  name: "",
  symbol: "",
  dimension: "",
  base: "",
  toBaseFactor: 1,
};

export type UnitUpsertInput = z.infer<typeof unitUpsertSchema>;
export type UnitFiltersInput = z.infer<typeof unitFiltersSchema>;
