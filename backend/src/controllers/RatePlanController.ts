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

const SELECT_FIELDS = `
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
`;

function mapRow(row: any): RatePlanResponse {
  let restrictions: Record<string, any> | null = null;
  let cancellationPolicy: Record<string, any> | null = null;
  let propertyTypes: string[] | null = null;
  let stayTypes: string[] | null = null;
  let inclusions: string[] | null = null;

  try {
    if (row.restrictions) {
      restrictions =
        typeof row.restrictions === 'string' ? JSON.parse(row.restrictions) : row.restrictions;
      propertyTypes = restrictions?.propertyTypes || null;
      stayTypes = restrictions?.stayTypes || null;
      inclusions = restrictions?.inclusions || null;
    }
    if (row.cancellationPolicy) {
      cancellationPolicy =
        typeof row.cancellationPolicy === 'string'
          ? JSON.parse(row.cancellationPolicy)
          : row.cancellationPolicy;
    }
  } catch {
    // ignore JSON parse errors
  }

  return {
    id: Number(row.id),
    uuid: row.uuid,
    propertyId: Number(row.propertyId),
    name: row.name,
    code: row.code,
    description: row.description,
    type: row.type,
    status: row.status,
    currency: row.currency || 'BRL',
    baseRate: row.baseRate != null ? Number(row.baseRate) : 0,
    discountPercentage:
      row.discountPercentage != null ? Number(row.discountPercentage) : null,
    minStay: row.minStay != null ? Number(row.minStay) : null,
    maxStay: row.maxStay != null ? Number(row.maxStay) : null,
    advanceBookingDays:
      row.advanceBookingDays != null ? Number(row.advanceBookingDays) : null,
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
}

function buildRestrictionsJson(input: {
  propertyTypes?: string[] | null;
  stayTypes?: string[] | null;
  inclusions?: string[] | null;
  base?: Record<string, any> | null;
}): string | null {
  const restrictions: Record<string, any> = { ...(input.base || {}) };

  if (input.propertyTypes !== undefined) {
    if (input.propertyTypes && input.propertyTypes.length > 0) {
      restrictions.propertyTypes = input.propertyTypes;
    } else {
      delete restrictions.propertyTypes;
    }
  }
  if (input.stayTypes !== undefined) {
    if (input.stayTypes && input.stayTypes.length > 0) {
      restrictions.stayTypes = input.stayTypes;
    } else {
      delete restrictions.stayTypes;
    }
  }
  if (input.inclusions !== undefined) {
    if (input.inclusions && input.inclusions.length > 0) {
      restrictions.inclusions = input.inclusions;
    } else {
      delete restrictions.inclusions;
    }
  }

  return Object.keys(restrictions).length > 0 ? JSON.stringify(restrictions) : null;
}

export class RatePlanController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, type, status } = req.query;

      let query = `
        SELECT ${SELECT_FIELDS}
        FROM rate_plans
        WHERE deleted_at IS NULL
      `;
      const params: unknown[] = [];

      if (search) {
        query += ` AND (name LIKE ? OR code LIKE ? OR description LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      if (propertyId) {
        query += ` AND property_id = ?`;
        params.push(parseInt(String(propertyId), 10));
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

      const rows = await AppDataSource.query(query, params);
      res.json({
        success: true,
        data: { ratePlans: rows.map(mapRow) },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError('ID inválido', 400);

      const rows = await AppDataSource.query(
        `SELECT ${SELECT_FIELDS} FROM rate_plans WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      if (!rows.length) throw new AppError('Plano tarifário não encontrado', 404);

      res.json({ success: true, data: mapRow(rows[0]) });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateRatePlanInput = req.body;

      const propertyRows = await AppDataSource.query(
        `SELECT id FROM properties WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [data.propertyId],
      );
      if (!propertyRows.length) {
        throw new AppError('Propriedade não encontrada', 404);
      }

      let code = (data.code || '').trim();
      if (!code) {
        const namePrefix = data.name
          .substring(0, 3)
          .toUpperCase()
          .replace(/\s/g, '');
        code = `${namePrefix}${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`;
      }

      const existingCode = await AppDataSource.query(
        `SELECT id, deleted_at FROM rate_plans WHERE property_id = ? AND code = ? LIMIT 1`,
        [data.propertyId, code],
      );
      if (existingCode.length > 0) {
        if (!existingCode[0].deleted_at && data.code?.trim()) {
          throw new AppError('Já existe um plano com este código nesta propriedade', 409);
        }
        // Soft-deleted ou código gerado: evita colisão com UNIQUE (property_id, code)
        code = `${code.slice(0, 6)}${Date.now().toString().slice(-6)}`.slice(0, 50);
      }

      const restrictionsJson = buildRestrictionsJson({
        propertyTypes: data.propertyTypes,
        stayTypes: data.stayTypes,
        inclusions: data.inclusions,
        base: data.restrictions || null,
      });

      const uuid = uuidv4();
      const result = await AppDataSource.query(
        `INSERT INTO rate_plans (
          uuid, property_id, name, code, description, type, status, currency, base_rate,
          discount_percentage, min_stay, max_stay, advance_booking_days,
          valid_from, valid_to, restrictions, cancellation_policy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          data.propertyId,
          data.name.trim(),
          code,
          data.description?.trim() || null,
          data.type,
          data.status || 'active',
          data.currency || 'BRL',
          data.baseRate ?? 0,
          data.discountPercentage ?? null,
          data.minStay ?? null,
          data.maxStay ?? null,
          data.advanceBookingDays ?? null,
          data.validFrom || null,
          data.validTo || null,
          restrictionsJson,
          data.cancellationPolicy ? JSON.stringify(data.cancellationPolicy) : null,
        ],
      );

      const rows = await AppDataSource.query(
        `SELECT ${SELECT_FIELDS} FROM rate_plans WHERE id = ? LIMIT 1`,
        [Number(result.insertId)],
      );

      res.status(201).json({ success: true, data: mapRow(rows[0]) });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError('ID inválido', 400);

      const data: UpdateRatePlanInput = req.body;
      const existing = await AppDataSource.query(
        `SELECT id, restrictions FROM rate_plans WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      if (!existing.length) throw new AppError('Plano tarifário não encontrado', 404);

      if (data.propertyId != null) {
        const propertyRows = await AppDataSource.query(
          `SELECT id FROM properties WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
          [data.propertyId],
        );
        if (!propertyRows.length) throw new AppError('Propriedade não encontrada', 404);
      }

      if (data.code != null) {
        const propertyId =
          data.propertyId ??
          (
            await AppDataSource.query(`SELECT property_id FROM rate_plans WHERE id = ?`, [id])
          )[0]?.property_id;
        const dup = await AppDataSource.query(
          `SELECT id FROM rate_plans
           WHERE property_id = ? AND code = ? AND id <> ? AND deleted_at IS NULL LIMIT 1`,
          [propertyId, data.code, id],
        );
        if (dup.length) {
          throw new AppError('Já existe um plano com este código nesta propriedade', 409);
        }
      }

      const updateFields: string[] = [];
      const updateParams: unknown[] = [];

      if (data.propertyId !== undefined) {
        updateFields.push('property_id = ?');
        updateParams.push(data.propertyId);
      }
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateParams.push(data.name.trim());
      }
      if (data.code !== undefined) {
        updateFields.push('code = ?');
        updateParams.push(data.code);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateParams.push(data.description?.trim() || null);
      }
      if (data.type !== undefined) {
        updateFields.push('type = ?');
        updateParams.push(data.type);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(data.status);
      }
      if (data.currency !== undefined) {
        updateFields.push('currency = ?');
        updateParams.push(data.currency);
      }
      if (data.baseRate !== undefined) {
        updateFields.push('base_rate = ?');
        updateParams.push(data.baseRate);
      }
      if (data.discountPercentage !== undefined) {
        updateFields.push('discount_percentage = ?');
        updateParams.push(data.discountPercentage);
      }
      if (data.minStay !== undefined) {
        updateFields.push('min_stay = ?');
        updateParams.push(data.minStay);
      }
      if (data.maxStay !== undefined) {
        updateFields.push('max_stay = ?');
        updateParams.push(data.maxStay);
      }
      if (data.advanceBookingDays !== undefined) {
        updateFields.push('advance_booking_days = ?');
        updateParams.push(data.advanceBookingDays);
      }
      if (data.validFrom !== undefined) {
        updateFields.push('valid_from = ?');
        updateParams.push(data.validFrom || null);
      }
      if (data.validTo !== undefined) {
        updateFields.push('valid_to = ?');
        updateParams.push(data.validTo || null);
      }
      if (data.cancellationPolicy !== undefined) {
        updateFields.push('cancellation_policy = ?');
        updateParams.push(
          data.cancellationPolicy ? JSON.stringify(data.cancellationPolicy) : null,
        );
      }

      if (
        data.propertyTypes !== undefined ||
        data.stayTypes !== undefined ||
        data.inclusions !== undefined ||
        data.restrictions !== undefined
      ) {
        let currentRestrictions: Record<string, any> = {};
        if (existing[0]?.restrictions) {
          try {
            currentRestrictions =
              typeof existing[0].restrictions === 'string'
                ? JSON.parse(existing[0].restrictions)
                : existing[0].restrictions || {};
          } catch {
            currentRestrictions = {};
          }
        }
        if (data.restrictions && typeof data.restrictions === 'object') {
          currentRestrictions = { ...currentRestrictions, ...data.restrictions };
        }

        const restrictionsJson = buildRestrictionsJson({
          propertyTypes: data.propertyTypes,
          stayTypes: data.stayTypes,
          inclusions: data.inclusions,
          base: currentRestrictions,
        });
        updateFields.push('restrictions = ?');
        updateParams.push(restrictionsJson);
      }

      if (!updateFields.length) {
        throw new AppError('Nenhum campo para atualizar', 400);
      }

      updateFields.push('updated_at = NOW()');
      updateParams.push(id);

      await AppDataSource.query(
        `UPDATE rate_plans SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
        updateParams,
      );

      const rows = await AppDataSource.query(
        `SELECT ${SELECT_FIELDS} FROM rate_plans WHERE id = ? LIMIT 1`,
        [id],
      );

      res.json({ success: true, data: mapRow(rows[0]) });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError('ID inválido', 400);

      const existing = await AppDataSource.query(
        `SELECT id FROM rate_plans WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      if (!existing.length) throw new AppError('Plano tarifário não encontrado', 404);

      await AppDataSource.query(`UPDATE rate_plans SET deleted_at = NOW() WHERE id = ?`, [id]);

      res.json({
        success: true,
        message: 'Plano tarifário excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
