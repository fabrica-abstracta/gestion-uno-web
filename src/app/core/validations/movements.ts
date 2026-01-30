import { z } from "zod";

export const movementFiltersSchema = z.object({
  batch: z.string().optional(),
  product: z.string().optional(),
  type: z.enum(["", "increment", "decrement"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type MovementFiltersInput = z.infer<typeof movementFiltersSchema>;

export const movementFiltersDefaultValues: MovementFiltersInput = {
  batch: "",
  product: "",
  type: "",
  dateFrom: "",
  dateTo: "",
};
