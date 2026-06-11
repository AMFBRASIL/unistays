import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';

/**
 * Booking Channels (Canais de Venda) - Schema 005 (booking_channels, booking_channel_available_catalog).
 * Uses raw SQL to match migration 005-booking-channel-sales.sql.
 */
export class BookingChannelController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const { propertyId, all } = req.query;
      let sql = `
        SELECT id, uuid, property_id, name, slug, logo, description, type, color, status,
               commission_type, commission_value, total_bookings, total_revenue, last_sync_at,
               sync_status, created_at
        FROM booking_channels
        WHERE deleted_at IS NULL
      `;
      const params: (string | number)[] = [];
      if (propertyId != null && propertyId !== '') {
        sql += ` AND property_id = ?`;
        params.push(Number(propertyId));
      }
      if (all !== 'true') {
        sql += ` AND status = 'active'`;
      }
      sql += ` ORDER BY sort_order ASC, name ASC`;
      const rows = await queryRunner.query(sql, params);
      await queryRunner.release();

      const channels = (rows as any[]).map((r) => ({
        id: String(r.id),
        uuid: r.uuid,
        propertyId: r.property_id,
        name: r.name,
        slug: r.slug,
        logo: r.logo ?? '',
        description: r.description ?? null,
        type: r.type ?? 'direct',
        color: r.color ?? 'bg-primary',
        status: r.status ?? 'pending',
        commissionType: r.commission_type,
        commissionValue: r.commission_value != null ? Number(r.commission_value) : 0,
        totalBookings: r.total_bookings != null ? Number(r.total_bookings) : 0,
        totalRevenue: r.total_revenue != null ? Number(r.total_revenue) : 0,
        lastSyncAt: r.last_sync_at,
        syncStatus: r.sync_status,
        createdAt: r.created_at,
      }));

      res.json({ success: true, data: { channels } });
    } catch (err) {
      await queryRunner.release().catch(() => {});
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("doesn't exist") || (err as { code?: string })?.code === 'ER_NO_SUCH_TABLE') {
        res.json({ success: true, data: { channels: [] } });
        return;
      }
      next(err);
    }
  }

  /**
   * List available channels from catalog (booking_channel_available_catalog) for "Add channel" step.
   */
  async getAvailableCatalog(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const rows = await queryRunner.query(
        `SELECT id, uuid, code, name, logo, type, description, default_commission, popularity_score, integration_type, is_featured, sort_order
         FROM booking_channel_available_catalog
         WHERE is_active = 1
         ORDER BY sort_order ASC, name ASC`
      );
      await queryRunner.release();

      const catalog = (rows as Record<string, unknown>[]).map((r) => ({
        id: r.code,
        code: r.code,
        name: r.name,
        logo: r.logo ?? '',
        type: r.type ?? 'direct',
        description: r.description ?? null,
        popularity: r.popularity_score != null ? Number(r.popularity_score) : 50,
        defaultCommission: r.default_commission != null ? Number(r.default_commission) : 0,
        integrationType: r.integration_type,
        isFeatured: Boolean(r.is_featured),
      }));

      res.json({ success: true, data: { catalog } });
    } catch (err) {
      await queryRunner.release().catch(() => {});
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("doesn't exist") || (err as { code?: string })?.code === 'ER_NO_SUCH_TABLE') {
        res.json({ success: true, data: { catalog: [] } });
        return;
      }
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const id = Number(req.params.id);
      if (!id || !Number.isInteger(id)) {
        throw new AppError('ID inválido', 400);
      }
      await queryRunner.connect();
      const [row] = await queryRunner.query(
        `SELECT id, uuid, property_id, name, slug, logo, description, type, color, status,
                commission_type, commission_value, total_bookings, total_revenue, last_sync_at,
                sync_status, api_key, hotel_id, external_property_code, auto_sync, sync_interval,
                sync_prices, sync_availability, sync_restrictions, payment_terms, apply_to_all_rates,
                created_at, updated_at
         FROM booking_channels
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );
      await queryRunner.release();
      if (!row) throw new AppError('Canal não encontrado', 404);

      const r = row as any;
      res.json({
        success: true,
        data: {
          id: String(r.id),
          uuid: r.uuid,
          propertyId: r.property_id,
          name: r.name,
          slug: r.slug,
          logo: r.logo,
          description: r.description,
          type: r.type,
          color: r.color,
          status: r.status,
          commissionType: r.commission_type,
          commissionValue: r.commission_value != null ? Number(r.commission_value) : 0,
          totalBookings: Number(r.total_bookings ?? 0),
          totalRevenue: Number(r.total_revenue ?? 0),
          lastSyncAt: r.last_sync_at,
          syncStatus: r.sync_status,
          hotelId: r.hotel_id,
          externalPropertyCode: r.external_property_code,
          autoSync: Boolean(r.auto_sync),
          syncInterval: r.sync_interval,
          syncPrices: Boolean(r.sync_prices),
          syncAvailability: Boolean(r.sync_availability),
          syncRestrictions: Boolean(r.sync_restrictions),
          paymentTerms: r.payment_terms,
          applyToAllRates: Boolean(r.apply_to_all_rates),
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        },
      });
    } catch (err) {
      await queryRunner.release().catch(() => {});
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const body = req.body as Record<string, unknown>;
      const userId = req.user?.id ?? null;
      const propertyId = body.propertyId != null ? Number(body.propertyId) : null;
      const name = body.name as string;
      const slug = body.slug as string;
      const catalogCode = body.catalogCode as string | undefined;

      if (!name || !slug) {
        throw new AppError('Nome e slug são obrigatórios', 400);
      }
      if (propertyId == null || !Number.isInteger(propertyId)) {
        throw new AppError('propertyId é obrigatório', 400);
      }

      await queryRunner.connect();

      let type = (body.type as string) ?? 'direct';
      let logo = (body.logo as string) ?? null;
      let description = (body.description as string) ?? null;
      if (catalogCode) {
        const [cat] = await queryRunner.query(
          'SELECT type, logo, description, default_commission FROM booking_channel_available_catalog WHERE code = ? AND is_active = 1',
          [catalogCode]
        );
        if (cat) {
          type = (cat as any).type ?? type;
          logo = (cat as any).logo ?? logo;
          description = (cat as any).description ?? description;
        }
      }

      const normalizedSlug = String(slug).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
      const [existing] = await queryRunner.query(
        'SELECT id FROM booking_channels WHERE property_id = ? AND slug = ? AND deleted_at IS NULL',
        [propertyId, normalizedSlug]
      );
      if (existing) throw new AppError('Já existe um canal com este slug nesta propriedade', 409);

      const status = (body.status as string) ?? 'pending';
      const commissionType = (body.commissionType as string) ?? 'percentage';
      const commissionValue = body.commissionValue != null ? Number(body.commissionValue) : 0;
      const apiKey = (body.apiKey as string) ?? null;
      const hotelId = (body.hotelId as string) ?? null;
      const autoSync = body.autoSync !== false ? 1 : 0;
      const syncInterval = body.syncInterval != null ? Math.min(60, Math.max(5, Number(body.syncInterval))) : 15;
      const syncPrices = body.syncPrices !== false ? 1 : 0;
      const syncAvailability = body.syncAvailability !== false ? 1 : 0;
      const syncRestrictions = body.syncRestrictions !== false ? 1 : 0;
      const rawPaymentTerms = (body.paymentTerms as string) ?? 'monthly';
      const allowedPaymentTerms = ['immediate', 'weekly', 'biweekly', 'monthly', 'custom'] as const;
      const paymentTerms = rawPaymentTerms === 'checkout' ? 'immediate' : (allowedPaymentTerms.includes(rawPaymentTerms as typeof allowedPaymentTerms[number]) ? rawPaymentTerms : 'monthly');
      const applyToAllRates = body.applyToAllRates !== false ? 1 : 0;
      const notifyTeamOnBooking = body.notifyTeamOnBooking !== false ? 1 : 0;
      const activatedNow = body.activateNow === true;
      const isTestMode = body.testMode === true ? 1 : 0;

      await queryRunner.query(
        `INSERT INTO booking_channels (
          property_id, name, slug, logo, description, type, color, status,
          commission_type, commission_value, api_key, hotel_id,
          auto_sync, sync_interval, sync_prices, sync_availability, sync_restrictions,
          payment_terms, apply_to_all_rates, notify_team_on_booking,
          is_test_mode, activated_at, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          propertyId,
          name,
          normalizedSlug,
          logo,
          description,
          type,
          (body.color as string) ?? 'bg-primary',
          status,
          commissionType,
          commissionValue,
          apiKey,
          hotelId,
          autoSync,
          syncInterval,
          syncPrices,
          syncAvailability,
          syncRestrictions,
          paymentTerms,
          applyToAllRates,
          notifyTeamOnBooking,
          isTestMode,
          activatedNow ? new Date() : null,
          userId,
          userId,
        ]
      );

      const [inserted] = await queryRunner.query(
        'SELECT id, uuid, property_id, name, slug, logo, type, status, created_at FROM booking_channels WHERE id = LAST_INSERT_ID()'
      );
      await queryRunner.release();

      const r = inserted as any;
      res.status(201).json({
        success: true,
        data: {
          id: String(r.id),
          uuid: r.uuid,
          propertyId: r.property_id,
          name: r.name,
          slug: r.slug,
          logo: r.logo,
          type: r.type,
          status: r.status,
          createdAt: r.created_at,
        },
      });
    } catch (err) {
      await queryRunner.release().catch(() => {});
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const id = Number(req.params.id);
      if (!id || !Number.isInteger(id)) throw new AppError('ID inválido', 400);

      const body = req.body as Record<string, unknown>;
      await queryRunner.connect();

      const [existing] = await queryRunner.query(
        'SELECT id FROM booking_channels WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      if (!existing) {
        await queryRunner.release();
        throw new AppError('Canal não encontrado', 404);
      }

      const updates: string[] = [];
      const params: (string | number | null)[] = [];

      if (body.name != null) { updates.push('name = ?'); params.push(body.name as string); }
      if (body.slug != null) { updates.push('slug = ?'); params.push(String(body.slug).toLowerCase().replace(/\s+/g, '-')); }
      if (body.logo !== undefined) { updates.push('logo = ?'); params.push(body.logo as string | null); }
      if (body.description !== undefined) { updates.push('description = ?'); params.push(body.description as string | null); }
      if (body.type != null) { updates.push('type = ?'); params.push(body.type as string); }
      if (body.color != null) { updates.push('color = ?'); params.push(body.color as string); }
      if (body.status != null) { updates.push('status = ?'); params.push(body.status as string); }
      if (body.commissionType != null) { updates.push('commission_type = ?'); params.push(body.commissionType as string); }
      if (body.commissionValue != null) { updates.push('commission_value = ?'); params.push(Number(body.commissionValue)); }
      if (body.apiKey !== undefined) { updates.push('api_key = ?'); params.push(body.apiKey as string | null); }
      if (body.hotelId !== undefined) { updates.push('hotel_id = ?'); params.push(body.hotelId as string | null); }
      if (body.autoSync !== undefined) { updates.push('auto_sync = ?'); params.push(body.autoSync ? 1 : 0); }
      if (body.syncInterval != null) { updates.push('sync_interval = ?'); params.push(Number(body.syncInterval)); }
      if (body.syncPrices !== undefined) { updates.push('sync_prices = ?'); params.push(body.syncPrices ? 1 : 0); }
      if (body.syncAvailability !== undefined) { updates.push('sync_availability = ?'); params.push(body.syncAvailability ? 1 : 0); }
      if (body.syncRestrictions !== undefined) { updates.push('sync_restrictions = ?'); params.push(body.syncRestrictions ? 1 : 0); }
      if (body.paymentTerms != null) {
        const raw = body.paymentTerms as string;
        const allowed = ['immediate', 'weekly', 'biweekly', 'monthly', 'custom'] as const;
        const normalized = raw === 'checkout' ? 'immediate' : (allowed.includes(raw as typeof allowed[number]) ? raw : 'monthly');
        updates.push('payment_terms = ?');
        params.push(normalized);
      }
      if (body.updated_by !== undefined) { updates.push('updated_by = ?'); params.push(req.user?.id ?? null); }

      if (updates.length > 0) {
        params.push(id);
        await queryRunner.query(
          `UPDATE booking_channels SET ${updates.join(', ')}, updated_at = NOW(6) WHERE id = ?`,
          params
        );
      }

      const [row] = await queryRunner.query(
        'SELECT id, uuid, name, slug, logo, type, status, updated_at FROM booking_channels WHERE id = ?',
        [id]
      );
      await queryRunner.release();

      const r = row as any;
      res.json({
        success: true,
        data: {
          id: String(r.id),
          uuid: r.uuid,
          name: r.name,
          slug: r.slug,
          logo: r.logo,
          type: r.type,
          status: r.status,
          updatedAt: r.updated_at,
        },
      });
    } catch (err) {
      await queryRunner.release().catch(() => {});
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const id = Number(req.params.id);
      if (!id || !Number.isInteger(id)) throw new AppError('ID inválido', 400);

      await queryRunner.connect();
      const [row] = await queryRunner.query(
        'SELECT id FROM booking_channels WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      if (!row) {
        await queryRunner.release();
        throw new AppError('Canal não encontrado', 404);
      }
      await queryRunner.query('UPDATE booking_channels SET deleted_at = NOW(6) WHERE id = ?', [id]);
      await queryRunner.release();

      res.json({ success: true, message: 'Canal removido' });
    } catch (err) {
      await queryRunner.release().catch(() => {});
      next(err);
    }
  }
}
