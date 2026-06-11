import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateGeneralSettingsInput, UpdateGeneralSettingsInput } from '@/validators/generalSettings.validator';
import { v4 as uuidv4 } from 'uuid';

interface GeneralSettingsResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  
  // Informações Básicas
  hotelName: string | null;
  legalName: string | null;
  cnpj: string | null;
  address: string | null;
  
  // Localização e Formatação
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  fiscalYearStart: string;
  fiscalYearEnd: string;
  
  // Informações de Contato
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  instagram?: string | null;
  logoUrl?: string | null;
  businessHoursStart: string | null;
  businessHoursEnd: string | null;
  currencySymbol?: string | null;
  currencyDecimalPlaces?: number | null;
  currencyThousandsSeparator?: string | null;
  currencyDecimalSeparator?: string | null;
  currencySymbolPosition?: 'before' | 'after' | null;
  
  // Notificações
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  
  // Backup
  autoBackup: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  
  createdAt: Date;
  updatedAt: Date;
}

export class GeneralSettingsController {
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId: propertyIdParam } = req.query;
      const propertyId = propertyIdParam ? parseInt(propertyIdParam as string, 10) : null;
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      const params: any[] = [];
      const query = `
        SELECT 
          gs.id,
          gs.uuid,
          gs.property_id as propertyId,
          gs.hotel_name as hotelName,
          gs.legal_name as legalName,
          gs.cnpj,
          gs.address,
          gs.timezone,
          gs.currency,
          gs.language,
          gs.date_format as dateFormat,
          gs.time_format as timeFormat,
          gs.fiscal_year_start as fiscalYearStart,
          gs.fiscal_year_end as fiscalYearEnd,
          gs.contact_email as contactEmail,
          gs.contact_phone as contactPhone,
          gs.website,
          gs.instagram,
          gs.logo_url as logoUrl,
          gs.business_hours_start as businessHoursStart,
          gs.business_hours_end as businessHoursEnd,
          gs.currency_symbol as currencySymbol,
          gs.currency_decimal_places as currencyDecimalPlaces,
          gs.currency_thousands_separator as currencyThousandsSeparator,
          gs.currency_decimal_separator as currencyDecimalSeparator,
          gs.currency_symbol_position as currencySymbolPosition,
          gs.enable_notifications as enableNotifications,
          gs.enable_email_notifications as enableEmailNotifications,
          gs.enable_sms_notifications as enableSmsNotifications,
          gs.auto_backup as autoBackup,
          gs.backup_frequency as backupFrequency,
          gs.created_at as createdAt,
          gs.updated_at as updatedAt
        FROM general_settings gs
        WHERE gs.property_id ${propertyId ? '= ?' : 'IS NULL'}
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
      
      const response: GeneralSettingsResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        hotelName: row.hotelName,
        legalName: row.legalName,
        cnpj: row.cnpj,
        address: row.address,
        timezone: row.timezone || 'America/Sao_Paulo',
        currency: row.currency || 'BRL',
        language: row.language || 'pt-BR',
        dateFormat: row.dateFormat || 'DD/MM/YYYY',
        timeFormat: row.timeFormat || '24h',
        fiscalYearStart: row.fiscalYearStart || '01',
        fiscalYearEnd: row.fiscalYearEnd || '12',
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        website: row.website,
        instagram: row.instagram,
        logoUrl: row.logoUrl,
        businessHoursStart: row.businessHoursStart,
        businessHoursEnd: row.businessHoursEnd,
        currencySymbol: row.currencySymbol,
        currencyDecimalPlaces: row.currencyDecimalPlaces,
        currencyThousandsSeparator: row.currencyThousandsSeparator,
        currencyDecimalSeparator: row.currencyDecimalSeparator,
        currencySymbolPosition: row.currencySymbolPosition,
        enableNotifications: row.enableNotifications === 1 || row.enableNotifications === true,
        enableEmailNotifications: row.enableEmailNotifications === 1 || row.enableEmailNotifications === true,
        enableSmsNotifications: row.enableSmsNotifications === 1 || row.enableSmsNotifications === true,
        autoBackup: row.autoBackup === 1 || row.autoBackup === true,
        backupFrequency: row.backupFrequency || 'daily',
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
      const data: CreateGeneralSettingsInput | UpdateGeneralSettingsInput = req.body;
      const propertyId = data.propertyId !== undefined ? data.propertyId : null;

      // Verificar se já existe configuração para esta propriedade (ou global)
      const existing = await queryRunner.query(
        `SELECT id FROM general_settings WHERE property_id ${propertyId ? '= ?' : 'IS NULL'}`,
        propertyId ? [propertyId] : []
      );

      if (existing.length > 0) {
        // UPDATE
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (data.hotelName !== undefined) {
          updateFields.push('hotel_name = ?');
          updateValues.push(data.hotelName);
        }
        if (data.legalName !== undefined) {
          updateFields.push('legal_name = ?');
          updateValues.push(data.legalName);
        }
        if (data.cnpj !== undefined) {
          updateFields.push('cnpj = ?');
          updateValues.push(data.cnpj);
        }
        if (data.address !== undefined) {
          updateFields.push('address = ?');
          updateValues.push(data.address);
        }
        if (data.timezone !== undefined) {
          updateFields.push('timezone = ?');
          updateValues.push(data.timezone);
        }
        if (data.currency !== undefined) {
          updateFields.push('currency = ?');
          updateValues.push(data.currency);
        }
        if (data.language !== undefined) {
          updateFields.push('language = ?');
          updateValues.push(data.language);
        }
        if (data.dateFormat !== undefined) {
          updateFields.push('date_format = ?');
          updateValues.push(data.dateFormat);
        }
        if (data.timeFormat !== undefined) {
          updateFields.push('time_format = ?');
          updateValues.push(data.timeFormat);
        }
        if (data.fiscalYearStart !== undefined) {
          updateFields.push('fiscal_year_start = ?');
          updateValues.push(data.fiscalYearStart);
        }
        if (data.fiscalYearEnd !== undefined) {
          updateFields.push('fiscal_year_end = ?');
          updateValues.push(data.fiscalYearEnd);
        }
        if (data.contactEmail !== undefined) {
          updateFields.push('contact_email = ?');
          updateValues.push(data.contactEmail);
        }
        if (data.contactPhone !== undefined) {
          updateFields.push('contact_phone = ?');
          updateValues.push(data.contactPhone);
        }
        if (data.website !== undefined) {
          updateFields.push('website = ?');
          updateValues.push(data.website);
        }
        if (data.instagram !== undefined) {
          updateFields.push('instagram = ?');
          updateValues.push(data.instagram);
        }
        if (data.logoUrl !== undefined) {
          updateFields.push('logo_url = ?');
          updateValues.push(data.logoUrl);
        }
        if (data.currencySymbol !== undefined) {
          updateFields.push('currency_symbol = ?');
          updateValues.push(data.currencySymbol);
        }
        if (data.currencyDecimalPlaces !== undefined) {
          updateFields.push('currency_decimal_places = ?');
          updateValues.push(data.currencyDecimalPlaces);
        }
        if (data.currencyThousandsSeparator !== undefined) {
          updateFields.push('currency_thousands_separator = ?');
          updateValues.push(data.currencyThousandsSeparator);
        }
        if (data.currencyDecimalSeparator !== undefined) {
          updateFields.push('currency_decimal_separator = ?');
          updateValues.push(data.currencyDecimalSeparator);
        }
        if (data.currencySymbolPosition !== undefined) {
          updateFields.push('currency_symbol_position = ?');
          updateValues.push(data.currencySymbolPosition);
        }
        if (data.businessHoursStart !== undefined) {
          updateFields.push('business_hours_start = ?');
          updateValues.push(data.businessHoursStart || null);
        }
        if (data.businessHoursEnd !== undefined) {
          updateFields.push('business_hours_end = ?');
          updateValues.push(data.businessHoursEnd || null);
        }
        if (data.enableNotifications !== undefined) {
          updateFields.push('enable_notifications = ?');
          updateValues.push(data.enableNotifications ? 1 : 0);
        }
        if (data.enableEmailNotifications !== undefined) {
          updateFields.push('enable_email_notifications = ?');
          updateValues.push(data.enableEmailNotifications ? 1 : 0);
        }
        if (data.enableSmsNotifications !== undefined) {
          updateFields.push('enable_sms_notifications = ?');
          updateValues.push(data.enableSmsNotifications ? 1 : 0);
        }
        if (data.autoBackup !== undefined) {
          updateFields.push('auto_backup = ?');
          updateValues.push(data.autoBackup ? 1 : 0);
        }
        if (data.backupFrequency !== undefined) {
          updateFields.push('backup_frequency = ?');
          updateValues.push(data.backupFrequency);
        }

        if (updateFields.length === 0) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        updateValues.push(existing[0].id);

        const updateQuery = `
          UPDATE general_settings
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = ?
        `;

        await queryRunner.query(updateQuery, updateValues);
        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.json({
          success: true,
          message: 'Configurações gerais atualizadas com sucesso',
        });
      } else {
        // INSERT
        const uuid = uuidv4();
        const insertQuery = `
          INSERT INTO general_settings (
            uuid, property_id,
            hotel_name, legal_name, cnpj, address,
            timezone, currency, currency_symbol, currency_decimal_places, currency_thousands_separator, currency_decimal_separator, currency_symbol_position,
            language, date_format, time_format,
            fiscal_year_start, fiscal_year_end,
            contact_email, contact_phone, website, instagram, logo_url,
            business_hours_start, business_hours_end,
            enable_notifications, enable_email_notifications, enable_sms_notifications,
            auto_backup, backup_frequency
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertValues = [
          uuid,
          propertyId,
          data.hotelName || null,
          data.legalName || null,
          data.cnpj || null,
          data.address || null,
          data.timezone || 'America/Sao_Paulo',
          data.currency || 'BRL',
          data.currencySymbol || 'R$',
          data.currencyDecimalPlaces !== undefined ? data.currencyDecimalPlaces : 2,
          data.currencyThousandsSeparator || '.',
          data.currencyDecimalSeparator || ',',
          data.currencySymbolPosition || 'before',
          data.language || 'pt-BR',
          data.dateFormat || 'DD/MM/YYYY',
          data.timeFormat || '24h',
          data.fiscalYearStart || '01',
          data.fiscalYearEnd || '12',
          data.contactEmail || null,
          data.contactPhone || null,
          data.website || null,
          data.instagram || null,
          data.logoUrl || null,
          data.businessHoursStart || null,
          data.businessHoursEnd || null,
          data.enableNotifications !== undefined ? (data.enableNotifications ? 1 : 0) : 1,
          data.enableEmailNotifications !== undefined ? (data.enableEmailNotifications ? 1 : 0) : 1,
          data.enableSmsNotifications !== undefined ? (data.enableSmsNotifications ? 1 : 0) : 0,
          data.autoBackup !== undefined ? (data.autoBackup ? 1 : 0) : 1,
          data.backupFrequency || 'daily',
        ];

        await queryRunner.query(insertQuery, insertValues);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.json({
          success: true,
          message: 'Configurações gerais criadas com sucesso',
        });
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      
      if (error instanceof AppError) {
        next(error);
      } else {
        console.error('Erro ao salvar configurações gerais:', error);
        next(new AppError('Erro ao salvar configurações gerais', 500));
      }
    }
  }
}
