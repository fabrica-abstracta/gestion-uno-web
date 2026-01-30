import { z } from "zod";

// Enum para campos de segmentación
export const segmentFieldEnum = z.enum([
  'age',
  'registrationDate',
  'firstPurchaseDate',
  'lastPurchaseDate',
  'totalSpent',
  'totalOrders',
  'gender',
  'city',
  'country'
]);

// Enum para operadores
export const segmentOperatorEnum = z.enum([
  'equals',
  'notEquals',
  'greaterThan',
  'lessThan',
  'greaterThanOrEqual',
  'lessThanOrEqual',
  'between',
  'contains',
  'in'
]);

// Schema para condición de segmento
export const segmentConditionSchema = z.object({
  field: segmentFieldEnum,
  operator: segmentOperatorEnum,
  value: z.union([z.string(), z.number(), z.date(), z.array(z.string())]),
  secondValue: z.union([z.string(), z.number(), z.date()]).optional()
});

// Schema para filtros de lista
export const segmentListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['name', 'customerCount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema para crear/editar segmento
export const segmentUpsertSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  conditions: z.array(segmentConditionSchema).min(1, 'Debe haber al menos una condición'),
  matchType: z.enum(['ALL', 'ANY']).default('ALL'),
  isActive: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').default('#3b82f6')
});

// Tipos TypeScript exportados
export type SegmentField = z.infer<typeof segmentFieldEnum>;
export type SegmentOperator = z.infer<typeof segmentOperatorEnum>;
export type SegmentCondition = z.infer<typeof segmentConditionSchema>;
export type SegmentList = z.infer<typeof segmentListSchema>;
export type SegmentUpsert = z.infer<typeof segmentUpsertSchema>;

// Tipos para respuestas de API
export interface Segment extends SegmentUpsert {
  _id: string;
  code: string;
  customerCount: number;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Labels para campos
export const segmentFieldLabels: Record<SegmentField, string> = {
  age: 'Edad',
  registrationDate: 'Fecha de Registro',
  firstPurchaseDate: 'Primera Compra',
  lastPurchaseDate: 'Última Compra',
  totalSpent: 'Total Gastado',
  totalOrders: 'Total de Órdenes',
  gender: 'Género',
  city: 'Ciudad',
  country: 'País'
};

// Labels para operadores
export const segmentOperatorLabels: Record<SegmentOperator, string> = {
  equals: 'Igual a',
  notEquals: 'Diferente de',
  greaterThan: 'Mayor que',
  lessThan: 'Menor que',
  greaterThanOrEqual: 'Mayor o igual a',
  lessThanOrEqual: 'Menor o igual a',
  between: 'Entre',
  contains: 'Contiene',
  in: 'En'
};

// Tipos de valor por campo
export const segmentFieldTypes: Record<SegmentField, 'number' | 'date' | 'string' | 'array'> = {
  age: 'number',
  registrationDate: 'date',
  firstPurchaseDate: 'date',
  lastPurchaseDate: 'date',
  totalSpent: 'number',
  totalOrders: 'number',
  gender: 'string',
  city: 'string',
  country: 'string'
};
