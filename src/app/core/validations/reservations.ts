import { z } from "zod";

// Reservation status enum
export const reservationStatuses = [
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
  "completed",
] as const;

export type ReservationStatus = typeof reservationStatuses[number];

// Reservation filters schema
export const reservationFiltersSchema = z.object({
  customerName: z.string().optional(),
  status: z.enum(reservationStatuses).optional(),
  product: z.string().optional(),
  checkInDateFrom: z.string().optional(),
  checkInDateTo: z.string().optional(),
});

// Reservation upsert schema
export const reservationUpsertSchema = z.object({
  id: z.string().optional(),
  products: z.array(z.object({
    productId: z.string().min(1, "Producto es requerido"),
    quantity: z.number().min(1, "Cantidad debe ser al menos 1"),
    unitPrice: z.number().min(0, "Precio debe ser mayor o igual a 0"),
  })).min(1, "Debe seleccionar al menos un producto"),
  customerName: z.string().min(1, "Nombre del cliente es requerido"),
  customerEmail: z.string().email("Email debe ser válido").min(1, "Email es requerido"),
  customerPhone: z.string().optional(),
  customerDocument: z.string().optional(),
  checkInDate: z.string().min(1, "Fecha de check-in es requerida"),
  checkOutDate: z.string().min(1, "Fecha de check-out es requerida"),
  checkInTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)").default("14:00"),
  checkOutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)").default("12:00"),
  totalPrice: z.number().min(0, "Precio total debe ser mayor o igual a 0"),
  currency: z.string().default("PEN"),
  status: z.enum(reservationStatuses).default("pending"),
  notes: z.string().optional(),
}).refine((data) => {
  // Validate that checkout date is after checkin date
  if (data.checkInDate && data.checkOutDate) {
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    return checkOut > checkIn;
  }
  return true;
}, {
  message: "La fecha de check-out debe ser posterior a la de check-in",
  path: ["checkOutDate"],
});

// Reservation check schema (for status updates)
export const reservationCheckSchema = z.object({
  status: z.enum(["confirmed", "checked-in", "checked-out", "cancelled", "completed"]),
  cancellationReason: z.string().optional(),
  notes: z.string().optional(),
});

// Types
export type ReservationFiltersInput = z.infer<typeof reservationFiltersSchema>;
export type ReservationUpsertInput = z.infer<typeof reservationUpsertSchema>;
export type ReservationCheckInput = z.infer<typeof reservationCheckSchema>;

// Default values
export const reservationFiltersDefaultValues: ReservationFiltersInput = {
  customerName: "",
  status: undefined,
  product: "",
  checkInDateFrom: "",
  checkInDateTo: "",
};

export const reservationUpsertDefaultValues: ReservationUpsertInput = {
  products: [{ productId: "", quantity: 1, unitPrice: 0 }],
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerDocument: "",
  checkInDate: "",
  checkOutDate: "",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  totalPrice: 0,
  currency: "PEN",
  status: "pending",
  notes: "",
};

// Status labels
export const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  "checked-in": "En curso",
  "checked-out": "Finalizada",
  cancelled: "Cancelada",
  completed: "Completada",
};

// Status colors for UI
export const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  "checked-in": "bg-green-100 text-green-800",
  "checked-out": "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-purple-100 text-purple-800",
};
