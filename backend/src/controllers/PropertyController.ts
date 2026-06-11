import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Property } from '@/entities/Property.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';

export class PropertyController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const queryRunner = AppDataSource.createQueryRunner();

      // Usar query SQL direta para garantir que os nomes de colunas estão corretos
      const properties = await queryRunner.query(`
        SELECT 
          p.id,
          p.uuid,
          p.name,
          p.type,
          p.status,
          p.address,
          p.address_number as address_number,
          p.neighborhood,
          p.city,
          p.state,
          p.zip_code as zip_code,
          p.country,
          p.phone,
          p.email,
          p.website,
          p.logo,
          p.images,
          p.settings,
          p.commission_rate as commission_rate,
          p.cleaning_schedule as cleaning_schedule,
          p.services,
          p.wifi_network as wifi_network,
          p.wifi_password as wifi_password,
          p.created_at as created_at,
          p.updated_at as updated_at,
          u.id as owner_id,
          u.name as owner_name,
          u.email as owner_email,
          u.phone as owner_phone,
          COUNT(DISTINCT units.id) as units_count
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN units units ON units.property_id = p.id AND units.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
        GROUP BY p.id, u.id
        ORDER BY p.created_at DESC
      `);

      // Mapear resultados
      const propertiesResponse = properties.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        name: row.name,
        type: row.type,
        status: row.status,
        address: row.address,
        addressNumber: row.address_number,
        neighborhood: row.neighborhood,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        country: row.country,
        phone: row.phone,
        email: row.email,
        website: row.website,
        logo: row.logo,
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : null,
        settings: row.settings ? (typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings) : null,
        commissionRate: row.commission_rate ? Number(row.commission_rate) : null,
        cleaningSchedule: row.cleaning_schedule,
        services: row.services ? (typeof row.services === 'string' ? JSON.parse(row.services) : row.services) : null,
        wifiNetwork: row.wifi_network || null,
        wifiPassword: row.wifi_password || null,
        unitsCount: parseInt(row.units_count || '0'),
        owner: row.owner_id ? {
          id: row.owner_id,
          name: row.owner_name,
          email: row.owner_email,
          phone: row.owner_phone,
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      await queryRunner.release();

      res.json({
        success: true,
        data: { properties: propertiesResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const results = await queryRunner.query(`
        SELECT 
          p.*,
          u.id as owner_id,
          u.name as owner_name,
          u.email as owner_email,
          u.phone as owner_phone
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.id = ? AND p.deleted_at IS NULL
      `, [id]);

      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Propriedade não encontrada', 404);
      }

      const row = results[0];
      const property = {
        id: row.id,
        uuid: row.uuid,
        name: row.name,
        type: row.type,
        status: row.status,
        address: row.address,
        addressNumber: row.address_number,
        neighborhood: row.neighborhood,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        country: row.country,
        phone: row.phone,
        email: row.email,
        website: row.website,
        logo: row.logo,
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : null,
        settings: row.settings ? (typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings) : null,
        commissionRate: row.commission_rate ? Number(row.commission_rate) : null,
        cleaningSchedule: row.cleaning_schedule,
        services: row.services ? (typeof row.services === 'string' ? JSON.parse(row.services) : row.services) : null,
        wifiNetwork: row.wifi_network || null,
        wifiPassword: row.wifi_password || null,
        owner: row.owner_id ? {
          id: row.owner_id,
          name: row.owner_name,
          email: row.owner_email,
          phone: row.owner_phone,
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      res.json({
        success: true,
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const property = propertyRepository.create(req.body);

      await propertyRepository.save(property);

      res.status(201).json({
        success: true,
        data: { property },
        message: 'Propriedade criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const propertyRepository = AppDataSource.getRepository(Property);

      const property = await propertyRepository
        .createQueryBuilder('property')
        .where('property.id = :id', { id: parseInt(id) })
        .andWhere('property.deletedAt IS NULL')
        .getOne();

      if (!property) {
        throw new AppError('Propriedade não encontrada', 404);
      }

      // Atualizar campos permitidos
      const { name, type, status, address, addressNumber, neighborhood, city, state, zipCode, country, phone, email, website, logo, images, settings, commissionRate, cleaningSchedule, services, ownerId, wifiNetwork, wifiPassword } = req.body;

      if (name !== undefined) property.name = name;
      if (type !== undefined) property.type = type;
      if (status !== undefined) property.status = status;
      if (address !== undefined) property.address = address;
      if (addressNumber !== undefined) property.addressNumber = addressNumber;
      if (neighborhood !== undefined) property.neighborhood = neighborhood;
      if (city !== undefined) property.city = city;
      if (state !== undefined) property.state = state;
      if (zipCode !== undefined) property.zipCode = zipCode;
      if (country !== undefined) property.country = country;
      if (phone !== undefined) property.phone = phone;
      if (email !== undefined) property.email = email;
      if (website !== undefined) property.website = website;
      if (logo !== undefined) property.logo = logo;
      if (images !== undefined) property.images = images;
      if (settings !== undefined) {
        property.settings = {
          ...(typeof property.settings === 'string' ? JSON.parse(property.settings) : property.settings || {}),
          ...settings
        };
      }
      if (commissionRate !== undefined) property.commissionRate = commissionRate;
      if (cleaningSchedule !== undefined) property.cleaningSchedule = cleaningSchedule;
      if (services !== undefined) property.services = services;
      if (ownerId !== undefined) property.ownerId = ownerId;
      if (wifiNetwork !== undefined) property.wifiNetwork = wifiNetwork;
      if (wifiPassword !== undefined) property.wifiPassword = wifiPassword;

      await propertyRepository.save(property);

      res.json({
        success: true,
        data: { property },
        message: 'Propriedade atualizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const propertyRepository = AppDataSource.getRepository(Property);

      const property = await propertyRepository
        .createQueryBuilder('property')
        .where('property.id = :id', { id: parseInt(id) })
        .andWhere('property.deletedAt IS NULL')
        .getOne();

      if (!property) {
        throw new AppError('Propriedade não encontrada', 404);
      }

      await propertyRepository.softRemove(property);

      res.json({
        success: true,
        message: 'Propriedade deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
