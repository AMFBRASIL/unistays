import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateParkingInput, UpdateParkingInput } from '@/validators/parking.validator';
import { v4 as uuidv4 } from 'uuid';

interface ParkingResponse {
  id: number;
  uuid: string;
  propertyId: number;
  code: string;
  name: string;
  parkingType: string;
  pricingType: string;
  price: number | null;
  capacity: number | null;
  description: string | null;
  isTaxable: boolean;
  requiresReservation: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ParkingController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, parkingType, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          p.id,
          p.uuid,
          p.property_id as propertyId,
          p.code,
          p.name,
          p.parking_type as parkingType,
          p.pricing_type as pricingType,
          p.price,
          p.capacity,
          p.description,
          p.is_taxable as isTaxable,
          p.requires_reservation as requiresReservation,
          p.status,
          p.created_at as createdAt,
          p.updated_at as updatedAt,
          pr.name as propertyName
        FROM parking p
        LEFT JOIN properties pr ON p.property_id = pr.id AND pr.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          p.name LIKE ? OR 
          p.code LIKE ? OR
          p.description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (propertyId) {
        query += ` AND p.property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }
      if (parkingType) {
        query += ` AND p.parking_type = ?`;
        params.push(parkingType);
      }
      if (status) {
        query += ` AND p.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY p.parking_type ASC, p.name ASC`;

      const parkings = await queryRunner.query(query, params);
      await queryRunner.release();

      const parkingsResponse: ParkingResponse[] = parkings.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        parkingType: row.parkingType,
        pricingType: row.pricingType,
        price: row.price ? Number(row.price) : null,
        capacity: row.capacity ? Number(row.capacity) : null,
        description: row.description,
        isTaxable: row.isTaxable === 1 || row.isTaxable === true,
        requiresReservation: row.requiresReservation === 1 || row.requiresReservation === true,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { parkings: parkingsResponse },
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
          p.id,
          p.uuid,
          p.property_id as propertyId,
          p.code,
          p.name,
          p.parking_type as parkingType,
          p.pricing_type as pricingType,
          p.price,
          p.capacity,
          p.description,
          p.is_taxable as isTaxable,
          p.requires_reservation as requiresReservation,
          p.status,
          p.created_at as createdAt,
          p.updated_at as updatedAt,
          pr.name as propertyName
        FROM parking p
        LEFT JOIN properties pr ON p.property_id = pr.id AND pr.deleted_at IS NULL
        WHERE p.id = ? AND p.deleted_at IS NULL
      `;

      const results = await queryRunner.query(query, [parseInt(id, 10)]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Estacionamento não encontrado', 404);
      }

      const row = results[0];

      const parkingResponse: ParkingResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        parkingType: row.parkingType,
        pricingType: row.pricingType,
        price: row.price ? Number(row.price) : null,
        capacity: row.capacity ? Number(row.capacity) : null,
        description: row.description,
        isTaxable: row.isTaxable === 1 || row.isTaxable === true,
        requiresReservation: row.requiresReservation === 1 || row.requiresReservation === true,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: parkingResponse,
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
      const data: CreateParkingInput = req.body;

      // Verificar se código já existe para a propriedade
      const existingParking = await queryRunner.query(
        `SELECT id FROM parking WHERE property_id = ? AND code = ? AND deleted_at IS NULL`,
        [data.propertyId, data.code]
      );

      if (existingParking.length > 0) {
        throw new AppError('Já existe um estacionamento com este código para esta propriedade', 400);
      }

      // Validar preço conforme tipo
      if (data.pricingType !== 'free' && (!data.price || data.price <= 0)) {
        throw new AppError('Preço é obrigatório quando o tipo não é gratuito', 400);
      }

      const uuid = uuidv4();

      const insertQuery = `
        INSERT INTO parking (
          uuid, property_id, code, name, parking_type, pricing_type,
          price, capacity, description, is_taxable, requires_reservation, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        uuid,
        data.propertyId,
        data.code,
        data.name,
        data.parkingType,
        data.pricingType,
        data.pricingType === 'free' ? null : (data.price || null),
        data.capacity || null,
        data.description || null,
        data.isTaxable !== false ? 1 : 0,
        data.requiresReservation ? 1 : 0,
        data.status || 'active',
      ]);

      await queryRunner.commitTransaction();

      // Buscar o estacionamento criado
      const newParking = await queryRunner.query(
        `SELECT id FROM parking WHERE uuid = ?`,
        [uuid]
      );

      await queryRunner.release();

      res.status(201).json({
        success: true,
        data: { id: newParking[0].id, uuid },
        message: 'Estacionamento criado com sucesso',
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
      const data: UpdateParkingInput = req.body;

      // Verificar se estacionamento existe
      const existingParking = await queryRunner.query(
        `SELECT id, property_id, code, pricing_type FROM parking WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingParking.length === 0) {
        throw new AppError('Estacionamento não encontrado', 404);
      }

      const currentParking = existingParking[0];

      // Se código foi alterado, verificar duplicidade
      if (data.code && data.code !== currentParking.code) {
        const propertyIdToCheck = data.propertyId || currentParking.property_id;
        const duplicateCheck = await queryRunner.query(
          `SELECT id FROM parking WHERE property_id = ? AND code = ? AND id != ? AND deleted_at IS NULL`,
          [propertyIdToCheck, data.code, parseInt(id, 10)]
        );

        if (duplicateCheck.length > 0) {
          throw new AppError('Já existe um estacionamento com este código para esta propriedade', 400);
        }
      }

      // Validar preço se pricingType foi alterado
      const pricingTypeToCheck = data.pricingType || currentParking.pricing_type;
      if (pricingTypeToCheck !== 'free' && data.price !== undefined && data.price !== null && data.price <= 0) {
        throw new AppError('Preço deve ser maior que zero quando o tipo não é gratuito', 400);
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
      if (data.parkingType !== undefined) {
        updateFields.push('parking_type = ?');
        updateValues.push(data.parkingType);
      }
      if (data.pricingType !== undefined) {
        updateFields.push('pricing_type = ?');
        updateValues.push(data.pricingType);
      }
      if (data.price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(data.pricingType === 'free' ? null : (data.price || null));
      }
      if (data.capacity !== undefined) {
        updateFields.push('capacity = ?');
        updateValues.push(data.capacity || null);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description || null);
      }
      if (data.isTaxable !== undefined) {
        updateFields.push('is_taxable = ?');
        updateValues.push(data.isTaxable ? 1 : 0);
      }
      if (data.requiresReservation !== undefined) {
        updateFields.push('requires_reservation = ?');
        updateValues.push(data.requiresReservation ? 1 : 0);
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

      const updateQuery = `UPDATE parking SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Estacionamento atualizado com sucesso',
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

      // Verificar se estacionamento existe
      const existingParking = await queryRunner.query(
        `SELECT id FROM parking WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingParking.length === 0) {
        throw new AppError('Estacionamento não encontrado', 404);
      }

      // Soft delete
      await queryRunner.query(
        `UPDATE parking SET deleted_at = NOW() WHERE id = ?`,
        [parseInt(id, 10)]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Estacionamento excluído com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
