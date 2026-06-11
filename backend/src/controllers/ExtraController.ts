import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateExtraInput, UpdateExtraInput } from '@/validators/extra.validator';

interface ExtraResponse {
  id: number;
  propertyId: number;
  code: string;
  name: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  pricingType: string;
  price: number | null;
  percentage: number | null;
  isTaxable: boolean;
  requiresConfirmation: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/** API/Frontend usa 'amenities'|'services'|'experiences'|'transport' -> BD extra_categories.CODE usa 'amenity'|'service'|'experience'|'transport' */
function categoryFromDb(dbCode: string | null): string {
  if (!dbCode) return 'services';
  const map: Record<string, string> = { amenity: 'amenities', service: 'services', experience: 'experiences', transport: 'transport' };
  return map[dbCode] ?? dbCode;
}
function categoryToDb(apiCategory: string): string {
  const map: Record<string, string> = { amenities: 'amenity', services: 'service', experiences: 'experience', transport: 'transport' };
  return map[apiCategory] ?? apiCategory;
}
/** API usa 'per_day', BD usa 'per_night'; API pode usar 'percentage' onde o BD não tem no ENUM - mapear para valor aceito */
function pricingTypeToDb(pt: string): string {
  if (pt === 'per_day') return 'per_night';
  if (pt === 'percentage') return 'fixed';
  return pt;
}
function pricingTypeFromDb(pt: string | null): string {
  if (pt === 'per_night') return 'per_day';
  return pt ?? 'fixed';
}

export class ExtraController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, category, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          e.id,
          e.property_id as propertyId,
          e.code,
          e.name,
          ec.CODE as categoryCode,
          e.description,
          e.image_url as imageUrl,
          e.pricing_type as pricingType,
          e.price,
          e.percentage,
          e.is_taxable as isTaxable,
          e.requires_confirmation as requiresConfirmation,
          e.is_popular as isPopular,
          e.is_featured as isFeatured,
          e.status,
          e.created_at as createdAt,
          e.updated_at as updatedAt,
          p.name as propertyName
        FROM extras e
        LEFT JOIN extra_categories ec ON e.category_id = ec.id
        LEFT JOIN properties p ON e.property_id = p.id
        WHERE 1=1
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          e.name LIKE ? OR 
          e.code LIKE ? OR
          e.description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (propertyId) {
        query += ` AND e.property_id = ?`;
        params.push(propertyId);
      }
      if (category) {
        query += ` AND ec.CODE = ?`;
        params.push(categoryToDb(category as string));
      }
      if (status) {
        query += ` AND e.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY ec.CODE ASC, e.name ASC`;

      const extras = await queryRunner.query(query, params);
      await queryRunner.release();

      const extrasResponse: ExtraResponse[] = extras.map((row: any) => ({
        id: row.id,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        category: categoryFromDb(row.categoryCode),
        description: row.description,
        imageUrl: row.imageUrl ?? null,
        pricingType: pricingTypeFromDb(row.pricingType),
        price: row.price != null ? Number(row.price) : null,
        percentage: row.percentage != null ? Number(row.percentage) : null,
        isTaxable: row.isTaxable === 1 || row.isTaxable === true,
        requiresConfirmation: row.requiresConfirmation === 1 || row.requiresConfirmation === true,
        isPopular: row.isPopular === 1 || row.isPopular === true,
        isFeatured: row.isFeatured === 1 || row.isFeatured === true,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { extras: extrasResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const query = `
        SELECT 
          e.id,
          e.property_id as propertyId,
          e.code,
          e.name,
          ec.CODE as categoryCode,
          e.description,
          e.image_url as imageUrl,
          e.pricing_type as pricingType,
          e.price,
          e.percentage,
          e.is_taxable as isTaxable,
          e.requires_confirmation as requiresConfirmation,
          e.is_popular as isPopular,
          e.is_featured as isFeatured,
          e.status,
          e.created_at as createdAt,
          e.updated_at as updatedAt,
          p.name as propertyName
        FROM extras e
        LEFT JOIN extra_categories ec ON e.category_id = ec.id
        LEFT JOIN properties p ON e.property_id = p.id
        WHERE e.id = ?
      `;

      const results = await queryRunner.query(query, [id]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Extra/Serviço não encontrado', 404);
      }

      const row = results[0];

      const extraResponse: ExtraResponse = {
        id: row.id,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        category: categoryFromDb(row.categoryCode),
        description: row.description,
        imageUrl: row.imageUrl ?? null,
        pricingType: pricingTypeFromDb(row.pricingType),
        price: row.price ? Number(row.price) : null,
        percentage: row.percentage ? Number(row.percentage) : null,
        isTaxable: row.isTaxable === 1 || row.isTaxable === true,
        requiresConfirmation: row.requiresConfirmation === 1 || row.requiresConfirmation === true,
        isPopular: row.isPopular === 1 || row.isPopular === true,
        isFeatured: row.isFeatured === 1 || row.isFeatured === true,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: extraResponse,
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
      const data: CreateExtraInput = req.body;

      const propertyIdVal = String(data.propertyId);
      const categoryCode = categoryToDb(data.category);

      const categoryRow = await queryRunner.query(
        `SELECT id FROM extra_categories WHERE CODE = ? LIMIT 1`,
        [categoryCode]
      );
      if (categoryRow.length === 0) {
        throw new AppError(`Categoria inválida: ${data.category}`, 400);
      }
      const categoryId = categoryRow[0].id;

      const existingExtra = await queryRunner.query(
        `SELECT id FROM extras WHERE property_id = ? AND code = ?`,
        [propertyIdVal, data.code]
      );

      if (existingExtra.length > 0) {
        throw new AppError('Já existe um extra/serviço com este código para esta propriedade', 400);
      }

      // Validar preço/percentual conforme tipo
      if (data.pricingType === 'percentage' && (!data.percentage || data.percentage <= 0)) {
        throw new AppError('Percentual é obrigatório para tipo percentual', 400);
      } else if (data.pricingType !== 'percentage' && (!data.price || data.price <= 0)) {
        throw new AppError('Preço é obrigatório para este tipo de cobrança', 400);
      }

      const insertQuery = `
        INSERT INTO extras (
          uuid, property_id, category_id, code, name, description, image_url,
          pricing_type, price, percentage, is_taxable, requires_confirmation, is_popular, is_featured, status
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        propertyIdVal,
        categoryId,
        data.code,
        data.name,
        data.description || null,
        data.imageUrl ?? null,
        pricingTypeToDb(data.pricingType),
        data.pricingType === 'percentage' ? null : (data.price || null),
        data.pricingType === 'percentage' ? (data.percentage || null) : null,
        data.isTaxable !== false ? 1 : 0,
        data.requiresConfirmation ? 1 : 0,
        data.isPopular ? 1 : 0,
        data.isFeatured ? 1 : 0,
        data.status || 'active',
      ]);

      const insertResult = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      const newId = insertResult[0]?.id ?? insertResult[0]?.ID;

      await queryRunner.commitTransaction();

      await queryRunner.release();

      res.status(201).json({
        success: true,
        data: { id: newId },
        message: 'Extra/Serviço criado com sucesso',
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
      const data: UpdateExtraInput = req.body;

      // Verificar se extra existe
      const existingExtra = await queryRunner.query(
        `SELECT id, property_id, code FROM extras WHERE id = ?`,
        [parseInt(id, 10)]
      );

      if (existingExtra.length === 0) {
        throw new AppError('Extra/Serviço não encontrado', 404);
      }

      const currentExtra = existingExtra[0];

      // Se código foi alterado, verificar duplicidade
      if (data.code && data.code !== currentExtra.code) {
        const propertyIdToCheck = data.propertyId || currentExtra.property_id;
        const duplicateCheck = await queryRunner.query(
          `SELECT id FROM extras WHERE property_id = ? AND code = ? AND id != ?`,
          [propertyIdToCheck, data.code, parseInt(id, 10)]
        );

        if (duplicateCheck.length > 0) {
          throw new AppError('Já existe um extra/serviço com este código para esta propriedade', 400);
        }
      }

      // Validar preço/percentual se pricingType foi alterado
      const pricingTypeToCheck = data.pricingType;
      if (pricingTypeToCheck) {
        if (pricingTypeToCheck === 'percentage' && (!data.percentage || data.percentage <= 0)) {
          throw new AppError('Percentual é obrigatório para tipo percentual', 400);
        } else if (pricingTypeToCheck !== 'percentage' && (!data.price || data.price <= 0)) {
          throw new AppError('Preço é obrigatório para este tipo de cobrança', 400);
        }
      }

      // Construir query de update dinamicamente
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.propertyId !== undefined) {
        updateFields.push('property_id = ?');
        updateValues.push(data.propertyId);
      }
      if (data.code !== undefined) {
        updateFields.push('code = ?');
        updateValues.push(data.code);
      }
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.category !== undefined) {
        const categoryCode = categoryToDb(data.category);
        const catRow = await queryRunner.query(`SELECT id FROM extra_categories WHERE CODE = ? LIMIT 1`, [categoryCode]);
        if (catRow.length === 0) {
          throw new AppError(`Categoria inválida: ${data.category}`, 400);
        }
        updateFields.push('category_id = ?');
        updateValues.push(catRow[0].id);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description || null);
      }
      if (data.imageUrl !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(data.imageUrl ?? null);
      }
      if (data.pricingType !== undefined) {
        updateFields.push('pricing_type = ?');
        updateValues.push(pricingTypeToDb(data.pricingType));
      }
      if (data.price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(data.pricingType === 'percentage' ? null : (data.price || null));
      }
      if (data.percentage !== undefined) {
        updateFields.push('percentage = ?');
        updateValues.push(data.pricingType === 'percentage' ? (data.percentage || null) : null);
      }
      if (data.isTaxable !== undefined) {
        updateFields.push('is_taxable = ?');
        updateValues.push(data.isTaxable ? 1 : 0);
      }
      if (data.requiresConfirmation !== undefined) {
        updateFields.push('requires_confirmation = ?');
        updateValues.push(data.requiresConfirmation ? 1 : 0);
      }
      if (data.isPopular !== undefined) {
        updateFields.push('is_popular = ?');
        updateValues.push(data.isPopular ? 1 : 0);
      }
      if (data.isFeatured !== undefined) {
        updateFields.push('is_featured = ?');
        updateValues.push(data.isFeatured ? 1 : 0);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }

      if (updateFields.length === 0) {
        throw new AppError('Nenhum campo para atualizar', 400);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(parseInt(id, 10));

      const updateQuery = `UPDATE extras SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Extra/Serviço atualizado com sucesso',
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

      // Verificar se extra existe
      const existingExtra = await queryRunner.query(
        `SELECT id FROM extras WHERE id = ?`,
        [parseInt(id, 10)]
      );

      if (existingExtra.length === 0) {
        throw new AppError('Extra/Serviço não encontrado', 404);
      }

      // Exclusão física (compatível com tabela sem deleted_at)
      await queryRunner.query(`DELETE FROM extras WHERE id = ?`, [parseInt(id, 10)]);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Extra/Serviço excluído com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
