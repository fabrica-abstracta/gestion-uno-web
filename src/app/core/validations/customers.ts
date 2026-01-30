import { z } from "zod";

// Customer status enum
export const customerStatuses = ["active", "inactive", "blocked"] as const;
export type CustomerStatus = typeof customerStatuses[number];

// Document types
export const documentTypes = ["DNI", "Passport", "RUC", "Other"] as const;
export type DocumentType = typeof documentTypes[number];

// Gender options
export const genders = ["Male", "Female", "Other", ""] as const;
export type Gender = typeof genders[number];

// Customer filters schema
export const customerFiltersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  status: z.enum(customerStatuses).optional(),
  segment: z.string().optional(),
});

// Customer upsert schema
export const customerUpsertSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "Nombre es requerido"),
  lastName: z.string().min(1, "Apellido es requerido"),
  email: z.string().email("Email debe ser válido").min(1, "Email es requerido"),
  phone: z.string().optional(),
  documentType: z.enum(documentTypes).default("DNI"),
  documentNumber: z.string().optional(),
  
  // Address
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  
  // Business
  company: z.string().optional(),
  taxId: z.string().optional(),
  
  // Demographics
  birthDate: z.string().optional(),
  gender: z.enum(genders).optional(),
  
  // Status & Preferences
  status: z.enum(customerStatuses).default("active"),
  preferredCurrency: z.string().default("PEN"),
  language: z.string().default("es"),
  acceptsMarketing: z.boolean().default(true),
  
  // Tags
  tags: z.array(z.string()).optional(),
  
  // Notes
  notes: z.string().optional(),
});

// Types
export type CustomerFiltersInput = z.infer<typeof customerFiltersSchema>;
export type CustomerUpsertInput = z.infer<typeof customerUpsertSchema>;
export type CustomerUpsert = CustomerUpsertInput;

// Customer interface (from API)
export interface Customer {
  _id: string;
  code: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType: DocumentType;
  documentNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  company?: string;
  taxId?: string;
  birthDate?: string;
  gender?: Gender;
  status: CustomerStatus;
  preferredCurrency: string;
  language: string;
  acceptsMarketing: boolean;
  tags?: string[];
  segments?: string[];
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Default values
export const customerFiltersDefaultValues: CustomerFiltersInput = {
  name: "",
  email: "",
  status: undefined,
  segment: "",
};

export const customerUpsertDefaultValues: CustomerUpsertInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  documentType: "DNI",
  documentNumber: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  company: "",
  taxId: "",
  birthDate: "",
  gender: "",
  status: "active",
  preferredCurrency: "PEN",
  language: "es",
  acceptsMarketing: true,
  tags: [],
  notes: "",
};

// Status labels
export const statusLabels: Record<CustomerStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  blocked: "Bloqueado",
};

// Status colors for UI
export const statusColors: Record<CustomerStatus, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  blocked: "bg-red-100 text-red-800",
};

// Document type labels
export const documentTypeLabels: Record<DocumentType, string> = {
  DNI: "DNI",
  Passport: "Pasaporte",
  RUC: "RUC",
  Other: "Otro",
};

// Gender labels
export const genderLabels: Record<Gender, string> = {
  Male: "Masculino",
  Female: "Femenino",
  Other: "Otro",
  "": "No especificado",
};
