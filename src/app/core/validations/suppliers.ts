import { z } from "zod";

export const supplierUpsertSchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .regex(/^[A-Z0-9_]+$/, "Solo mayúsculas, números y guiones bajos"),
  name: z.string().min(1, "El nombre es requerido"),
  contactName: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const supplierFiltersSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type SupplierUpsertInput = z.infer<typeof supplierUpsertSchema>;
export type SupplierFiltersInput = z.infer<typeof supplierFiltersSchema>;

export const supplierUpsertDefaultValues: SupplierUpsertInput = {
  code: "",
  name: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  description: "",
};

export const supplierFiltersDefaultValues: SupplierFiltersInput = {
  name: "",
  isActive: undefined,
};
