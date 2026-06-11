import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateProductConfigInput, UpdateProductConfigInput } from '@/validators/productConfig.validator';
import { v4 as uuidv4 } from 'uuid';

interface ProductConfigResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  defaultUnitId: number | null;
  defaultUnit?: { id: number; name: string; code: string } | null;
  defaultProductGroupId: number | null;
  defaultProductGroup?: { id: number; name: string; code: string } | null;
  defaultCategoryId: number | null;
  defaultCategory?: { id: number; name: string; code: string } | null;
  defaultCategoryName: string | null; // Mantido para compatibilidade
  enableBarcode: boolean;
  enableImages: boolean;
  enableVariations: boolean;
  priceRounding: number;
  enableTaxes: boolean;
  defaultTaxRate: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductConfigController {
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId: propertyIdParam } = req.query;
      const propertyId = propertyIdParam ? parseInt(propertyIdParam as string, 10) : null;
      const queryRunner = AppDataSource.createQueryRunner();

      const params: any[] = [];
      const query = `
        SELECT 
          pc.id,
          pc.uuid,
          pc.property_id as propertyId,
          pc.default_unit_id as defaultUnitId,
          pc.default_product_group_id as defaultProductGroupId,
          pc.default_category_id as defaultCategoryId,
          pc.default_category as defaultCategoryName,
          pc.enable_barcode as enableBarcode,
          pc.enable_images as enableImages,
          pc.enable_variations as enableVariations,
          pc.price_rounding as priceRounding,
          pc.enable_taxes as enableTaxes,
          pc.default_tax_rate as defaultTaxRate,
          pc.created_at as createdAt,
          pc.updated_at as updatedAt,
          uom.id as unit_id,
          uom.name as unit_name,
          uom.code as unit_code,
          pg.id as group_id,
          pg.name as group_name,
          pg.code as group_code,
          pc_cat.id as category_id,
          pc_cat.name as category_name,
          pc_cat.code as category_code
        FROM product_config pc
        LEFT JOIN measurement_units uom ON pc.default_unit_id = uom.id AND uom.is_active = 1
        LEFT JOIN product_groups pg ON pc.default_product_group_id = pg.id AND pg.deleted_at IS NULL
        LEFT JOIN product_categories pc_cat ON pc.default_category_id = pc_cat.id AND pc_cat.deleted_at IS NULL
        WHERE pc.property_id ${propertyId ? '= ?' : 'IS NULL'}
      `;

      if (propertyId) {
        params.push(propertyId);
      }

      const results = await queryRunner.query(query, params);
      await queryRunner.release();

      if (results.length === 0) {
        res.json({
          success: true,
          data: null,
          message: 'Nenhuma configuração encontrada. Use POST para criar.',
        });
        return;
      }

      const row = results[0];

      const config: ProductConfigResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        defaultUnitId: row.defaultUnitId,
        defaultUnit: row.unit_id ? {
          id: row.unit_id,
          name: row.unit_name,
          code: row.unit_code,
        } : null,
        defaultProductGroupId: row.defaultProductGroupId,
        defaultProductGroup: row.group_id ? {
          id: row.group_id,
          name: row.group_name,
          code: row.group_code,
        } : null,
        defaultCategoryId: row.defaultCategoryId,
        defaultCategory: row.category_id ? {
          id: row.category_id,
          name: row.category_name,
          code: row.category_code,
        } : null,
        defaultCategoryName: row.defaultCategoryName,
        enableBarcode: row.enableBarcode === 1 || row.enableBarcode === true,
        enableImages: row.enableImages === 1 || row.enableImages === true,
        enableVariations: row.enableVariations === 1 || row.enableVariations === true,
        priceRounding: Number(row.priceRounding),
        enableTaxes: row.enableTaxes === 1 || row.enableTaxes === true,
        defaultTaxRate: row.defaultTaxRate ? Number(row.defaultTaxRate) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data: CreateProductConfigInput | UpdateProductConfigInput = req.body;
      const propertyId = data.propertyId || null;

      // Verificar se já existe configuração para esta propriedade (ou global)
      const existing = await queryRunner.query(
        `SELECT id FROM product_config WHERE property_id ${propertyId ? '= ?' : 'IS NULL'}`,
        propertyId ? [propertyId] : []
      );

      if (existing.length > 0) {
        // UPDATE
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (data.defaultUnitId !== undefined) {
          // Verificar se a unidade existe
          if (data.defaultUnitId !== null) {
            const unitCheck = await queryRunner.query(
              `SELECT id FROM measurement_units WHERE id = ? AND is_active = 1`,
              [data.defaultUnitId]
            );
            if (unitCheck.length === 0) {
              throw new AppError('Unidade de medida não encontrada', 404);
            }
          }
          updateFields.push('default_unit_id = ?');
          updateValues.push(data.defaultUnitId || null);
        }
        if (data.defaultProductGroupId !== undefined) {
          // Verificar se o grupo existe
          if (data.defaultProductGroupId !== null) {
            const groupCheck = await queryRunner.query(
              `SELECT id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
              [data.defaultProductGroupId]
            );
            if (groupCheck.length === 0) {
              throw new AppError('Grupo de produtos não encontrado', 404);
            }
          }
          updateFields.push('default_product_group_id = ?');
          updateValues.push(data.defaultProductGroupId || null);
        }
        if (data.defaultCategoryId !== undefined) {
          // Verificar se a categoria existe
          if (data.defaultCategoryId !== null) {
            const categoryCheck = await queryRunner.query(
              `SELECT id FROM product_categories WHERE id = ? AND deleted_at IS NULL`,
              [data.defaultCategoryId]
            );
            if (categoryCheck.length === 0) {
              throw new AppError('Categoria de produto não encontrada', 404);
            }
          }
          updateFields.push('default_category_id = ?');
          updateValues.push(data.defaultCategoryId || null);
        }
        if (data.defaultCategory !== undefined) {
          updateFields.push('default_category = ?');
          updateValues.push(data.defaultCategory || null);
        }
        if (data.enableBarcode !== undefined) {
          updateFields.push('enable_barcode = ?');
          updateValues.push(data.enableBarcode ? 1 : 0);
        }
        if (data.enableImages !== undefined) {
          updateFields.push('enable_images = ?');
          updateValues.push(data.enableImages ? 1 : 0);
        }
        if (data.enableVariations !== undefined) {
          updateFields.push('enable_variations = ?');
          updateValues.push(data.enableVariations ? 1 : 0);
        }
        if (data.priceRounding !== undefined) {
          updateFields.push('price_rounding = ?');
          updateValues.push(data.priceRounding);
        }
        if (data.enableTaxes !== undefined) {
          updateFields.push('enable_taxes = ?');
          updateValues.push(data.enableTaxes ? 1 : 0);
        }
        if (data.defaultTaxRate !== undefined) {
          updateFields.push('default_tax_rate = ?');
          updateValues.push(data.defaultTaxRate || null);
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(existing[0].id);

        const updateQuery = `UPDATE product_config SET ${updateFields.join(', ')} WHERE id = ?`;
        await queryRunner.query(updateQuery, updateValues);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.json({
          success: true,
          message: 'Configuração de produtos atualizada com sucesso',
        });
      } else {
        // CREATE
        const uuid = uuidv4();

        // Verificar unidade se fornecida
        if (data.defaultUnitId !== null && data.defaultUnitId !== undefined) {
          const unitCheck = await queryRunner.query(
            `SELECT id FROM measurement_units WHERE id = ? AND is_active = 1`,
            [data.defaultUnitId]
          );
          if (unitCheck.length === 0) {
            throw new AppError('Unidade de medida não encontrada', 404);
          }
        }

        // Verificar grupo se fornecido
        if (data.defaultProductGroupId !== null && data.defaultProductGroupId !== undefined) {
          const groupCheck = await queryRunner.query(
            `SELECT id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
            [data.defaultProductGroupId]
          );
          if (groupCheck.length === 0) {
            throw new AppError('Grupo de produtos não encontrado', 404);
          }
        }

        // Verificar categoria se fornecida
        if (data.defaultCategoryId !== null && data.defaultCategoryId !== undefined) {
          const categoryCheck = await queryRunner.query(
            `SELECT id FROM product_categories WHERE id = ? AND deleted_at IS NULL`,
            [data.defaultCategoryId]
          );
          if (categoryCheck.length === 0) {
            throw new AppError('Categoria de produto não encontrada', 404);
          }
        }

        // Preparar valores em ordem
        const insertValues = [
          uuid,
          propertyId,
          data.defaultUnitId !== undefined ? data.defaultUnitId : null,
          data.defaultProductGroupId !== undefined ? data.defaultProductGroupId : null,
          data.defaultCategoryId !== undefined ? data.defaultCategoryId : null,
          data.defaultCategory !== undefined ? data.defaultCategory : null,
          data.enableBarcode !== undefined ? (data.enableBarcode ? 1 : 0) : 1,
          data.enableImages !== undefined ? (data.enableImages ? 1 : 0) : 1,
          data.enableVariations !== undefined ? (data.enableVariations ? 1 : 0) : 0,
          data.priceRounding !== undefined ? data.priceRounding : 2,
          data.enableTaxes !== undefined ? (data.enableTaxes ? 1 : 0) : 1,
          data.defaultTaxRate !== undefined ? data.defaultTaxRate : null,
        ];

        // Gerar placeholders dinamicamente
        const placeholders = insertValues.map(() => '?').join(', ');

        const insertQuery = `
          INSERT INTO product_config (
            uuid, property_id,
            default_unit_id, default_product_group_id, default_category_id, default_category,
            enable_barcode, enable_images, enable_variations,
            price_rounding,
            enable_taxes, default_tax_rate
          ) VALUES (${placeholders})
        `;

        await queryRunner.query(insertQuery, insertValues);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.status(201).json({
          success: true,
          message: 'Configuração de produtos criada com sucesso',
        });
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
