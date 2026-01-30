import { z } from "zod";

// Perfil personal
export const profileUpdateSchema = z.object({
  documentType: z.string().optional(),
  documentNumber: z.string().min(1, "El número de documento es requerido"),
  paternalSurnames: z.string().optional(),
  maternalSurnames: z.string().optional(),
  names: z.string().min(1, "El nombre es requerido"),
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
});

export const profileUpdateDefaultValues = {
  documentType: "",
  documentNumber: "",
  paternalSurnames: "",
  maternalSurnames: "",
  names: "",
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
};

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Cambiar contraseña
export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(6, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(8, "La confirmación debe tener al menos 8 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const passwordUpdateDefaultValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;

// Cambiar email
export const emailUpdateSchema = z.object({
  newEmail: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña es requerida para confirmar"),
});

export const emailUpdateDefaultValues = {
  newEmail: "",
  password: "",
};

export type EmailUpdateInput = z.infer<typeof emailUpdateSchema>;

// Eliminar cuenta
export const deleteAccountSchema = z.object({
  password: z.string().min(6, "La contraseña es requerida para confirmar"),
  confirmation: z.string().min(1, "Debes escribir ELIMINAR para confirmar"),
}).refine((data) => data.confirmation === "ELIMINAR", {
  message: "Debes escribir ELIMINAR para confirmar",
  path: ["confirmation"],
});

export const deleteAccountDefaultValues = {
  password: "",
  confirmation: "",
};

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// Método de pago
export const paymentMethodSchema = z.object({
  cardNumber: z.string()
    .min(15, "Número de tarjeta inválido")
    .max(19, "Número de tarjeta inválido")
    .regex(/^[0-9]+$/, "Solo números"),
  expiryMonth: z.string()
    .length(2, "Mes inválido")
    .regex(/^(0[1-9]|1[0-2])$/, "Mes debe estar entre 01 y 12"),
  expiryYear: z.string()
    .length(4, "Año inválido")
    .regex(/^20[2-9][0-9]$/, "Año inválido"),
  cvv: z.string()
    .length(3, "CVV debe tener 3 dígitos")
    .regex(/^[0-9]{3}$/, "Solo números"),
  cardholderName: z.string()
    .min(3, "Nombre del titular es requerido")
    .max(100, "Nombre muy largo"),
});

export const paymentMethodDefaultValues = {
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
  cardholderName: "",
};

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
