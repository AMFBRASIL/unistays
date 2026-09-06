import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Unit, UnitStatus } from '@/entities/Unit.entity';
import { Property } from '@/entities/Property.entity';
import { RoomType } from '@/entities/RoomType.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateUnitInput, UpdateUnitInput } from '@/validators/unit.validator';
import { v4 as uuidv4 } from 'uuid';

interface UnitResponse {
  id: number;
  uuid: string;
  propertyId: number;
  property?: { id: number; name: string; uuid: string } | null;
  number: string;
  name?: string | null;
  type: string;
  roomTypeId?: number | null;
  roomType?: { id: number; name: string; code: string } | null;
  floor: number;
  capacity: number;
  maxCapacity: number;
  beds?: string | null;
  sizeM2?: number | null;
  amenities?: string[] | null;
  images?: string[] | null;
  status: string;
  rates?: { daily?: number; weekly?: number; monthly?: number } | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UnitController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, status, roomTypeId } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          u.id,
          u.uuid,
          u.property_id as propertyId,
          u.number,
          u.name,
          rt.name as type,
          u.room_type_id as roomTypeId,
          u.floor,
          u.capacity,
          u.max_capacity as maxCapacity,
          u.beds,
          u.size_m2 as sizeM2,
          u.view,
          u.images,
          u.status,
          u.rates,
          u.notes,
          u.created_at as createdAt,
          u.updated_at as updatedAt,
          p.id as property_id_col,
          p.name as property_name,
          p.type as property_type,
          p.uuid as property_uuid
        FROM units u
        INNER JOIN properties p ON u.property_id = p.id AND p.deleted_at IS NULL
        LEFT JOIN room_types rt ON u.room_type_id = rt.id
        WHERE u.deleted_at IS NULL
      `;

      const params: any[] = [];
      if (propertyId) {
        query += ` AND u.property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }
      if (status) {
        query += ` AND u.status = ?`;
        params.push(status);
      }
      if (roomTypeId) {
        query += ` AND u.room_type_id = ?`;
        params.push(parseInt(roomTypeId as string, 10));
      }

      query += ` ORDER BY u.floor ASC, u.number ASC`;

      const units = await queryRunner.query(query, params);
      await queryRunner.release();

      // Mapear resultados
      const unitsResponse: UnitResponse[] = units.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        property: row.property_id_col ? {
          id: row.property_id_col,
          name: row.property_name,
          type: row.property_type || null,
          uuid: row.property_uuid,
        } : null,
        number: row.number,
        name: row.name,
        type: row.type || "Standard",
        roomTypeId: row.roomTypeId || null,
        roomType: row.roomTypeId ? { id: row.roomTypeId, name: row.type || "Standard", code: "" } : null,
        floor: row.floor,
        capacity: row.capacity,
        maxCapacity: row.maxCapacity,
        beds: row.beds,
        sizeM2: row.sizeM2 ? Number(row.sizeM2) : null,
        view: row.view || null,
        amenities: null, // Listing doesn't load amenities to improve performance
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : null,
        status: row.status,
        rates: row.rates ? (typeof row.rates === 'string' ? JSON.parse(row.rates) : row.rates) : null,
        notes: row.notes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { units: unitsResponse },
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
        // Usar SQL raw para garantir que room_type_id seja buscado mesmo que não esteja na entidade
        const query = `
          SELECT 
            u.id,
            u.uuid,
            u.property_id as propertyId,
            u.number,
            u.name,
            rt.name as type,
            u.room_type_id as roomTypeId,
            u.floor,
            u.capacity,
            u.max_capacity as maxCapacity,
            u.beds,
            u.size_m2 as sizeM2,
            u.view,
            u.images,
            u.status,
            u.rates,
            u.notes,
            u.created_at as createdAt,
            u.updated_at as updatedAt,
            p.id as property_id_col,
            p.name as property_name,
            p.type as property_type,
            p.uuid as property_uuid
          FROM units u
          LEFT JOIN properties p ON u.property_id = p.id AND p.deleted_at IS NULL
          LEFT JOIN room_types rt ON u.room_type_id = rt.id
          WHERE u.id = ? AND u.deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Quarto não encontrado', 404);
        }

        const row = results[0];

        // Buscar roomType se roomTypeId existir
        let roomType = null;
        if (row.roomTypeId) {
          try {
            const roomTypeRepository = AppDataSource.getRepository(RoomType);
            roomType = await roomTypeRepository.findOne({
              where: { id: row.roomTypeId },
              select: ['id', 'name', 'code'],
              relations: ['amenities']
            });
          } catch (error) {
            // Ignore if column doesn't exist or room type not found
          }
        }

        res.json({
          success: true,
          data: {
            unit: {
              id: row.id,
              uuid: row.uuid,
              propertyId: row.propertyId,
              property: row.property_id_col ? {
                id: row.property_id_col,
                name: row.property_name,
                type: row.property_type || null,
                uuid: row.property_uuid,
              } : null,
              number: row.number,
              name: row.name,
              type: row.type || "Standard",
              roomTypeId: row.roomTypeId || null,
              roomType: roomType ? {
                id: roomType.id,
                name: roomType.name,
                code: roomType.code,
              } : null,
              floor: row.floor,
              capacity: row.capacity,
              maxCapacity: row.maxCapacity,
              beds: row.beds,
              sizeM2: row.sizeM2 ? Number(row.sizeM2) : null,
              amenities: roomType?.amenities?.map(a => a.name) || [],
              // Extrair position e view do amenities se for objeto (LEGACY support remove if needed)
              position: null,
              view: row.view,
              images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : null,
              status: row.status,
              rates: row.rates ? (typeof row.rates === 'string' ? JSON.parse(row.rates) : row.rates) : null,
              notes: row.notes,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          },
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
      const data: CreateUnitInput = req.body;
      const unitRepository = AppDataSource.getRepository(Unit);
      const propertyRepository = AppDataSource.getRepository(Property);
      const roomTypeRepository = AppDataSource.getRepository(RoomType);

      // Verificar se a propriedade existe
      const property = await propertyRepository.findOne({
        where: { id: data.propertyId },
      });

      if (!property) {
        throw new AppError('Propriedade não encontrada', 404);
      }

      // Verificar se já existe um quarto com o mesmo número na propriedade
      const existingUnit = await unitRepository
        .createQueryBuilder('unit')
        .where('unit.property_id = :propertyId', { propertyId: data.propertyId })
        .andWhere('unit.number = :number', { number: data.number })
        .getOne();

      if (existingUnit) {
        throw new AppError('Já existe um quarto com este número nesta propriedade', 400);
      }

      // Verificar se roomTypeId existe (se fornecido)
      if (data.roomTypeId) {
        try {
          const roomType = await roomTypeRepository.findOne({
            where: { id: data.roomTypeId },
          });
          if (!roomType) {
            throw new AppError('Tipo de quarto não encontrado', 404);
          }
        } catch (error) {
          // If roomType table doesn't exist yet, skip validation
          console.warn('RoomType validation skipped:', error);
        }
      }

      // Criar quarto usando SQL direto
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const uuid = uuidv4();
        const amenitiesJson = data.amenities ? JSON.stringify(data.amenities) : null;
        const imagesJson = data.images ? JSON.stringify(data.images) : null;
        const ratesJson = data.rates ? JSON.stringify(data.rates) : null;

        const insertQuery = `
          INSERT INTO units (
            uuid, property_id, number, name, floor, capacity, max_capacity,
            beds, size_m2, view, images, status, rates, notes, created_at, updated_at
            ${data.roomTypeId ? ', room_type_id' : ''}
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            ${data.roomTypeId ? ', ?' : ''}
          )
        `;

        const insertParams: any[] = [
          uuid,
          data.propertyId,
          data.number,
          data.name || null,
          data.floor,
          data.capacity,
          data.maxCapacity,
          data.beds || null,
          data.sizeM2 || null,
          data.view || null,
          imagesJson,
          data.status || 'available',
          ratesJson,
          data.notes || null,
        ];

        if (data.roomTypeId) {
          insertParams.push(data.roomTypeId);
        }

        const result = await queryRunner.query(insertQuery, insertParams);
        const unitId = result.insertId;

        // Buscar o quarto criado com JOIN
        const selectQuery = `
          SELECT 
            u.id,
            u.uuid,
            u.property_id as propertyId,
            u.number,
            u.name,
            rt.name as type,
            u.floor,
            u.capacity,
            u.max_capacity as maxCapacity,
            u.beds,
            u.size_m2 as sizeM2,
            u.images,
            u.status,
            u.rates,
            u.notes,
            u.created_at as createdAt,
            u.updated_at as updatedAt,
            p.id as property_id_col,
            p.name as property_name,
            p.type as property_type,
            p.uuid as property_uuid
          FROM units u
          LEFT JOIN properties p ON u.property_id = p.id AND p.deleted_at IS NULL
          LEFT JOIN room_types rt ON u.room_type_id = rt.id
          WHERE u.id = ? AND u.deleted_at IS NULL
        `;

        const units = await queryRunner.query(selectQuery, [unitId]);

        await queryRunner.commitTransaction();

        if (units.length === 0) {
          throw new AppError('Erro ao criar quarto', 500);
        }

        const row = units[0];

        res.status(201).json({
          success: true,
          data: {
            unit: {
              id: row.id,
              uuid: row.uuid,
              propertyId: row.propertyId,
              property: row.property_id_col ? {
                id: row.property_id_col,
                name: row.property_name,
                type: row.property_type || null,
                uuid: row.property_uuid,
              } : null,
              number: row.number,
              name: row.name,
              type: row.type || "Standard",
              roomTypeId: row.roomTypeId || null,
              roomType: null, // Listing doesn't load relation here unless we fetch it. 
              floor: row.floor,
              capacity: row.capacity,
              maxCapacity: row.maxCapacity,
              beds: row.beds,
              sizeM2: row.sizeM2 ? Number(row.sizeM2) : null,
              amenities: [], // Empty for created as we don't fully fetch roomtype again here unless needed.
              images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : null,
              status: row.status,
              rates: row.rates ? (typeof row.rates === 'string' ? JSON.parse(row.rates) : row.rates) : null,
              notes: row.notes,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          },
          message: 'Quarto criado com sucesso',
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateUnitInput = req.body;
      const unitRepository = AppDataSource.getRepository(Unit);
      const roomTypeRepository = AppDataSource.getRepository(RoomType);

      const unit = await unitRepository.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!unit) {
        throw new AppError('Quarto não encontrado', 404);
      }

      // Verificar se roomTypeId existe (se fornecido)
      if (data.roomTypeId) {
        try {
          const roomType = await roomTypeRepository.findOne({
            where: { id: data.roomTypeId },
          });
          if (!roomType) {
            throw new AppError('Tipo de quarto não encontrado', 404);
          }
        } catch (error) {
          // If roomType table doesn't exist yet, skip validation
          console.warn('RoomType validation skipped:', error);
        }
      }

      // Verificar se número mudou e se já existe outro quarto com o novo número
      if (data.number && data.number !== unit.number) {
        const existingUnit = await unitRepository
          .createQueryBuilder('unit')
          .where('unit.property_id = :propertyId', { propertyId: unit.propertyId })
          .andWhere('unit.number = :number', { number: data.number })
          .andWhere('unit.id != :id', { id: unit.id })
          .getOne();

        if (existingUnit) {
          throw new AppError('Já existe um quarto com este número nesta propriedade', 400);
        }
      }

      // Atualizar campos
      if (data.number !== undefined) unit.number = data.number;
      if (data.name !== undefined) unit.name = data.name;
      // if (data.type !== undefined) unit.type = data.type; // REMOVED
      if (data.roomTypeId !== undefined) (unit as any).roomTypeId = data.roomTypeId;
      if (data.floor !== undefined) unit.floor = data.floor;
      if (data.capacity !== undefined) unit.capacity = data.capacity;
      if (data.maxCapacity !== undefined) unit.maxCapacity = data.maxCapacity;
      if (data.beds !== undefined) unit.beds = data.beds;
      if (data.sizeM2 !== undefined) unit.sizeM2 = data.sizeM2;
      if (data.view !== undefined) unit.view = data.view;
      // Amenities removed from unit table
      // if (data.amenities !== undefined) {
      //   unit.amenities = data.amenities;
      // }
      if (data.images !== undefined) unit.images = data.images;
      if (data.status !== undefined) unit.status = data.status as UnitStatus;
      if (data.rates !== undefined) unit.rates = data.rates;
      if (data.notes !== undefined) unit.notes = data.notes;

      await unitRepository.save(unit);

      // Buscar dados atualizados usando SQL raw para garantir room_type_id e parse de amenities
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        const query = `
          SELECT 
            u.id,
            u.uuid,
            u.property_id as propertyId,
            u.number,
            u.name,
            rt.name as type,
            u.room_type_id as roomTypeId,
            u.floor,
            u.capacity,
            u.max_capacity as maxCapacity,
            u.beds,
            u.size_m2 as sizeM2,
            u.view,
            u.images,
            u.status,
            u.rates,
            u.notes,
            u.created_at as createdAt,
            u.updated_at as updatedAt,
            p.id as property_id_col,
            p.name as property_name,
            p.uuid as property_uuid
          FROM units u
          LEFT JOIN properties p ON u.property_id = p.id AND p.deleted_at IS NULL
          LEFT JOIN room_types rt ON u.room_type_id = rt.id
          WHERE u.id = ? AND u.deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [unit.id]);

        if (results.length === 0) {
          throw new AppError('Erro ao atualizar quarto', 500);
        }

        const row = results[0];

        // Buscar roomType se roomTypeId existir
        let roomType = null;
        if (row.roomTypeId) {
          try {
            const roomTypeRepository = AppDataSource.getRepository(RoomType);
            roomType = await roomTypeRepository.findOne({
              where: { id: row.roomTypeId },
              select: ['id', 'name', 'code'],
            });
          } catch (error) {
            // Ignore
          }
        }

        // Parse amenities
        let amenities = null;
        if (row.amenities) {
          try {
            amenities = typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities;
          } catch (error) {
            amenities = null;
          }
        }

        res.json({
          success: true,
          data: {
            unit: {
              id: row.id,
              uuid: row.uuid,
              propertyId: row.propertyId,
              property: row.property_id_col ? {
                id: row.property_id_col,
                name: row.property_name,
                type: row.property_type || null,
                uuid: row.property_uuid,
              } : null,
              number: row.number,
              name: row.name,
              type: row.type,
              roomTypeId: row.roomTypeId || null,
              roomType: roomType ? {
                id: roomType.id,
                name: roomType.name,
                code: roomType.code,
              } : null,
              floor: row.floor,
              capacity: row.capacity,
              maxCapacity: row.maxCapacity,
              beds: row.beds,
              sizeM2: row.sizeM2 ? Number(row.sizeM2) : null,
              amenities: amenities,
              // Extrair position e view do amenities se for objeto
              position: (amenities && typeof amenities === 'object' && !Array.isArray(amenities) && amenities.position) ? amenities.position : null,
              view: row.view || ((amenities && typeof amenities === 'object' && !Array.isArray(amenities) && amenities.view) ? amenities.view : null),
              images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : null,
              status: row.status,
              rates: row.rates ? (typeof row.rates === 'string' ? JSON.parse(row.rates) : row.rates) : null,
              notes: row.notes,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          },
          message: 'Quarto atualizado com sucesso',
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const unitRepository = AppDataSource.getRepository(Unit);

      const unit = await unitRepository.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!unit) {
        throw new AppError('Quarto não encontrado', 404);
      }

      await unitRepository.softRemove(unit);

      res.json({
        success: true,
        message: 'Quarto removido com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
