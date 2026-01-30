import { z } from "zod";

export const orderFiltersSchema = z.object({
  code: z.string().optional(),
  status: z.string().optional(),
  customerName: z.string().optional(),
});

export const orderCreateSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const orderUpdateSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "pending", "processing", "completed", "cancelled"]).optional(),
});

export const orderItemSchema = z.object({
  product: z.string().min(1, "El producto es requerido"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  unitPrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
});

export const orderItemUpdateSchema = z.object({
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0").optional(),
  unitPrice: z.number().min(0, "El precio debe ser mayor o igual a 0").optional(),
  status: z.enum(["pending", "dispatched", "cancelled"]).optional(),
});

export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderItemUpdateInput = z.infer<typeof orderItemUpdateSchema>;

export const orderFiltersDefaultValues: OrderFiltersInput = {
  code: "",
  status: "",
  customerName: "",
};

export const orderCreateDefaultValues: OrderCreateInput = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingAddress: "",
  deliveryDate: "",
  notes: "",
};

export const orderItemDefaultValues: OrderItemInput = {
  product: "",
  quantity: 1,
  unitPrice: 0,
};
