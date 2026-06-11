import { z } from 'zod';

/** Schema 004: stock_configurations + stock_alert_configurations + stock_coding_configurations + stock_fiscal_configurations */
const stockConfigSchema = z.object({
  propertyId: z.number().int().positive('Propriedade é obrigatória'),
  // Geral
  allowNegativeStock: z.boolean().optional().default(false),
  autoGenerateSKU: z.boolean().optional().default(true),
  trackExpirationDate: z.boolean().optional().default(true),
  trackBatchNumber: z.boolean().optional().default(false),
  defaultUnit: z.enum(['un', 'kg', 'lt', 'mt', 'cx', 'pc']).optional().default('un'),
  // Aceita id numérico ou string (ambientes com schema legado/heterogêneo)
  defaultUnitId: z
    .union([z.string().min(1), z.number().int().positive()])
    .transform((v) => String(v))
    .nullable()
    .optional(),
  stockMethod: z.enum(['fifo', 'lifo', 'average', 'specific']).optional().default('fifo'),
  defaultMinStock: z.number().min(0).optional().default(10),
  defaultMaxStock: z.number().min(0).optional().default(100),
  defaultReorderPoint: z.number().min(0).optional().default(20),
  autoReorder: z.boolean().optional().default(false),
  reorderLeadTime: z.number().int().min(0).optional().default(7),
  safetyStockPercent: z.number().min(0).max(100).optional().default(15),
  // Alertas
  enableLowStockAlert: z.boolean().optional().default(true),
  enableExpirationAlert: z.boolean().optional().default(true),
  expirationAlertDays: z.number().int().min(0).optional().default(30),
  enableReorderAlert: z.boolean().optional().default(true),
  enableOverstockAlert: z.boolean().optional().default(false),
  alertEmail: z.boolean().optional().default(true),
  alertPush: z.boolean().optional().default(true),
  alertSMS: z.boolean().optional().default(false),
  // Codificação
  skuPrefix: z.string().max(10).optional().default('PRD'),
  skuDigits: z.number().int().min(1).max(12).optional().default(6),
  enableEAN: z.boolean().optional().default(true),
  eanPrefix: z.string().max(5).optional().default('789'),
  enableQRCode: z.boolean().optional().default(true),
  qrCodeContent: z.enum(['sku', 'ean', 'url', 'json']).optional().default('sku'),
  // Fiscal
  defaultNCM: z.string().max(10).optional().nullable(),
  defaultCFOP: z.string().max(4).optional().default('5102'),
  defaultICMS: z.number().min(0).max(100).optional().default(18),
  defaultPIS: z.number().min(0).max(100).optional().default(1.65),
  defaultCOFINS: z.number().min(0).max(100).optional().default(7.6),
  defaultIPI: z.number().min(0).max(100).optional().default(0),
});

export const createStockConfigSchema = z.object({
  body: stockConfigSchema,
});

export const updateStockConfigSchema = z.object({
  body: stockConfigSchema.partial().extend({
    propertyId: z.number().int().positive('Propriedade é obrigatória'),
  }),
});

export type CreateStockConfigInput = z.infer<typeof createStockConfigSchema>['body'];
export type UpdateStockConfigInput = z.infer<typeof updateStockConfigSchema>['body'];
