import { z } from "zod";

export const productFiltersSchema = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
});

export const saleCreateItemSchema = z.object({
  product: z.object({
    id: z.string().min(1, "ID de producto requerido"),
    name: z.string().min(1, "Nombre requerido"),
    price: z.number().min(0, "Precio debe ser mayor o igual a 0"),
    brand: z.string().optional(),
    brandName: z.string().optional(),
  }),
  quantity: z.number().min(1, "Cantidad debe ser al menos 1"),
});

export const saleCreateSchema = z.object({
  items: z.array(saleCreateItemSchema).min(1, "Debe agregar al menos un producto"),
  paymentMethod: z.enum(["CASH", "YAPE", "PLIN", "CARD", "TRANSFER", "CREDIT", "OTHER"]).default("CASH"),
  customer: z.object({
    name: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    phone: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type SaleCreateInput = z.infer<typeof saleCreateSchema>;

export const productFiltersDefaultValues: ProductFiltersInput = {
  name: "",
  brand: "",
  category: "",
  sku: "",
};

export const saleCreateDefaultValues: Partial<SaleCreateInput> = {
  items: [],
  paymentMethod: "CASH",
  customer: {
    name: "",
    email: "",
    phone: "",
  },
  notes: "",
};
