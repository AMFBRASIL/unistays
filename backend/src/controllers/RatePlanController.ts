import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateRatePlanInput, UpdateRatePlanInput } from '@/validators/ratePlan.validator';
import { v4 as uuidv4 } from 'uuid';

interface RatePlanResponse {
  id: number;
  uuid: string;
  propertyId: number;
  name: string;
  code: string;
  description: string | null;
  type: string;
  status: string;
  currency: string;
  baseRate: number;
  discountPercentage: number | null;
  minStay: number | null;
  maxStay: number | null;
  advanceBookingDays: number | null;
  validFrom: Date | null;
  validTo: Date | null;
  propertyTypes: string[] | null;
  stayTypes: string[] | null;
  inclusions: string[] | null;
  cancellationPolicy: Record<string, any> | null;
  restrictions: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RatePlanController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, type, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          property_id as propertyId,
          name,
          code,
          description,
          type,
          status,
          currency,
          base_rate as baseRate,
          discount_percentage as discountPercentage,
          min_stay as minStay,
          max_stay as maxStay,
          advance_booking_days as advanceBookingDays,
          valid_from as validFrom,
          valid_to as validTo,
          restrictions,
          cancellation_policy as cancellationPolicy,
          created_at as createdAt,
          updated_at as updatedAt
        FROM rate_plans
        WHERE deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          name LIKE ? OR 
          code LIKE ? OR
          description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (propertyId) {
        query += ` AND property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }
      if (type) {
        query += ` AND type = ?`;
        params.push(type);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC`;

      const ratePlans = await queryRunner.query(query, params);
      await queryRunner.release();

      // Mapear resultados e parse JSON fields
      const ratePlansResponse: RatePlanResponse[] = ratePlans.map((row: any) => {
        let restrictions = null;
        let cancellationPolicy = null;
        let propertyTypes = null;
        let stayTypes = null;
        let inclusions = null;

        try {
          if (row.restrictions) {
            const parsed = typeof row.restrictions === 'string' ? JSON.parse(row.restrictions) : row.restrictions;
            restrictions = parsed;
            propertyTypes = parsed.propertyTypes || null;
            stayTypes = parsed.stayTypes || null;
            inclusions = parsed.inclusions || null;
          }
          if (row.cancellationPolicy) {
            cancellationPolicy = typeof row.cancellationPolicy === 'string' ? JSON.parse(row.cancellationPolicy) : row.cancellationPolicy;
          }
        } catch (error) {
          // Ignore JSON parse errors
        }

        return {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          name: row.name,
          code: row.code,
          description: row.description,
          type: row.type,
          status: row.status,
          currency: row.currency || 'BRL',
          baseRate: row.baseRate ? Number(row.baseRate) : 0,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          advanceBookingDays: row.advanceBookingDays ? Number(row.advanceBookingDays) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          stayTypes,
          inclusions,
          cancellationPolicy,
          restrictions,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      });

      res.json({
        success: true,
        data: { ratePlans: ratePlansResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        const query = `
          SELECT 
            id,
            uuid,
            property_id as propertyId,
            name,
            code,
            description,
            type,
            status,
            currency,
            base_rate as baseRate,
            discount_percentage as discountPercentage,
            min_stay as minStay,
            max_stay as maxStay,
            advance_booking_days as advanceBookingDays,
            valid_from as validFrom,
            valid_to as validTo,
            restrictions,
            cancellation_policy as cancellationPolicy,
            created_at as createdAt,
            updated_at as updatedAt
          FROM rate_plans
          WHERE id = ? AND deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Plano tarifário não encontrado', 404);
        }

        const row = results[0];

        // Parse JSON fields
        let restrictions = null;
        let cancellationPolicy = null;
        let propertyTypes = null;
        let stayTypes = null;
        let inclusions = null;

        try {
          if (row.restrictions) {
            const parsed = typeof row.restrictions === 'string' ? JSON.parse(row.restrictions) : row.restrictions;
            restrictions = parsed;
            propertyTypes = parsed.propertyTypes || null;
            stayTypes = parsed.stayTypes || null;
            inclusions = parsed.inclusions || null;
          }
          if (row.cancellationPolicy) {
            cancellationPolicy = typeof row.cancellationPolicy === 'string' ? JSON.parse(row.cancellationPolicy) : row.cancellationPolicy;
          }
        } catch (error) {
          // Ignore JSON parse errors
        }

        const ratePlanResponse: RatePlanResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          name: row.name,
          code: row.code,
          description: row.description,
          type: row.type,
          status: row.status,
          currency: row.currency || 'BRL',
          baseRate: row.baseRate ? Number(row.baseRate) : 0,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          advanceBookingDays: row.advanceBookingDays ? Number(row.advanceBookingDays) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          stayTypes,
          inclusions,
          cancellationPolicy,
          restrictions,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: ratePlanResponse,
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateRatePlanInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Gerar código se não fornecido
        let code = data.code;
        if (!code || code.trim() === '') {
          const namePrefix = data.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          code = `${namePrefix}${randomSuffix}`;
          
          // Verificar se código já existe para esta propriedade
          const existingCode = await queryRunner.query(
            `SELECT id FROM rate_plans WHERE property_id = ? AND code = ? AND deleted_at IS NULL`,
            [data.propertyId, code]
          );
          
          if (existingCode.length > 0) {
            code = `${namePrefix}${Date.now().toString().slice(-3)}`;
          }
        }

        // Preparar restrictions JSON com propertyTypes, stayTypes e inclusions
        const restrictions: Record<string, any> = {};
        if (data.propertyTypes && data.propertyTypes.length > 0) {
          restrictions.propertyTypes = data.propertyTypes;
        }
        if (data.stayTypes && data.stayTypes.length > 0) {
          restrictions.stayTypes = data.stayTypes;
        }
        if (data.inclusions && data.inclusions.length > 0) {
          restrictions.inclusions = data.inclusions;
        }
        const restrictionsJson = Object.keys(restrictions).length > 0 ? JSON.stringify(restrictions) : null;

        const uuid = uuidv4();
        const insertQuery = `
          INSERT INTO rate_plans (
            uuid, property_id, name, code, description, type, status, currency, base_rate,
            discount_percentage, min_stay, max_stay, advance_booking_days,
            valid_from, valid_to, restrictions, cancellation_policy
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams: any[] = [
          uuid,                                          // 1. uuid
          data.propertyId,                               // 2. property_id
          data.name.trim(),                              // 3. name
          code,                                          // 4. code
          data.description?.trim() || null,              // 5. description
          data.type,                                     // 6. type
          data.status || 'active',                       // 7. status
          data.currency || 'BRL',                        // 8. currency
          data.baseRate || 0,                            // 9. base_rate
          data.discountPercentage || null,               // 10. discount_percentage
          data.minStay || null,                          // 11. min_stay
          data.maxStay || null,                          // 12. max_stay
          data.advanceBookingDays || null,               // 13. advance_booking_days
          data.validFrom || null,                        // 14. valid_from
          data.validTo || null,                          // 15. valid_to
          restrictionsJson,                              // 16. restrictions
          data.cancellationPolicy ? JSON.stringify(data.cancellationPolicy) : null, // 17. cancellation_policy
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const ratePlanId = result.insertId;

        await queryRunner.commitTransaction();

        // Buscar plano criado
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, name, code, description, type, status, currency,
            base_rate as baseRate, discount_percentage as discountPercentage,
            min_stay as minStay, max_stay as maxStay, advance_booking_days as advanceBookingDays,
            valid_from as validFrom, valid_to as validTo, restrictions, cancellation_policy as cancellationPolicy,
            created_at as createdAt, updated_at as updatedAt
          FROM rate_plans
          WHERE id = ?
        `;

        const createdRatePlan = await queryRunner.query(selectQuery, [ratePlanId]);
        await queryRunner.release();

        const row = createdRatePlan[0];

        // Parse JSON fields
        let restrictionsParsed = null;
        let cancellationPolicyParsed = null;
        let propertyTypes = null;
        let stayTypes = null;
        let inclusions = null;

        try {
          if (row.restrictions) {
            restrictionsParsed = typeof row.restrictions === 'string' ? JSON.parse(row.restrictions) : row.restrictions;
            propertyTypes = restrictionsParsed.propertyTypes || null;
            stayTypes = restrictionsParsed.stayTypes || null;
            inclusions = restrictionsParsed.inclusions || null;
          }
          if (row.cancellationPolicy) {
            cancellationPolicyParsed = typeof row.cancellationPolicy === 'string' ? JSON.parse(row.cancellationPolicy) : row.cancellationPolicy;
          }
        } catch (error) {
          // Ignore
        }

        const ratePlanResponse: RatePlanResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          name: row.name,
          code: row.code,
          description: row.description,
          type: row.type,
          status: row.status,
          currency: row.currency || 'BRL',
          baseRate: row.baseRate ? Number(row.baseRate) : 0,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          advanceBookingDays: row.advanceBookingDays ? Number(row.advanceBookingDays) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          stayTypes,
          inclusions,
          cancellationPolicy: cancellationPolicyParsed,
          restrictions: restrictionsParsed,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.status(201).json({
          success: true,
          data: ratePlanResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateRatePlanInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se o plano existe
        const checkQuery = `SELECT id FROM rate_plans WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Plano tarifário não encontrado', 404);
        }

        // Preparar restrictions JSON se necessário
        let restrictionsJson: string | null = null;
        if (data.propertyTypes !== undefined || data.stayTypes !== undefined || data.inclusions !== undefined) {
          // Buscar restrictions existentes
          const currentData = await queryRunner.query(
            `SELECT restrictions FROM rate_plans WHERE id = ?`,
            [parseInt(id, 10)]
          );
          
          let currentRestrictions: Record<string, any> = {};
          if (currentData[0]?.restrictions) {
            try {
              currentRestrictions = typeof currentData[0].restrictions === 'string' 
                ? JSON.parse(currentData[0].restrictions) 
                : currentData[0].restrictions;
            } catch (error) {
              // Ignore
            }
          }

          // Atualizar restrictions
          if (data.propertyTypes !== undefined) {
            if (data.propertyTypes && data.propertyTypes.length > 0) {
              currentRestrictions.propertyTypes = data.propertyTypes;
            } else {
              delete currentRestrictions.propertyTypes;
            }
          }
          if (data.stayTypes !== undefined) {
            if (data.stayTypes && data.stayTypes.length > 0) {
              currentRestrictions.stayTypes = data.stayTypes;
            } else {
              delete currentRestrictions.stayTypes;
            }
          }
          if (data.inclusions !== undefined) {
            if (data.inclusions && data.inclusions.length > 0) {
              currentRestrictions.inclusions = data.inclusions;
            } else {
              delete currentRestrictions.inclusions;
            }
          }

          restrictionsJson = Object.keys(currentRestrictions).length > 0 ? JSON.stringify(currentRestrictions) : null;
        }

        // Construir query de update dinamicamente
        const updateFields: string[] = [];
        const updateParams: any[] = [];

        if (data.propertyId !== undefined) { updateFields.push('property_id = ?'); updateParams.push(data.propertyId); }
        if (data.name !== undefined) { updateFields.push('name = ?'); updateParams.push(data.name.trim()); }
        if (data.code !== undefined) { updateFields.push('code = ?'); updateParams.push(data.code); }
        if (data.description !== undefined) { updateFields.push('description = ?'); updateParams.push(data.description?.trim() || null); }
        if (data.type !== undefined) { updateFields.push('type = ?'); updateParams.push(data.type); }
        if (data.status !== undefined) { updateFields.push('status = ?'); updateParams.push(data.status); }
        if (data.currency !== undefined) { updateFields.push('currency = ?'); updateParams.push(data.currency); }
        if (data.baseRate !== undefined) { updateFields.push('base_rate = ?'); updateParams.push(data.baseRate); }
        if (data.discountPercentage !== undefined) { updateFields.push('discount_percentage = ?'); updateParams.push(data.discountPercentage); }
        if (data.minStay !== undefined) { updateFields.push('min_stay = ?'); updateParams.push(data.minStay); }
        if (data.maxStay !== undefined) { updateFields.push('max_stay = ?'); updateParams.push(data.maxStay); }
        if (data.advanceBookingDays !== undefined) { updateFields.push('advance_booking_days = ?'); updateParams.push(data.advanceBookingDays); }
        if (data.validFrom !== undefined) { updateFields.push('valid_from = ?'); updateParams.push(data.validFrom || null); }
        if (data.validTo !== undefined) { updateFields.push('valid_to = ?'); updateParams.push(data.validTo || null); }
        if (restrictionsJson !== undefined) { updateFields.push('restrictions = ?'); updateParams.push(restrictionsJson); }
        if (data.cancellationPolicy !== undefined) { 
          updateFields.push('cancellation_policy = ?'); 
          updateParams.push(data.cancellationPolicy ? JSON.stringify(data.cancellationPolicy) : null); 
        }

        updateFields.push('updated_at = NOW()');
        updateParams.push(parseInt(id, 10));

        if (updateFields.length === 1) {
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        const updateQuery = `UPDATE rate_plans SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        await queryRunner.query(updateQuery, updateParams);

        await queryRunner.commitTransaction();

        // Buscar plano atualizado
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, name, code, description, type, status, currency,
            base_rate as baseRate, discount_percentage as discountPercentage,
            min_stay as minStay, max_stay as maxStay, advance_booking_days as advanceBookingDays,
            valid_from as validFrom, valid_to as validTo, restrictions, cancellation_policy as cancellationPolicy,
            created_at as createdAt, updated_at as updatedAt
          FROM rate_plans
          WHERE id = ?
        `;

        const updatedRatePlan = await queryRunner.query(selectQuery, [parseInt(id, 10)]);
        await queryRunner.release();

        const row = updatedRatePlan[0];

        // Parse JSON fields
        let restrictionsParsed = null;
        let cancellationPolicyParsed = null;
        let propertyTypes = null;
        let stayTypes = null;
        let inclusions = null;

        try {
          if (row.restrictions) {
            restrictionsParsed = typeof row.restrictions === 'string' ? JSON.parse(row.restrictions) : row.restrictions;
            propertyTypes = restrictionsParsed.propertyTypes || null;
            stayTypes = restrictionsParsed.stayTypes || null;
            inclusions = restrictionsParsed.inclusions || null;
          }
          if (row.cancellationPolicy) {
            cancellationPolicyParsed = typeof row.cancellationPolicy === 'string' ? JSON.parse(row.cancellationPolicy) : row.cancellationPolicy;
          }
        } catch (error) {
          // Ignore
        }

        const ratePlanResponse: RatePlanResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          name: row.name,
          code: row.code,
          description: row.description,
          type: row.type,
          status: row.status,
          currency: row.currency || 'BRL',
          baseRate: row.baseRate ? Number(row.baseRate) : 0,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          advanceBookingDays: row.advanceBookingDays ? Number(row.advanceBookingDays) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          stayTypes,
          inclusions,
          cancellationPolicy: cancellationPolicyParsed,
          restrictions: restrictionsParsed,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: ratePlanResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        // Verificar se o plano existe
        const checkQuery = `SELECT id, name FROM rate_plans WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Plano tarifário não encontrado', 404);
        }

        // Soft delete
        const deleteQuery = `UPDATE rate_plans SET deleted_at = NOW() WHERE id = ?`;
        await queryRunner.query(deleteQuery, [parseInt(id, 10)]);

        await queryRunner.release();

        res.json({
          success: true,
          message: 'Plano tarifário excluído com sucesso',
        });
      } catch (error) {
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
