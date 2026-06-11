import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

export class PolicyController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, policyType, status } = req.query;
      const params: any[] = [];

      let query = `
        SELECT
          id,
          uuid,
          property_id as propertyId,
          code,
          name,
          policy_type as policyType,
          cancellation_policy as cancellationPolicy,
          cancellation_deadline as cancellationDeadline,
          refund_percentage as refundPercentage,
          check_in_time as checkInTime,
          check_out_time as checkOutTime,
          min_age as minAge,
          max_occupancy as maxOccupancy,
          children_policy as childrenPolicy,
          pets_allowed as petsAllowed,
          pet_fee as petFee,
          deposit_required as depositRequired,
          deposit_type as depositType,
          deposit_amount as depositAmount,
          description,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM policies
        WHERE deleted_at IS NULL
      `;

      if (search) {
        query += ` AND (name LIKE ? OR code LIKE ? OR description LIKE ?)`;
        const s = `%${String(search)}%`;
        params.push(s, s, s);
      }
      if (propertyId) {
        query += ` AND property_id = ?`;
        params.push(Number(propertyId));
      }
      if (policyType) {
        query += ` AND policy_type = ?`;
        params.push(String(policyType));
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(String(status));
      }

      query += ` ORDER BY created_at DESC`;
      const rows = await AppDataSource.query(query, params);

      const policies = (rows as any[]).map((row) => ({
        ...row,
        cancellationDeadline: row.cancellationDeadline != null ? Number(row.cancellationDeadline) : null,
        refundPercentage: row.refundPercentage != null ? Number(row.refundPercentage) : null,
        minAge: row.minAge != null ? Number(row.minAge) : null,
        maxOccupancy: row.maxOccupancy != null ? Number(row.maxOccupancy) : null,
        petsAllowed: Boolean(row.petsAllowed),
        petFee: row.petFee != null ? Number(row.petFee) : null,
        depositRequired: Boolean(row.depositRequired),
        depositAmount: row.depositAmount != null ? Number(row.depositAmount) : null,
      }));

      res.json({ success: true, data: { policies } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) throw new AppError('ID inválido', 400);

      const rows = await AppDataSource.query(
        `SELECT
          id,
          uuid,
          property_id as propertyId,
          code,
          name,
          policy_type as policyType,
          cancellation_policy as cancellationPolicy,
          cancellation_deadline as cancellationDeadline,
          refund_percentage as refundPercentage,
          check_in_time as checkInTime,
          check_out_time as checkOutTime,
          min_age as minAge,
          max_occupancy as maxOccupancy,
          children_policy as childrenPolicy,
          pets_allowed as petsAllowed,
          pet_fee as petFee,
          deposit_required as depositRequired,
          deposit_type as depositType,
          deposit_amount as depositAmount,
          description,
          status,
          created_at as createdAt,
          updated_at as updatedAt
         FROM policies
         WHERE id = ? AND deleted_at IS NULL
         LIMIT 1`,
        [id]
      );

      if (!rows.length) throw new AppError('Política não encontrada', 404);
      const row: any = rows[0];

      res.json({
        success: true,
        data: {
          policy: {
            ...row,
            cancellationDeadline: row.cancellationDeadline != null ? Number(row.cancellationDeadline) : null,
            refundPercentage: row.refundPercentage != null ? Number(row.refundPercentage) : null,
            minAge: row.minAge != null ? Number(row.minAge) : null,
            maxOccupancy: row.maxOccupancy != null ? Number(row.maxOccupancy) : null,
            petsAllowed: Boolean(row.petsAllowed),
            petFee: row.petFee != null ? Number(row.petFee) : null,
            depositRequired: Boolean(row.depositRequired),
            depositAmount: row.depositAmount != null ? Number(row.depositAmount) : null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body || {};
      if (!data.propertyId) throw new AppError('propertyId é obrigatório', 400);
      if (!data.name) throw new AppError('name é obrigatório', 400);
      if (!data.policyType) throw new AppError('policyType é obrigatório', 400);

      const code = data.code || `POL-${Date.now().toString().slice(-6)}`;
      const uuid = uuidv4();

      await AppDataSource.query(
        `INSERT INTO policies (
          uuid, property_id, code, name, policy_type, cancellation_policy, cancellation_deadline, refund_percentage,
          check_in_time, check_out_time, min_age, max_occupancy, children_policy, pets_allowed, pet_fee,
          deposit_required, deposit_type, deposit_amount, description, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          uuid,
          Number(data.propertyId),
          String(code),
          String(data.name),
          String(data.policyType),
          data.cancellationPolicy || null,
          data.cancellationDeadline != null ? Number(data.cancellationDeadline) : null,
          data.refundPercentage != null ? Number(data.refundPercentage) : null,
          data.checkInTime || '14:00:00',
          data.checkOutTime || '12:00:00',
          data.minAge != null ? Number(data.minAge) : 18,
          data.maxOccupancy != null ? Number(data.maxOccupancy) : null,
          data.childrenPolicy || null,
          data.petsAllowed ? 1 : 0,
          data.petFee != null ? Number(data.petFee) : null,
          data.depositRequired ? 1 : 0,
          data.depositType || null,
          data.depositAmount != null ? Number(data.depositAmount) : null,
          data.description || null,
          data.status || 'active',
        ]
      );

      const created = await AppDataSource.query(
        `SELECT id, uuid FROM policies WHERE uuid = ? LIMIT 1`,
        [uuid]
      );

      res.status(201).json({ success: true, data: { id: created[0]?.id, uuid } });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) throw new AppError('ID inválido', 400);

      const existing = await AppDataSource.query(
        `SELECT id FROM policies WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      if (!existing.length) throw new AppError('Política não encontrada', 404);

      const data = req.body || {};
      const updates: string[] = [];
      const params: any[] = [];

      const add = (field: string, value: any) => {
        updates.push(`${field} = ?`);
        params.push(value);
      };

      if (data.propertyId !== undefined) add('property_id', Number(data.propertyId));
      if (data.code !== undefined) add('code', data.code || null);
      if (data.name !== undefined) add('name', data.name || null);
      if (data.policyType !== undefined) add('policy_type', data.policyType || null);
      if (data.cancellationPolicy !== undefined) add('cancellation_policy', data.cancellationPolicy || null);
      if (data.cancellationDeadline !== undefined) add('cancellation_deadline', data.cancellationDeadline !== null ? Number(data.cancellationDeadline) : null);
      if (data.refundPercentage !== undefined) add('refund_percentage', data.refundPercentage !== null ? Number(data.refundPercentage) : null);
      if (data.checkInTime !== undefined) add('check_in_time', data.checkInTime || null);
      if (data.checkOutTime !== undefined) add('check_out_time', data.checkOutTime || null);
      if (data.minAge !== undefined) add('min_age', data.minAge !== null ? Number(data.minAge) : null);
      if (data.maxOccupancy !== undefined) add('max_occupancy', data.maxOccupancy !== null ? Number(data.maxOccupancy) : null);
      if (data.childrenPolicy !== undefined) add('children_policy', data.childrenPolicy || null);
      if (data.petsAllowed !== undefined) add('pets_allowed', data.petsAllowed ? 1 : 0);
      if (data.petFee !== undefined) add('pet_fee', data.petFee !== null ? Number(data.petFee) : null);
      if (data.depositRequired !== undefined) add('deposit_required', data.depositRequired ? 1 : 0);
      if (data.depositType !== undefined) add('deposit_type', data.depositType || null);
      if (data.depositAmount !== undefined) add('deposit_amount', data.depositAmount !== null ? Number(data.depositAmount) : null);
      if (data.description !== undefined) add('description', data.description || null);
      if (data.status !== undefined) add('status', data.status || null);

      if (updates.length === 0) throw new AppError('Nenhum campo para atualizar', 400);

      params.push(id);
      await AppDataSource.query(
        `UPDATE policies SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        params
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) throw new AppError('ID inválido', 400);

      const result = await AppDataSource.query(
        `UPDATE policies SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      if (!result?.affectedRows && !result?.changedRows) {
        const check = await AppDataSource.query(`SELECT id FROM policies WHERE id = ? LIMIT 1`, [id]);
        if (!check.length) throw new AppError('Política não encontrada', 404);
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

