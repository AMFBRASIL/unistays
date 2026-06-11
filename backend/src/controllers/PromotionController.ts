import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreatePromotionInput, UpdatePromotionInput } from '@/validators/promotion.validator';
import { v4 as uuidv4 } from 'uuid';

interface PromotionResponse {
  id: number;
  uuid: string;
  propertyId: number;
  code: string;
  name: string;
  description: string | null;
  type: string;
  discountValue: number | null;
  discountPercentage: number | null;
  minValue: number | null;
  maxDiscount: number | null;
  minStay: number | null;
  maxStay: number | null;
  validFrom: Date | null;
  validTo: Date | null;
  propertyTypes: string[] | null;
  selectedDays: string[] | null;
  applicableRatePlans: number[] | null;
  applicableRoomTypes: number[] | null;
  bookingWindowStart: number | null;
  bookingWindowEnd: number | null;
  usageLimit: number | null;
  usageCount: number;
  usesPerGuest: number | null;
  showOnWebsite: boolean;
  requireCoupon: boolean;
  promoCode: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mapear tipos do modal para tipos do banco
const mapModalTypeToDbType = (modalType: string): string => {
  const typeMap: Record<string, string> = {
    'discount': 'percentage',
    'fixed': 'fixed_amount',
    'flash': 'percentage',
    'earlybird': 'percentage',
    'lastminute': 'percentage',
    'gift': 'package',
    'percentage': 'percentage',
    'fixed_amount': 'fixed_amount',
    'package': 'package',
    'free_night': 'free_night',
  };
  return typeMap[modalType] || 'percentage';
};

const mapDbTypeToModalType = (dbType: string): string => {
  const typeMap: Record<string, string> = {
    'percentage': 'discount',
    'fixed_amount': 'fixed',
    'package': 'gift',
    'free_night': 'gift',
  };
  return typeMap[dbType] || 'discount';
};

export class PromotionController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, type, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          property_id as propertyId,
          code,
          name,
          description,
          type,
          discount_value as discountValue,
          discount_percentage as discountPercentage,
          min_stay as minStay,
          max_stay as maxStay,
          valid_from as validFrom,
          valid_to as validTo,
          applicable_rate_plans as applicableRatePlans,
          applicable_room_types as applicableRoomTypes,
          booking_window_start as bookingWindowStart,
          booking_window_end as bookingWindowEnd,
          usage_limit as usageLimit,
          usage_count as usageCount,
          requires_code as requireCoupon,
          promo_code as promoCode,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM promotions
        WHERE deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          name LIKE ? OR 
          code LIKE ? OR
          description LIKE ? OR
          promo_code LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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

      const promotions = await queryRunner.query(query, params);
      await queryRunner.release();

      // Mapear resultados e parse JSON fields
      const promotionsResponse: PromotionResponse[] = promotions.map((row: any) => {
        let applicableRatePlans = null;
        let applicableRoomTypes = null;
        let propertyTypes = null;
        let selectedDays = null;

        try {
          if (row.applicableRatePlans) {
            applicableRatePlans = typeof row.applicableRatePlans === 'string' ? JSON.parse(row.applicableRatePlans) : row.applicableRatePlans;
          }
          if (row.applicableRoomTypes) {
            applicableRoomTypes = typeof row.applicableRoomTypes === 'string' ? JSON.parse(row.applicableRoomTypes) : row.applicableRoomTypes;
            
            // Se applicableRoomTypes contém propertyTypes, extrair
            if (applicableRoomTypes && applicableRoomTypes.propertyTypes) {
              propertyTypes = applicableRoomTypes.propertyTypes;
            }
            if (applicableRoomTypes && applicableRoomTypes.selectedDays) {
              selectedDays = applicableRoomTypes.selectedDays;
            }
          }
        } catch (error) {
          // Ignore JSON parse errors
        }

        return {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          name: row.name,
          description: row.description,
          type: row.type,
          discountValue: row.discountValue ? Number(row.discountValue) : null,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minValue: null,
          maxDiscount: null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          selectedDays,
          applicableRatePlans,
          applicableRoomTypes,
          bookingWindowStart: row.bookingWindowStart ? Number(row.bookingWindowStart) : null,
          bookingWindowEnd: row.bookingWindowEnd ? Number(row.bookingWindowEnd) : null,
          usageLimit: row.usageLimit ? Number(row.usageLimit) : null,
          usageCount: row.usageCount ? Number(row.usageCount) : 0,
          usesPerGuest: null,
          showOnWebsite: true,
          requireCoupon: row.requireCoupon === 1 || row.requireCoupon === true,
          promoCode: row.promoCode,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      });

      res.json({
        success: true,
        data: { promotions: promotionsResponse },
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
            code,
            name,
            description,
            type,
            discount_value as discountValue,
            discount_percentage as discountPercentage,
            min_stay as minStay,
            max_stay as maxStay,
            valid_from as validFrom,
            valid_to as validTo,
            applicable_rate_plans as applicableRatePlans,
            applicable_room_types as applicableRoomTypes,
            booking_window_start as bookingWindowStart,
            booking_window_end as bookingWindowEnd,
            usage_limit as usageLimit,
            usage_count as usageCount,
            requires_code as requireCoupon,
            promo_code as promoCode,
            status,
            created_at as createdAt,
            updated_at as updatedAt
          FROM promotions
          WHERE id = ? AND deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Promoção não encontrada', 404);
        }

        const row = results[0];

        // Parse JSON fields
        let applicableRatePlans = null;
        let applicableRoomTypes = null;
        let propertyTypes = null;
        let selectedDays = null;

        try {
          if (row.applicableRatePlans) {
            applicableRatePlans = typeof row.applicableRatePlans === 'string' ? JSON.parse(row.applicableRatePlans) : row.applicableRatePlans;
          }
          if (row.applicableRoomTypes) {
            applicableRoomTypes = typeof row.applicableRoomTypes === 'string' ? JSON.parse(row.applicableRoomTypes) : row.applicableRoomTypes;
            if (applicableRoomTypes && applicableRoomTypes.propertyTypes) {
              propertyTypes = applicableRoomTypes.propertyTypes;
            }
            if (applicableRoomTypes && applicableRoomTypes.selectedDays) {
              selectedDays = applicableRoomTypes.selectedDays;
            }
          }
        } catch (error) {
          // Ignore JSON parse errors
        }

        const promotionResponse: PromotionResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          name: row.name,
          description: row.description,
          type: row.type,
          discountValue: row.discountValue ? Number(row.discountValue) : null,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minValue: null,
          maxDiscount: null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          selectedDays,
          applicableRatePlans,
          applicableRoomTypes,
          bookingWindowStart: row.bookingWindowStart ? Number(row.bookingWindowStart) : null,
          bookingWindowEnd: row.bookingWindowEnd ? Number(row.bookingWindowEnd) : null,
          usageLimit: row.usageLimit ? Number(row.usageLimit) : null,
          usageCount: row.usageCount ? Number(row.usageCount) : 0,
          usesPerGuest: null,
          showOnWebsite: true,
          requireCoupon: row.requireCoupon === 1 || row.requireCoupon === true,
          promoCode: row.promoCode,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: promotionResponse,
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
      const data: CreatePromotionInput = req.body;
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
            `SELECT id FROM promotions WHERE property_id = ? AND code = ? AND deleted_at IS NULL`,
            [data.propertyId, code]
          );
          
          if (existingCode.length > 0) {
            code = `${namePrefix}${Date.now().toString().slice(-3)}`;
          }
        }

        // Mapear tipo do modal para tipo do banco
        const dbType = mapModalTypeToDbType(data.type);

        // Preparar applicable_room_types JSON com propertyTypes e selectedDays
        const applicableRoomTypes: Record<string, any> = {};
        if (data.propertyTypes && data.propertyTypes.length > 0) {
          applicableRoomTypes.propertyTypes = data.propertyTypes;
        }
        if (data.selectedDays && data.selectedDays.length > 0) {
          applicableRoomTypes.selectedDays = data.selectedDays;
        }
        const applicableRoomTypesJson = Object.keys(applicableRoomTypes).length > 0 ? JSON.stringify(applicableRoomTypes) : null;

        // Preparar applicable_rate_plans JSON
        const applicableRatePlansJson = data.applicableRatePlans && data.applicableRatePlans.length > 0 
          ? JSON.stringify(data.applicableRatePlans) 
          : null;

        // Determinar discount_value e discount_percentage baseado no tipo
        let discountValue = data.discountValue || null;
        let discountPercentage = data.discountPercentage || null;

        if (dbType === 'percentage') {
          discountPercentage = data.discountPercentage || data.discountValue || null;
        } else if (dbType === 'fixed_amount') {
          discountValue = data.discountValue || null;
        }

        const uuid = uuidv4();
        const promoCode = data.requireCoupon ? (data.code || code) : null;

        // valid_from e valid_to são NOT NULL, então precisamos de valores padrão
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        
        const validFrom = data.validFrom || today.toISOString().split('T')[0];
        const validTo = data.validTo || thirtyDaysLater.toISOString().split('T')[0];

        const insertQuery = `
          INSERT INTO promotions (
            uuid, property_id, code, name, description, type,
            discount_value, discount_percentage, min_stay, max_stay,
            valid_from, valid_to, applicable_rate_plans, applicable_room_types,
            booking_window_start, booking_window_end, usage_limit,
            requires_code, promo_code, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams: any[] = [
          uuid,
          data.propertyId,
          code,
          data.name.trim(),
          data.description?.trim() || null,
          dbType,
          discountValue,
          discountPercentage,
          data.minStay || null,
          data.maxStay || null,
          validFrom,
          validTo,
          applicableRatePlansJson,
          applicableRoomTypesJson,
          data.bookingWindowStart || null,
          data.bookingWindowEnd || null,
          data.usageLimit || null,
          data.requireCoupon || false,
          promoCode,
          data.status || 'active',
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const promotionId = result.insertId;

        await queryRunner.commitTransaction();

        // Buscar promoção criada
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, code, name, description, type,
            discount_value as discountValue, discount_percentage as discountPercentage,
            min_stay as minStay, max_stay as maxStay, valid_from as validFrom, valid_to as validTo,
            applicable_rate_plans as applicableRatePlans, applicable_room_types as applicableRoomTypes,
            booking_window_start as bookingWindowStart, booking_window_end as bookingWindowEnd,
            usage_limit as usageLimit, usage_count as usageCount,
            requires_code as requireCoupon, promo_code as promoCode, status,
            created_at as createdAt, updated_at as updatedAt
          FROM promotions
          WHERE id = ?
        `;

        const createdPromotion = await queryRunner.query(selectQuery, [promotionId]);
        await queryRunner.release();

        const row = createdPromotion[0];

        // Parse JSON fields
        let applicableRatePlansParsed = null;
        let applicableRoomTypesParsed = null;
        let propertyTypes = null;
        let selectedDays = null;

        try {
          if (row.applicableRatePlans) {
            applicableRatePlansParsed = typeof row.applicableRatePlans === 'string' ? JSON.parse(row.applicableRatePlans) : row.applicableRatePlans;
          }
          if (row.applicableRoomTypes) {
            applicableRoomTypesParsed = typeof row.applicableRoomTypes === 'string' ? JSON.parse(row.applicableRoomTypes) : row.applicableRoomTypes;
            propertyTypes = applicableRoomTypesParsed?.propertyTypes || null;
            selectedDays = applicableRoomTypesParsed?.selectedDays || null;
          }
        } catch (error) {
          // Ignore
        }

        const promotionResponse: PromotionResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          name: row.name,
          description: row.description,
          type: row.type,
          discountValue: row.discountValue ? Number(row.discountValue) : null,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minValue: null,
          maxDiscount: null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          selectedDays,
          applicableRatePlans: applicableRatePlansParsed,
          applicableRoomTypes: applicableRoomTypesParsed,
          bookingWindowStart: row.bookingWindowStart ? Number(row.bookingWindowStart) : null,
          bookingWindowEnd: row.bookingWindowEnd ? Number(row.bookingWindowEnd) : null,
          usageLimit: row.usageLimit ? Number(row.usageLimit) : null,
          usageCount: row.usageCount ? Number(row.usageCount) : 0,
          usesPerGuest: null,
          showOnWebsite: true,
          requireCoupon: row.requireCoupon === 1 || row.requireCoupon === true,
          promoCode: row.promoCode,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.status(201).json({
          success: true,
          data: promotionResponse,
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
      const data: UpdatePromotionInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se a promoção existe
        const checkQuery = `SELECT id FROM promotions WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Promoção não encontrada', 404);
        }

        // Mapear tipo se fornecido
        const dbType = data.type ? mapModalTypeToDbType(data.type) : undefined;

        // Preparar applicable_room_types JSON se necessário
        let applicableRoomTypesJson: string | null = null;
        if (data.propertyTypes !== undefined || data.selectedDays !== undefined) {
          const currentData = await queryRunner.query(
            `SELECT applicable_room_types FROM promotions WHERE id = ?`,
            [parseInt(id, 10)]
          );
          
          let currentRoomTypes: Record<string, any> = {};
          if (currentData[0]?.applicableRoomTypes) {
            try {
              currentRoomTypes = typeof currentData[0].applicableRoomTypes === 'string' 
                ? JSON.parse(currentData[0].applicableRoomTypes) 
                : currentData[0].applicableRoomTypes;
            } catch (error) {
              // Ignore
            }
          }

          if (data.propertyTypes !== undefined) {
            if (data.propertyTypes && data.propertyTypes.length > 0) {
              currentRoomTypes.propertyTypes = data.propertyTypes;
            } else {
              delete currentRoomTypes.propertyTypes;
            }
          }
          if (data.selectedDays !== undefined) {
            if (data.selectedDays && data.selectedDays.length > 0) {
              currentRoomTypes.selectedDays = data.selectedDays;
            } else {
              delete currentRoomTypes.selectedDays;
            }
          }

          applicableRoomTypesJson = Object.keys(currentRoomTypes).length > 0 ? JSON.stringify(currentRoomTypes) : null;
        }

        // Preparar applicable_rate_plans JSON se necessário
        let applicableRatePlansJson: string | null = null;
        if (data.applicableRatePlans !== undefined) {
          applicableRatePlansJson = data.applicableRatePlans && data.applicableRatePlans.length > 0 
            ? JSON.stringify(data.applicableRatePlans) 
            : null;
        }

        // Construir query de update dinamicamente
        const updateFields: string[] = [];
        const updateParams: any[] = [];

        if (data.propertyId !== undefined) { updateFields.push('property_id = ?'); updateParams.push(data.propertyId); }
        if (data.code !== undefined) { updateFields.push('code = ?'); updateParams.push(data.code); }
        if (data.name !== undefined) { updateFields.push('name = ?'); updateParams.push(data.name.trim()); }
        if (data.description !== undefined) { updateFields.push('description = ?'); updateParams.push(data.description?.trim() || null); }
        if (dbType !== undefined) { updateFields.push('type = ?'); updateParams.push(dbType); }
        if (data.discountValue !== undefined) { updateFields.push('discount_value = ?'); updateParams.push(data.discountValue); }
        if (data.discountPercentage !== undefined) { updateFields.push('discount_percentage = ?'); updateParams.push(data.discountPercentage); }
        if (data.minStay !== undefined) { updateFields.push('min_stay = ?'); updateParams.push(data.minStay); }
        if (data.maxStay !== undefined) { updateFields.push('max_stay = ?'); updateParams.push(data.maxStay); }
        if (data.validFrom !== undefined) { 
          // valid_from é NOT NULL, então usar data padrão se não fornecido
          const validFrom = data.validFrom || new Date().toISOString().split('T')[0];
          updateFields.push('valid_from = ?'); 
          updateParams.push(validFrom); 
        }
        if (data.validTo !== undefined) { 
          // valid_to é NOT NULL, então usar data padrão se não fornecido
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(new Date().getDate() + 30);
          const validTo = data.validTo || thirtyDaysLater.toISOString().split('T')[0];
          updateFields.push('valid_to = ?'); 
          updateParams.push(validTo); 
        }
        if (applicableRatePlansJson !== undefined) { updateFields.push('applicable_rate_plans = ?'); updateParams.push(applicableRatePlansJson); }
        if (applicableRoomTypesJson !== undefined) { updateFields.push('applicable_room_types = ?'); updateParams.push(applicableRoomTypesJson); }
        if (data.bookingWindowStart !== undefined) { updateFields.push('booking_window_start = ?'); updateParams.push(data.bookingWindowStart); }
        if (data.bookingWindowEnd !== undefined) { updateFields.push('booking_window_end = ?'); updateParams.push(data.bookingWindowEnd); }
        if (data.usageLimit !== undefined) { updateFields.push('usage_limit = ?'); updateParams.push(data.usageLimit); }
        if (data.requireCoupon !== undefined) { 
          updateFields.push('requires_code = ?'); 
          updateParams.push(data.requireCoupon);
          if (data.requireCoupon) {
            updateFields.push('promo_code = ?');
            updateParams.push(data.code || null);
          } else {
            updateFields.push('promo_code = ?');
            updateParams.push(null);
          }
        }
        if (data.status !== undefined) { updateFields.push('status = ?'); updateParams.push(data.status); }

        updateFields.push('updated_at = NOW()');
        updateParams.push(parseInt(id, 10));

        if (updateFields.length === 1) {
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        const updateQuery = `UPDATE promotions SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        await queryRunner.query(updateQuery, updateParams);

        await queryRunner.commitTransaction();

        // Buscar promoção atualizada
        const selectQuery = `
          SELECT 
            id, uuid, property_id as propertyId, code, name, description, type,
            discount_value as discountValue, discount_percentage as discountPercentage,
            min_stay as minStay, max_stay as maxStay, valid_from as validFrom, valid_to as validTo,
            applicable_rate_plans as applicableRatePlans, applicable_room_types as applicableRoomTypes,
            booking_window_start as bookingWindowStart, booking_window_end as bookingWindowEnd,
            usage_limit as usageLimit, usage_count as usageCount,
            requires_code as requireCoupon, promo_code as promoCode, status,
            created_at as createdAt, updated_at as updatedAt
          FROM promotions
          WHERE id = ?
        `;

        const updatedPromotion = await queryRunner.query(selectQuery, [parseInt(id, 10)]);
        await queryRunner.release();

        const row = updatedPromotion[0];

        // Parse JSON fields
        let applicableRatePlansParsed = null;
        let applicableRoomTypesParsed = null;
        let propertyTypes = null;
        let selectedDays = null;

        try {
          if (row.applicableRatePlans) {
            applicableRatePlansParsed = typeof row.applicableRatePlans === 'string' ? JSON.parse(row.applicableRatePlans) : row.applicableRatePlans;
          }
          if (row.applicableRoomTypes) {
            applicableRoomTypesParsed = typeof row.applicableRoomTypes === 'string' ? JSON.parse(row.applicableRoomTypes) : row.applicableRoomTypes;
            propertyTypes = applicableRoomTypesParsed?.propertyTypes || null;
            selectedDays = applicableRoomTypesParsed?.selectedDays || null;
          }
        } catch (error) {
          // Ignore
        }

        const promotionResponse: PromotionResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          name: row.name,
          description: row.description,
          type: row.type,
          discountValue: row.discountValue ? Number(row.discountValue) : null,
          discountPercentage: row.discountPercentage ? Number(row.discountPercentage) : null,
          minValue: null,
          maxDiscount: null,
          minStay: row.minStay ? Number(row.minStay) : null,
          maxStay: row.maxStay ? Number(row.maxStay) : null,
          validFrom: row.validFrom,
          validTo: row.validTo,
          propertyTypes,
          selectedDays,
          applicableRatePlans: applicableRatePlansParsed,
          applicableRoomTypes: applicableRoomTypesParsed,
          bookingWindowStart: row.bookingWindowStart ? Number(row.bookingWindowStart) : null,
          bookingWindowEnd: row.bookingWindowEnd ? Number(row.bookingWindowEnd) : null,
          usageLimit: row.usageLimit ? Number(row.usageLimit) : null,
          usageCount: row.usageCount ? Number(row.usageCount) : 0,
          usesPerGuest: null,
          showOnWebsite: true,
          requireCoupon: row.requireCoupon === 1 || row.requireCoupon === true,
          promoCode: row.promoCode,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: promotionResponse,
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
        // Verificar se a promoção existe
        const checkQuery = `SELECT id, name FROM promotions WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Promoção não encontrada', 404);
        }

        // Soft delete
        const deleteQuery = `UPDATE promotions SET deleted_at = NOW() WHERE id = ?`;
        await queryRunner.query(deleteQuery, [parseInt(id, 10)]);

        await queryRunner.release();

        res.json({
          success: true,
          message: 'Promoção excluída com sucesso',
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
