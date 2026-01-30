import { z } from "zod";

// User schemas
export const userUpsertSchema = z.object({
  paternalSurnames: z.string().min(1, "Apellido paterno requerido"),
  maternalSurnames: z.string().min(1, "Apellido materno requerido"),
  names: z.string().min(1, "Nombres requeridos"),
  email: z.string().email("Email inválido").optional(),
  role: z.array(
    z.object({
      id: z.string().min(1, "ID de rol requerido"),
    })
  ).min(1, "Al menos un rol es requerido"),
});

export const userFiltersSchema = z.object({
  names: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  role: z.string().optional(),
});

export const userFiltersDefaultValues = {
  names: "",
  status: undefined,
  role: "",
};

export const userUpsertDefaultValues = {
  paternalSurnames: "",
  maternalSurnames: "",
  names: "",
  email: "",
  role: [],
};

// Role schemas
export const roleUpsertSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  permissionKeys: z.array(z.string()).min(1, "Al menos un permiso es requerido"),
});

export const roleFiltersSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const roleFiltersDefaultValues = {
  name: "",
  status: undefined,
};

export const roleUpsertDefaultValues = {
  name: "",
  permissionKeys: [],
};

// Permission schemas
export const permissionUpsertSchema = z.object({
  key: z
    .string()
    .min(1, "Llave requerida")
    .regex(/^[A-Z_]+$/, "Solo mayúsculas y guiones bajos"),
  label: z.string().min(1, "Etiqueta requerida"),
  description: z.string().optional(),
});

export const permissionFiltersSchema = z.object({
  key: z.string().optional(),
  label: z.string().optional(),
});

export const permissionFiltersDefaultValues = {
  key: "",
  label: "",
};

export const permissionUpsertDefaultValues = {
  key: "",
  label: "",
  description: "",
};

// Type exports
export type UserUpsertInput = z.infer<typeof userUpsertSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;

export type RoleUpsertInput = z.infer<typeof roleUpsertSchema>;
export type RoleFiltersInput = z.infer<typeof roleFiltersSchema>;

export type PermissionUpsertInput = z.infer<typeof permissionUpsertSchema>;
export type PermissionFiltersInput = z.infer<typeof permissionFiltersSchema>;
