import { z } from "zod";

export const userFiltersSchema = z.object({
  names: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const userUpsertSchema = z.object({
  id: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().refine(val => val === "" || val.length >= 1, "El número de documento es requerido"),
  paternalSurnames: z.string().optional(),
  maternalSurnames: z.string().optional(),
  names: z.string().refine(val => val === "" || val.length >= 1, "El nombre es requerido"),
  email: z.string().refine(
    val => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "Email inválido"
  ),
  phone: z.string().optional(),
  address: z.object({
    continent: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
  preferences: z.object({
    darkMode: z.boolean().optional(),
    notifications: z.object({
      promotions: z.boolean().optional(),
      updates: z.boolean().optional(),
      payments: z.boolean().optional(),
    }).optional(),
    autoRenew: z.boolean().optional(),
  }).optional(),
  role: z.string().refine(val => val === "" || val.length >= 1, "El rol es requerido"),
  status: z.enum(["active", "inactive"]),
  inUse: z.boolean().optional(),
});

export const userFiltersDefaultValues = {
  names: "",
  email: "",
  role: "",
  status: undefined,
  dateFrom: "",
  dateTo: "",
};

export const userUpsertDefaultValues = {
  id: "",
  documentType: "",
  documentNumber: "",
  paternalSurnames: "",
  maternalSurnames: "",
  names: "",
  email: "",
  phone: "",
  address: {
    continent: "",
    country: "",
    state: "",
    city: "",
    district: "",
    street: "",
    number: "",
    zip: "",
  },
  preferences: {
    darkMode: false,
    notifications: {
      promotions: false,
      updates: false,
      payments: true,
    },
    autoRenew: false,
  },
  role: "",
  status: "active" as const,
  inUse: false,
};

export const roleFiltersSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const roleUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  permissions: z.record(z.string(), z.array(z.string())).optional(),
  status: z.enum(["active", "inactive"]),
  inUse: z.boolean().optional(),
});

export const roleFiltersDefaultValues = {
  name: "",
  status: undefined,
  dateFrom: "",
  dateTo: "",
};

export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type UserUpsertInput = z.infer<typeof userUpsertSchema>;
export type RoleFiltersInput = z.infer<typeof roleFiltersSchema>;
export type RoleUpsertInput = z.infer<typeof roleUpsertSchema>;

export const roleUpsertDefaultValues = {
  id: "",
  name: "",
  description: "",
  permissions: undefined,
  status: "active" as const,
  inUse: false,
};
