import { z } from "zod";

export const inventoryFiltersSchema = z.object({
  product: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const inventoryFiltersDefaultValues = {
  product: "",
  category: "",
  brand: "",
  dateFrom: "",
  dateTo: "",
};

export type InventoryFiltersInput = z.infer<typeof inventoryFiltersSchema>;
