import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateProductInput, UpdateProductInput } from '@/validators/product.validator';
import { v4 as uuidv4 } from 'uuid';

interface ProductResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  code: string;
  name: string;
  barcode: string | null;
  categoryId: number | null;
  category: string | null;
  productGroupId: number | null;
  productGroup?: { id: number; name: string; code: string } | null;
  unitId: number | null;
  unit?: { id: number; name: string; abbreviation: string } | null;
  description: string | null;
  costPrice: number | null;
  salePrice: number | null;
  stockQuantity: number;
  minStock: number;
  trackStock: boolean;
  supplierId: number | null;
  supplier?: { id: number; name: string } | null;
  images: string[] | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export class ProductController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status, categoryId, productGroupId, propertyId } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          p.id,
          p.uuid,
          NULL as propertyId,
          p.sku as code,
          p.name,
          p.barcode,
          p.category_id as categoryId,
          pc.name as category,
          NULL as productGroupId,
          p.primary_unit_id as unitId,
          p.description,
          p.cost_price as costPrice,
          p.sale_price as salePrice,
          COALESCE((
            SELECT SUM(ii.current_stock)
            FROM inventory_items ii
            WHERE ii.deleted_at IS NULL
              AND ii.product_id = p.id
              ${propertyId ? 'AND ii.property_id = ?' : ''}
          ), 0) as stockQuantity,
          p.min_stock_global as minStock,
          IFNULL(p.track_inventory, 1) as trackStock,
          NULL as supplierId,
          p.image_url as images,
          p.status,
          p.created_at as createdAt,
          p.updated_at as updatedAt,
          NULL as group_id,
          NULL as group_name,
          NULL as group_code,
          uom.id as unit_id,
          uom.name as unit_name,
          uom.symbol as unit_abbreviation,
          NULL as supplier_id_rel,
          NULL as supplier_name,
          pc.id as category_id_rel,
          pc.name as category_name,
          pc.color as category_color,
          pc.icon as category_icon
        FROM products p
        LEFT JOIN measurement_units uom ON p.primary_unit_id = uom.id
        LEFT JOIN product_categories pc ON p.category_id = pc.id
        WHERE 1=1
      `;

      const params: any[] = [];
      if (propertyId) {
        params.push(parseInt(propertyId as string, 10));
      }

      if (search) {
        query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR p.description LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        query += ` AND p.status = ?`;
        params.push(status);
      }

      if (categoryId) {
        query += ` AND p.category_id = ?`;
        params.push(parseInt(categoryId as string, 10));
      }

      if (productGroupId) {
      }
      if (propertyId) {
      }

      query += ` ORDER BY p.name ASC`;

      const results = await queryRunner.query(query, params);
      await queryRunner.release();

      const products: ProductResponse[] = results.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        barcode: row.barcode,
        categoryId: row.categoryId,
        category: row.category || (row.category_name || null),
        productGroupId: row.productGroupId,
        productGroup: row.group_id ? {
          id: row.group_id,
          name: row.group_name,
          code: row.group_code,
        } : null,
        unitId: row.unitId,
        unit: row.unit_id ? {
          id: row.unit_id,
          name: row.unit_name,
          abbreviation: row.unit_abbreviation,
        } : null,
        description: row.description,
        costPrice: row.costPrice ? Number(row.costPrice) : null,
        salePrice: row.salePrice ? Number(row.salePrice) : null,
        stockQuantity: Number(row.stockQuantity),
        minStock: Number(row.minStock),
        trackStock: row.trackStock === 1 || row.trackStock === true,
        supplierId: row.supplierId,
        supplier: row.supplier_id_rel ? {
          id: row.supplier_id_rel,
          name: row.supplier_name,
        } : null,
        images: row.images
          ? typeof row.images === 'string'
            ? (row.images.startsWith('[') ? JSON.parse(row.images) : [row.images])
            : row.images
          : null,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const results = await queryRunner.query(
        `SELECT 
          p.id,
          p.uuid,
          NULL as propertyId,
          p.sku as code,
          p.name,
          p.barcode,
          p.category_id as categoryId,
          pc.name as category,
          NULL as productGroupId,
          p.primary_unit_id as unitId,
          p.description,
          p.cost_price as costPrice,
          p.sale_price as salePrice,
          COALESCE((
            SELECT SUM(ii.current_stock)
            FROM inventory_items ii
            WHERE ii.deleted_at IS NULL
              AND ii.product_id = p.id
          ), 0) as stockQuantity,
          p.min_stock_global as minStock,
          IFNULL(p.track_inventory, 1) as trackStock,
          NULL as supplierId,
          p.image_url as images,
          p.status,
          p.created_at as createdAt,
          p.updated_at as updatedAt,
          NULL as group_id,
          NULL as group_name,
          NULL as group_code,
          uom.id as unit_id,
          uom.name as unit_name,
          uom.symbol as unit_abbreviation,
          NULL as supplier_id_rel,
          NULL as supplier_name,
          pc.id as category_id_rel,
          pc.name as category_name,
          pc.color as category_color,
          pc.icon as category_icon
        FROM products p
        LEFT JOIN measurement_units uom ON p.primary_unit_id = uom.id
        LEFT JOIN product_categories pc ON p.category_id = pc.id
        WHERE p.id = ?`,
        [id]
      );

      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Produto não encontrado', 404);
      }

      const row = results[0];
      const product: ProductResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        barcode: row.barcode,
        categoryId: row.categoryId,
        category: row.category || (row.category_name || null),
        productGroupId: row.productGroupId,
        productGroup: row.group_id ? {
          id: row.group_id,
          name: row.group_name,
          code: row.group_code,
        } : null,
        unitId: row.unitId,
        unit: row.unit_id ? {
          id: row.unit_id,
          name: row.unit_name,
          abbreviation: row.unit_abbreviation,
        } : null,
        description: row.description,
        costPrice: row.costPrice ? Number(row.costPrice) : null,
        salePrice: row.salePrice ? Number(row.salePrice) : null,
        stockQuantity: Number(row.stockQuantity),
        minStock: Number(row.minStock),
        trackStock: row.trackStock === 1 || row.trackStock === true,
        supplierId: row.supplierId,
        supplier: row.supplier_id_rel ? {
          id: row.supplier_id_rel,
          name: row.supplier_name,
        } : null,
        images: row.images
          ? typeof row.images === 'string'
            ? (row.images.startsWith('[') ? JSON.parse(row.images) : [row.images])
            : row.images
          : null,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data: CreateProductInput = req.body;
      const uuid = uuidv4();

      // Verificar se SKU já existe (tabela usa sku, não code)
      const existing = await queryRunner.query(
        `SELECT id FROM products WHERE sku = ?`,
        [data.code]
      );

      if (existing.length > 0) {
        throw new AppError('Código de produto já existe', 400);
      }

      // Verificar relacionamentos se fornecidos
      if (data.unitId !== null && data.unitId !== undefined) {
        const unitCheck = await queryRunner.query(
          `SELECT id FROM measurement_units WHERE id = ? AND is_active = 1`,
          [data.unitId]
        );
        if (unitCheck.length === 0) {
          throw new AppError('Unidade de medida não encontrada', 404);
        }
      }

      if (data.productGroupId !== null && data.productGroupId !== undefined) {
        const groupCheck = await queryRunner.query(
          `SELECT id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
          [data.productGroupId]
        );
        if (groupCheck.length === 0) {
          throw new AppError('Grupo de produtos não encontrado', 404);
        }
      }

      if (data.categoryId !== null && data.categoryId !== undefined) {
        const categoryCheck = await queryRunner.query(
          `SELECT id FROM product_categories WHERE id = ?`,
          [data.categoryId]
        );
        if (categoryCheck.length === 0) {
          throw new AppError('Categoria de produto não encontrada', 404);
        }
      }

      if (data.supplierId !== null && data.supplierId !== undefined) {
        const supplierCheck = await queryRunner.query(
          `SELECT id FROM suppliers WHERE id = ? AND deleted_at IS NULL`,
          [data.supplierId]
        );
        if (supplierCheck.length === 0) {
          throw new AppError('Fornecedor não encontrado', 404);
        }
      }

      // Schema 001: products tem sku (não code), primary_unit_id (não unit_id), sem property_id/category/product_group_id/supplier_id/images
      const categoryId = data.categoryId ?? null;
      const primaryUnitId = data.unitId ?? 1;
      if (!categoryId) {
        throw new AppError('Categoria de produto (categoryId) é obrigatória', 400);
      }

      const imageUrl = data.images && data.images.length > 0 ? data.images[0] : null;

      await queryRunner.query(
        `INSERT INTO products (
          uuid, sku, barcode, name, short_name, description,
          category_id, brand_id, primary_unit_id, secondary_unit_id,
          cost_price, sale_price,
          track_inventory, min_stock_global, max_stock_global, reorder_point,
          image_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          data.code,
          data.barcode || null,
          data.name,
          (data.name || '').slice(0, 100),
          data.description || null,
          categoryId,
          null,
          primaryUnitId,
          null,
          data.costPrice ?? 0,
          data.salePrice ?? 0,
          data.trackStock !== false ? 1 : 0,
          data.minStock ?? 0,
          data.minStock ?? 0,
          data.minStock ?? 0,
          imageUrl,
          (data.status || 'active') as string,
        ]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;
      const data: UpdateProductInput = req.body;

      // Verificar se produto existe
      const existing = await queryRunner.query(
        `SELECT id FROM products WHERE id = ?`,
        [id]
      );

      if (existing.length === 0) {
        throw new AppError('Produto não encontrado', 404);
      }

      // Verificar SKU único se estiver sendo alterado (tabela usa sku, não code)
      if (data.code) {
        const codeCheck = await queryRunner.query(
          `SELECT id FROM products WHERE sku = ? AND id != ?`,
          [data.code, id]
        );

        if (codeCheck.length > 0) {
          throw new AppError('Código de produto já existe', 400);
        }
      }

      // Verificar relacionamentos
      if (data.unitId !== null && data.unitId !== undefined) {
        const unitCheck = await queryRunner.query(
          `SELECT id FROM measurement_units WHERE id = ? AND is_active = 1`,
          [data.unitId]
        );
        if (unitCheck.length === 0) {
          throw new AppError('Unidade de medida não encontrada', 404);
        }
      }

      if (data.productGroupId !== null && data.productGroupId !== undefined) {
        const groupCheck = await queryRunner.query(
          `SELECT id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
          [data.productGroupId]
        );
        if (groupCheck.length === 0) {
          throw new AppError('Grupo de produtos não encontrado', 404);
        }
      }

      if (data.categoryId !== null && data.categoryId !== undefined) {
        const categoryCheck = await queryRunner.query(
          `SELECT id FROM product_categories WHERE id = ?`,
          [data.categoryId]
        );
        if (categoryCheck.length === 0) {
          throw new AppError('Categoria de produto não encontrada', 404);
        }
      }

      if (data.supplierId !== null && data.supplierId !== undefined) {
        const supplierCheck = await queryRunner.query(
          `SELECT id FROM suppliers WHERE id = ? AND deleted_at IS NULL`,
          [data.supplierId]
        );
        if (supplierCheck.length === 0) {
          throw new AppError('Fornecedor não encontrado', 404);
        }
      }

      // Buscar nome da categoria se categoryId for fornecido
      let categoryName = data.category;
      if (data.categoryId !== null && data.categoryId !== undefined && !categoryName) {
        const categoryResult = await queryRunner.query(
          `SELECT name FROM product_categories WHERE id = ?`,
          [data.categoryId]
        );
        if (categoryResult.length > 0) {
          categoryName = categoryResult[0].name;
        }
      }

      // Montar campos para atualização
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.code !== undefined) {
        updateFields.push('sku = ?');
        updateValues.push(data.code);
      }
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.barcode !== undefined) {
        updateFields.push('barcode = ?');
        updateValues.push(data.barcode || null);
      }
      if (data.categoryId !== undefined) {
        updateFields.push('category_id = ?');
        updateValues.push(data.categoryId || null);
      }
      if (data.unitId !== undefined) {
        updateFields.push('primary_unit_id = ?');
        updateValues.push(data.unitId);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description || null);
      }
      if (data.costPrice !== undefined) {
        updateFields.push('cost_price = ?');
        updateValues.push(data.costPrice || null);
      }
      if (data.salePrice !== undefined) {
        updateFields.push('sale_price = ?');
        updateValues.push(data.salePrice || null);
      }
      if (data.minStock !== undefined) {
        updateFields.push('min_stock_global = ?');
        updateValues.push(data.minStock);
      }
      if (data.trackStock !== undefined) {
        updateFields.push('track_inventory = ?');
        updateValues.push(data.trackStock ? 1 : 0);
      }
      if (data.images !== undefined) {
        const imageUrl = Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null;
        updateFields.push('image_url = ?');
        updateValues.push(imageUrl);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      await queryRunner.query(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;

      // Verificar se produto existe
      const existing = await queryRunner.query(
        `SELECT id FROM products WHERE id = ?`,
        [id]
      );

      if (existing.length === 0) {
        throw new AppError('Produto não encontrado', 404);
      }

      // Soft delete
      await queryRunner.query(
        `DELETE FROM products WHERE id = ?`,
        [id]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Produto excluído com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
