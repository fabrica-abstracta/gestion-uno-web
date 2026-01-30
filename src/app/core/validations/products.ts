import { z } from "zod";

export const productFiltersSchema = z.object({
  sku: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  barcode: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const productUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  price: z.number().min(0, "Precio debe ser mayor o igual a 0"),
  currency: z.string(),
  stock: z.object({
    minimum: z.number().min(0, "Stock mínimo debe ser mayor o igual a 0"),
  }),
  category: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().optional(),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

export const productFiltersDefaultValues: ProductFiltersInput = {
  sku: "",
  name: "",
  brand: "",
  category: "",
  unit: "",
  barcode: "",
  dateFrom: "",
  dateTo: "",
};

export const productUpsertDefaultValues: ProductUpsertInput = {
  name: "",
  description: "",
  price: 0,
  currency: "USD",
  stock: {
    minimum: 0
  },
  category: "",
  brand: "",
  unit: "",
};
