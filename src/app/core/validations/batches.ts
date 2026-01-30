import { z } from "zod";

export const batchFiltersSchema = z.object({
  code: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const batchUpsertSchema = z.object({
  id: z.string().optional(),
  product: z.string().min(1, "Producto es requerido"),
  code: z.string().optional(),
  expiresAt: z.string().optional(),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1").max(999999, "La cantidad es muy grande"),
  action: z.enum(["increment", "decrement"]),
  reason: z.string().optional(),
});

export const batchDecrementSchema = z.object({
  id: z.string().min(1, "ID del lote es requerido"),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  reason: z.string().min(1, "El motivo es requerido"),
});

export type BatchFiltersInput = z.infer<typeof batchFiltersSchema>;
export type BatchUpsertInput = z.infer<typeof batchUpsertSchema>;
export type BatchDecrementInput = z.infer<typeof batchDecrementSchema>;

export const batchFiltersDefaultValues: BatchFiltersInput = {
  code: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export const batchUpsertDefaultValues: BatchUpsertInput = {
  product: "",
  code: "",
  expiresAt: "",
  quantity: 1,
  action: "increment" as const,
  reason: "",
};

export const batchDecrementDefaultValues: BatchDecrementInput = {
  id: "",
  quantity: 1,
  reason: "",
};
