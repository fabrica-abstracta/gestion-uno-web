import { z } from "zod";

// Schema para precio override (precio por segmento)
export const priceOverrideSchema = z.object({
  segmentId: z.string().optional(),
  segmentName: z.string().optional(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  discount: z.number().min(0).max(100).default(0)
});

// Schema para producto en catálogo
export const catalogProductSchema = z.object({
  productId: z.string().min(1, 'Debe seleccionar un producto'),
  isVisible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  priceOverrides: z.array(priceOverrideSchema).default([]),
  publicPrice: z.number().min(0).optional(),
  notes: z.string().max(500).optional()
});

// Schema para filtro de catálogo
export const catalogFilterSchema = z.object({
  name: z.string().min(1, 'El nombre del filtro es requerido').max(100),
  type: z.enum(['category', 'brand', 'priceRange', 'custom']),
  values: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

// Schema para configuración del catálogo
export const catalogSettingsSchema = z.object({
  showPrices: z.boolean().default(true),
  allowOrders: z.boolean().default(true),
  showStock: z.boolean().default(false),
  theme: z.string().default('default'),
  columns: z.number().int().min(1).max(6).default(3)
});

// Enum para estados de catálogo
export const catalogStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED']);

// Schema para filtros de lista
export const catalogListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  status: catalogStatusEnum.optional(),
  isPublic: z.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['name', 'createdAt', 'views', 'orders']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema para crear/editar catálogo
export const catalogUpsertSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(1000).optional(),
  status: catalogStatusEnum.default('DRAFT'),
  products: z.array(catalogProductSchema).default([]),
  segments: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres').max(50).optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  filters: z.array(catalogFilterSchema).default([]),
  coverImage: z.string().url('URL inválida').optional(),
  settings: catalogSettingsSchema.default({
    showPrices: true,
    allowOrders: true,
    showStock: false,
    theme: 'default',
    columns: 3
  })
}).refine(
  (data) => {
    if (data.validFrom && data.validTo) {
      return new Date(data.validFrom).getTime() <= new Date(data.validTo).getTime();
    }
    return true;
  },
  {
    message: 'La fecha de inicio debe ser menor o igual a la fecha de fin',
    path: ['validTo']
  }
);

// Schema para importar CSV
export const catalogImportCSVSchema = z.object({
  catalogId: z.string().min(1, 'ID de catálogo requerido'),
  csvData: z.string().min(1, 'Datos CSV requeridos'),
  updateExisting: z.boolean().default(false)
});

// Schema para preview con contraseña
export const catalogPreviewSchema = z.object({
  password: z.string().optional()
});

// Tipos TypeScript exportados
export type CatalogStatus = z.infer<typeof catalogStatusEnum>;
export type PriceOverride = z.infer<typeof priceOverrideSchema>;
export type CatalogProduct = z.infer<typeof catalogProductSchema>;
export type CatalogFilter = z.infer<typeof catalogFilterSchema>;
export type CatalogSettings = z.infer<typeof catalogSettingsSchema>;
export type CatalogList = z.infer<typeof catalogListSchema>;
export type CatalogUpsert = z.infer<typeof catalogUpsertSchema>;
export type CatalogImportCSV = z.infer<typeof catalogImportCSVSchema>;
export type CatalogPreview = z.infer<typeof catalogPreviewSchema>;

// Tipos para respuestas de API
export interface Catalog {
  _id: string;
  code: string;
  name: string;
  description?: string;
  status: CatalogStatus;
  products: CatalogProduct[];
  segments: string[];
  isPublic: boolean;
  password?: string;
  validFrom?: string;
  validTo?: string;
  filters: CatalogFilter[];
  coverImage?: string;
  settings: CatalogSettings;
  views: number;
  orders: number;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Colores y labels para estados
export const catalogStatusColors: Record<CatalogStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-800'
};

export const catalogStatusLabels: Record<CatalogStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  EXPIRED: 'Expirado'
};

// Labels para tipos de filtro
export const filterTypeLabels = {
  category: 'Categoría',
  brand: 'Marca',
  priceRange: 'Rango de Precio',
  custom: 'Personalizado'
};
