import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateBookingEngineConfigInput, UpdateBookingEngineConfigInput } from '@/validators/bookingEngineConfig.validator';
import { v4 as uuidv4 } from 'uuid';

interface BookingEngineConfigResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  
  // Configurações Gerais
  enabled: boolean;
  websiteUrl: string | null;
  bookingUrl: string | null;
  defaultCurrency: string;
  availableLanguages: string[] | null;
  
  // Configurações de Reserva
  enableInstantBooking: boolean;
  minAdvanceBooking: number;
  maxAdvanceBooking: number;
  
  // Configurações de Pagamento
  requirePayment: boolean;
  requireDeposit: boolean;
  depositPercentage: number | null;
  
  // Configurações de Exibição
  enableSearchFilters: boolean;
  showPriceInclusive: boolean;
  enableGuestReviews: boolean;
  enableRecommendations: boolean;
  mobileOptimized: boolean;
  
  // Integrações
  enableGoogleAnalytics: boolean;
  googleAnalyticsId: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export class BookingEngineConfigController {
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId: propertyIdParam } = req.query;
      const propertyId = propertyIdParam ? parseInt(propertyIdParam as string, 10) : null;
      const queryRunner = AppDataSource.createQueryRunner();

      const params: any[] = [];
      const query = `
        SELECT 
          bec.id,
          bec.uuid,
          bec.property_id as propertyId,
          bec.enabled,
          bec.website_url as websiteUrl,
          bec.booking_url as bookingUrl,
          bec.default_currency as defaultCurrency,
          bec.available_languages as availableLanguages,
          bec.enable_instant_booking as enableInstantBooking,
          bec.min_advance_booking as minAdvanceBooking,
          bec.max_advance_booking as maxAdvanceBooking,
          bec.require_payment as requirePayment,
          bec.require_deposit as requireDeposit,
          bec.deposit_percentage as depositPercentage,
          bec.enable_search_filters as enableSearchFilters,
          bec.show_price_inclusive as showPriceInclusive,
          bec.enable_guest_reviews as enableGuestReviews,
          bec.enable_recommendations as enableRecommendations,
          bec.mobile_optimized as mobileOptimized,
          bec.enable_google_analytics as enableGoogleAnalytics,
          bec.google_analytics_id as googleAnalyticsId,
          bec.created_at as createdAt,
          bec.updated_at as updatedAt
        FROM booking_engine_config bec
        WHERE bec.property_id ${propertyId ? '= ?' : 'IS NULL'}
        LIMIT 1
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
        });
        return;
      }

      const row = results[0];
      
      // Parse available_languages JSON
      let availableLanguages: string[] | null = null;
      if (row.availableLanguages) {
        try {
          availableLanguages = typeof row.availableLanguages === 'string'
            ? JSON.parse(row.availableLanguages)
            : row.availableLanguages;
        } catch {
          availableLanguages = [row.availableLanguages];
        }
      }
      
      const response: BookingEngineConfigResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        enabled: row.enabled === 1 || row.enabled === true,
        websiteUrl: row.websiteUrl,
        bookingUrl: row.bookingUrl,
        defaultCurrency: row.defaultCurrency || 'BRL',
        availableLanguages,
        enableInstantBooking: row.enableInstantBooking === 1 || row.enableInstantBooking === true,
        minAdvanceBooking: row.minAdvanceBooking || 0,
        maxAdvanceBooking: row.maxAdvanceBooking || 365,
        requirePayment: row.requirePayment === 1 || row.requirePayment === true,
        requireDeposit: row.requireDeposit === 1 || row.requireDeposit === true,
        depositPercentage: row.depositPercentage,
        enableSearchFilters: row.enableSearchFilters === 1 || row.enableSearchFilters === true,
        showPriceInclusive: row.showPriceInclusive === 1 || row.showPriceInclusive === true,
        enableGuestReviews: row.enableGuestReviews === 1 || row.enableGuestReviews === true,
        enableRecommendations: row.enableRecommendations === 1 || row.enableRecommendations === true,
        mobileOptimized: row.mobileOptimized === 1 || row.mobileOptimized === true,
        enableGoogleAnalytics: row.enableGoogleAnalytics === 1 || row.enableGoogleAnalytics === true,
        googleAnalyticsId: row.googleAnalyticsId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: response,
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
      const data: CreateBookingEngineConfigInput | UpdateBookingEngineConfigInput = req.body;
      const propertyId = data.propertyId || null;

      // Verificar se já existe configuração para esta propriedade (ou global)
      const existing = await queryRunner.query(
        `SELECT id FROM booking_engine_config WHERE property_id ${propertyId ? '= ?' : 'IS NULL'}`,
        propertyId ? [propertyId] : []
      );

      // Processar available_languages (converter array para JSON string)
      let availableLanguagesJson: string | null = null;
      if (data.availableLanguages) {
        if (Array.isArray(data.availableLanguages)) {
          availableLanguagesJson = JSON.stringify(data.availableLanguages);
        } else if (typeof data.availableLanguages === 'string') {
          availableLanguagesJson = data.availableLanguages;
        }
      }

      if (existing.length > 0) {
        // UPDATE
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (data.enabled !== undefined) {
          updateFields.push('enabled = ?');
          updateValues.push(data.enabled ? 1 : 0);
        }
        if (data.websiteUrl !== undefined) {
          updateFields.push('website_url = ?');
          updateValues.push(data.websiteUrl);
        }
        if (data.bookingUrl !== undefined) {
          updateFields.push('booking_url = ?');
          updateValues.push(data.bookingUrl);
        }
        if (data.defaultCurrency !== undefined) {
          updateFields.push('default_currency = ?');
          updateValues.push(data.defaultCurrency);
        }
        if (data.availableLanguages !== undefined) {
          updateFields.push('available_languages = ?');
          updateValues.push(availableLanguagesJson);
        }
        if (data.enableInstantBooking !== undefined) {
          updateFields.push('enable_instant_booking = ?');
          updateValues.push(data.enableInstantBooking ? 1 : 0);
        }
        if (data.minAdvanceBooking !== undefined) {
          updateFields.push('min_advance_booking = ?');
          updateValues.push(data.minAdvanceBooking);
        }
        if (data.maxAdvanceBooking !== undefined) {
          updateFields.push('max_advance_booking = ?');
          updateValues.push(data.maxAdvanceBooking);
        }
        if (data.requirePayment !== undefined) {
          updateFields.push('require_payment = ?');
          updateValues.push(data.requirePayment ? 1 : 0);
        }
        if (data.requireDeposit !== undefined) {
          updateFields.push('require_deposit = ?');
          updateValues.push(data.requireDeposit ? 1 : 0);
        }
        if (data.depositPercentage !== undefined) {
          updateFields.push('deposit_percentage = ?');
          updateValues.push(data.depositPercentage);
        }
        if (data.enableSearchFilters !== undefined) {
          updateFields.push('enable_search_filters = ?');
          updateValues.push(data.enableSearchFilters ? 1 : 0);
        }
        if (data.showPriceInclusive !== undefined) {
          updateFields.push('show_price_inclusive = ?');
          updateValues.push(data.showPriceInclusive ? 1 : 0);
        }
        if (data.enableGuestReviews !== undefined) {
          updateFields.push('enable_guest_reviews = ?');
          updateValues.push(data.enableGuestReviews ? 1 : 0);
        }
        if (data.enableRecommendations !== undefined) {
          updateFields.push('enable_recommendations = ?');
          updateValues.push(data.enableRecommendations ? 1 : 0);
        }
        if (data.mobileOptimized !== undefined) {
          updateFields.push('mobile_optimized = ?');
          updateValues.push(data.mobileOptimized ? 1 : 0);
        }
        if (data.enableGoogleAnalytics !== undefined) {
          updateFields.push('enable_google_analytics = ?');
          updateValues.push(data.enableGoogleAnalytics ? 1 : 0);
        }
        if (data.googleAnalyticsId !== undefined) {
          updateFields.push('google_analytics_id = ?');
          updateValues.push(data.googleAnalyticsId);
        }

        if (updateFields.length === 0) {
          throw new AppError('Nenhum campo fornecido para atualização', 400);
        }

        updateValues.push(existing[0].id);

        const updateQuery = `
          UPDATE booking_engine_config
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = ?
        `;

        await queryRunner.query(updateQuery, updateValues);
        await queryRunner.commitTransaction();

        // Retornar dados atualizados
        const updated = await queryRunner.query(
          `SELECT 
            id, uuid, property_id as propertyId,
            enabled, website_url as websiteUrl, booking_url as bookingUrl,
            default_currency as defaultCurrency, available_languages as availableLanguages,
            enable_instant_booking as enableInstantBooking,
            min_advance_booking as minAdvanceBooking,
            max_advance_booking as maxAdvanceBooking,
            require_payment as requirePayment, require_deposit as requireDeposit,
            deposit_percentage as depositPercentage,
            enable_search_filters as enableSearchFilters,
            show_price_inclusive as showPriceInclusive,
            enable_guest_reviews as enableGuestReviews,
            enable_recommendations as enableRecommendations,
            mobile_optimized as mobileOptimized,
            enable_google_analytics as enableGoogleAnalytics,
            google_analytics_id as googleAnalyticsId,
            created_at as createdAt, updated_at as updatedAt
          FROM booking_engine_config WHERE id = ?`,
          [existing[0].id]
        );

        const row = updated[0];
        let availableLanguages: string[] | null = null;
        if (row.availableLanguages) {
          try {
            availableLanguages = typeof row.availableLanguages === 'string'
              ? JSON.parse(row.availableLanguages)
              : row.availableLanguages;
          } catch {
            availableLanguages = [row.availableLanguages];
          }
        }

        const response: BookingEngineConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          enabled: row.enabled === 1 || row.enabled === true,
          websiteUrl: row.websiteUrl,
          bookingUrl: row.bookingUrl,
          defaultCurrency: row.defaultCurrency || 'BRL',
          availableLanguages,
          enableInstantBooking: row.enableInstantBooking === 1 || row.enableInstantBooking === true,
          minAdvanceBooking: row.minAdvanceBooking || 0,
          maxAdvanceBooking: row.maxAdvanceBooking || 365,
          requirePayment: row.requirePayment === 1 || row.requirePayment === true,
          requireDeposit: row.requireDeposit === 1 || row.requireDeposit === true,
          depositPercentage: row.depositPercentage,
          enableSearchFilters: row.enableSearchFilters === 1 || row.enableSearchFilters === true,
          showPriceInclusive: row.showPriceInclusive === 1 || row.showPriceInclusive === true,
          enableGuestReviews: row.enableGuestReviews === 1 || row.enableGuestReviews === true,
          enableRecommendations: row.enableRecommendations === 1 || row.enableRecommendations === true,
          mobileOptimized: row.mobileOptimized === 1 || row.mobileOptimized === true,
          enableGoogleAnalytics: row.enableGoogleAnalytics === 1 || row.enableGoogleAnalytics === true,
          googleAnalyticsId: row.googleAnalyticsId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: response,
          message: 'Configurações do motor de reserva atualizadas com sucesso',
        });
      } else {
        // INSERT
        const uuid = uuidv4();
        
        const insertQuery = `
          INSERT INTO booking_engine_config (
            uuid, property_id,
            enabled, website_url, booking_url, default_currency, available_languages,
            enable_instant_booking, min_advance_booking, max_advance_booking,
            require_payment, require_deposit, deposit_percentage,
            enable_search_filters, show_price_inclusive,
            enable_guest_reviews, enable_recommendations, mobile_optimized,
            enable_google_analytics, google_analytics_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertValues = [
          uuid,
          propertyId,
          data.enabled !== undefined ? (data.enabled ? 1 : 0) : 0,
          data.websiteUrl || null,
          data.bookingUrl || null,
          data.defaultCurrency || 'BRL',
          availableLanguagesJson,
          data.enableInstantBooking !== undefined ? (data.enableInstantBooking ? 1 : 0) : 1,
          data.minAdvanceBooking !== undefined ? data.minAdvanceBooking : 0,
          data.maxAdvanceBooking !== undefined ? data.maxAdvanceBooking : 365,
          data.requirePayment !== undefined ? (data.requirePayment ? 1 : 0) : 1,
          data.requireDeposit !== undefined ? (data.requireDeposit ? 1 : 0) : 0,
          data.depositPercentage || null,
          data.enableSearchFilters !== undefined ? (data.enableSearchFilters ? 1 : 0) : 1,
          data.showPriceInclusive !== undefined ? (data.showPriceInclusive ? 1 : 0) : 0,
          data.enableGuestReviews !== undefined ? (data.enableGuestReviews ? 1 : 0) : 1,
          data.enableRecommendations !== undefined ? (data.enableRecommendations ? 1 : 0) : 1,
          data.mobileOptimized !== undefined ? (data.mobileOptimized ? 1 : 0) : 1,
          data.enableGoogleAnalytics !== undefined ? (data.enableGoogleAnalytics ? 1 : 0) : 0,
          data.googleAnalyticsId || null,
        ];

        await queryRunner.query(insertQuery, insertValues);
        await queryRunner.commitTransaction();

        // Retornar dados inseridos
        const inserted = await queryRunner.query(
          `SELECT 
            id, uuid, property_id as propertyId,
            enabled, website_url as websiteUrl, booking_url as bookingUrl,
            default_currency as defaultCurrency, available_languages as availableLanguages,
            enable_instant_booking as enableInstantBooking,
            min_advance_booking as minAdvanceBooking,
            max_advance_booking as maxAdvanceBooking,
            require_payment as requirePayment, require_deposit as requireDeposit,
            deposit_percentage as depositPercentage,
            enable_search_filters as enableSearchFilters,
            show_price_inclusive as showPriceInclusive,
            enable_guest_reviews as enableGuestReviews,
            enable_recommendations as enableRecommendations,
            mobile_optimized as mobileOptimized,
            enable_google_analytics as enableGoogleAnalytics,
            google_analytics_id as googleAnalyticsId,
            created_at as createdAt, updated_at as updatedAt
          FROM booking_engine_config WHERE uuid = ?`,
          [uuid]
        );

        const row = inserted[0];
        let availableLanguages: string[] | null = null;
        if (row.availableLanguages) {
          try {
            availableLanguages = typeof row.availableLanguages === 'string'
              ? JSON.parse(row.availableLanguages)
              : row.availableLanguages;
          } catch {
            availableLanguages = [row.availableLanguages];
          }
        }

        const response: BookingEngineConfigResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          enabled: row.enabled === 1 || row.enabled === true,
          websiteUrl: row.websiteUrl,
          bookingUrl: row.bookingUrl,
          defaultCurrency: row.defaultCurrency || 'BRL',
          availableLanguages,
          enableInstantBooking: row.enableInstantBooking === 1 || row.enableInstantBooking === true,
          minAdvanceBooking: row.minAdvanceBooking || 0,
          maxAdvanceBooking: row.maxAdvanceBooking || 365,
          requirePayment: row.requirePayment === 1 || row.requirePayment === true,
          requireDeposit: row.requireDeposit === 1 || row.requireDeposit === true,
          depositPercentage: row.depositPercentage,
          enableSearchFilters: row.enableSearchFilters === 1 || row.enableSearchFilters === true,
          showPriceInclusive: row.showPriceInclusive === 1 || row.showPriceInclusive === true,
          enableGuestReviews: row.enableGuestReviews === 1 || row.enableGuestReviews === true,
          enableRecommendations: row.enableRecommendations === 1 || row.enableRecommendations === true,
          mobileOptimized: row.mobileOptimized === 1 || row.mobileOptimized === true,
          enableGoogleAnalytics: row.enableGoogleAnalytics === 1 || row.enableGoogleAnalytics === true,
          googleAnalyticsId: row.googleAnalyticsId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: response,
          message: 'Configurações do motor de reserva criadas com sucesso',
        });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao salvar configurações do motor de reserva:', error);
      next(error);
    } finally {
      await queryRunner.release();
    }
  }
}
