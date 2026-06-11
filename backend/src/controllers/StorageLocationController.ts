import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { StorageLocation } from '@/entities/StorageLocation.entity';
import { AppError } from '@/middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

export class StorageLocationController {
  private repository = AppDataSource.getRepository(StorageLocation);
  private schemaEnsured = false;
  private dbTypeEnumValues: Set<string> = new Set();

  private async ensureSchema() {
    if (this.schemaEnsured) return;

    const rows = await AppDataSource.query(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'storage_locations'
      `
    ) as Array<{ COLUMN_NAME?: string }>;

    const existing = new Set(rows.map((r) => String(r.COLUMN_NAME ?? '').toLowerCase()));
    const addColumnIfMissing = async (name: string, ddl: string) => {
      if (!existing.has(name.toLowerCase())) {
        try {
          await AppDataSource.query(`ALTER TABLE storage_locations ADD COLUMN ${ddl}`);
          existing.add(name.toLowerCase());
        } catch (error: unknown) {
          const message = error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : '';
          // Evita falha em concorrência de requests que tentem adicionar a mesma coluna ao mesmo tempo.
          if (!message.toLowerCase().includes('duplicate column')) {
            throw error;
          }
          existing.add(name.toLowerCase());
        }
      }
    };

    await addColumnIfMissing('capacity', '`capacity` int unsigned NULL');
    await addColumnIfMissing('current_occupancy', '`current_occupancy` int unsigned NOT NULL DEFAULT 0');
    await addColumnIfMissing(
      'temperature_control',
      "`temperature_control` enum('ambient','refrigerated','frozen','ultra_frozen','heated') NOT NULL DEFAULT 'ambient'"
    );
    await addColumnIfMissing('temperature_min', '`temperature_min` decimal(5,2) NULL');
    await addColumnIfMissing('temperature_max', '`temperature_max` decimal(5,2) NULL');
    await addColumnIfMissing('is_restricted', '`is_restricted` tinyint NOT NULL DEFAULT 0');
    await addColumnIfMissing('requires_approval', '`requires_approval` tinyint NOT NULL DEFAULT 0');
    await addColumnIfMissing('requires_count', '`requires_count` tinyint NOT NULL DEFAULT 0');
    await addColumnIfMissing('count_frequency_days', '`count_frequency_days` int unsigned NULL');
    await addColumnIfMissing('allow_negative_stock', '`allow_negative_stock` tinyint NOT NULL DEFAULT 0');
    await addColumnIfMissing('fifo_required', '`fifo_required` tinyint NOT NULL DEFAULT 1');
    await addColumnIfMissing(
      'status',
      "`status` enum('active','inactive','maintenance','blocked') NOT NULL DEFAULT 'active'"
    );
    await addColumnIfMissing('is_default', '`is_default` tinyint NOT NULL DEFAULT 0');

    const typeInfo = await AppDataSource.query(
      `
        SELECT COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'storage_locations'
          AND COLUMN_NAME = 'type'
        LIMIT 1
      `
    ) as Array<{ COLUMN_TYPE?: string }>;

    const columnType = String(typeInfo[0]?.COLUMN_TYPE ?? '');
    const matches = columnType.match(/'([^']+)'/g) ?? [];
    this.dbTypeEnumValues = new Set(matches.map((m) => m.slice(1, -1)));

    this.schemaEnsured = true;
  }

  private normalizeTypeForDatabase(type: string): string {
    if (!type) return 'almoxarifado';
    if (this.dbTypeEnumValues.has(type)) return type;

    const legacyFallbackByNewType: Record<string, string> = {
      almoxarifado: 'warehouse',
      deposito: 'storeroom',
      refrigerado: 'kitchen',
      governanca: 'storeroom',
      manutencao: 'other',
      cofre: 'other',
      quarto: 'room_stock',
      cozinha: 'kitchen',
      bar: 'bar',
      lavanderia: 'laundry',
    };

    const fallbackByNewType: Record<string, string[]> = {
      almoxarifado: ['warehouse', 'storeroom', 'other'],
      deposito: ['storeroom', 'warehouse', 'other'],
      refrigerado: ['kitchen', 'storeroom', 'warehouse', 'other'],
      governanca: ['storeroom', 'warehouse', 'other'],
      manutencao: ['other', 'storeroom', 'warehouse'],
      cofre: ['other', 'storeroom', 'warehouse'],
      quarto: ['room_stock', 'storeroom', 'warehouse'],
      cozinha: ['kitchen', 'storeroom', 'warehouse'],
      bar: ['bar', 'storeroom', 'warehouse'],
      lavanderia: ['laundry', 'storeroom', 'warehouse'],
    };

    const candidates = fallbackByNewType[type] ?? ['storeroom', 'warehouse', 'other', 'almoxarifado'];
    const found = candidates.find((candidate) => this.dbTypeEnumValues.has(candidate));
    if (found) return found;

    // Segurança adicional para schema legado quando não foi possível inferir enum da coluna.
    if (legacyFallbackByNewType[type]) return legacyFallbackByNewType[type];

    return type;
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      await this.ensureSchema();
      const { propertyId, status } = req.query;
      const qb = this.repository
        .createQueryBuilder('sl')
        .leftJoinAndSelect('sl.property', 'property')
        .orderBy('sl.name', 'ASC');

      if (propertyId) {
        qb.andWhere('sl.property_id = :propertyId', { propertyId: Number(propertyId) });
      }
      if (status && status !== 'all') {
        qb.andWhere('sl.status = :status', { status: String(status) });
      }

      const locations = await qb.getMany();

      const data = locations.map((loc) => ({
        id: loc.id,
        uuid: loc.uuid,
        propertyId: loc.propertyId,
        propertyName: loc.property?.name ?? null,
        code: loc.code,
        name: loc.name,
        description: loc.description,
        type: loc.type,
        capacity: loc.capacity,
        currentOccupancy: loc.currentOccupancy,
        temperatureControl: loc.temperatureControl,
        temperatureMin: loc.temperatureMin != null ? Number(loc.temperatureMin) : null,
        temperatureMax: loc.temperatureMax != null ? Number(loc.temperatureMax) : null,
        isRestricted: Boolean(loc.isRestricted),
        requiresApproval: Boolean(loc.requiresApproval),
        requiresCount: Boolean(loc.requiresCount),
        countFrequencyDays: loc.countFrequencyDays,
        allowNegativeStock: Boolean(loc.allowNegativeStock),
        fifoRequired: Boolean(loc.fifoRequired),
        status: loc.status,
        isDefault: Boolean(loc.isDefault),
        createdAt: loc.createdAt,
        updatedAt: loc.updatedAt,
      }));

      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      await this.ensureSchema();
      const { id } = req.params;
      const location = await this.repository.findOne({
        where: { id: Number(id) },
        relations: ['property'],
      });

      if (!location) {
        throw new AppError('Local de armazenamento não encontrado', 404);
      }

      return res.json({
        success: true,
        data: {
          id: location.id,
          uuid: location.uuid,
          propertyId: location.propertyId,
          propertyName: location.property?.name ?? null,
          code: location.code,
          name: location.name,
          description: location.description,
          type: location.type,
          capacity: location.capacity,
          currentOccupancy: location.currentOccupancy,
          temperatureControl: location.temperatureControl,
          temperatureMin: location.temperatureMin != null ? Number(location.temperatureMin) : null,
          temperatureMax: location.temperatureMax != null ? Number(location.temperatureMax) : null,
          isRestricted: Boolean(location.isRestricted),
          requiresApproval: Boolean(location.requiresApproval),
          requiresCount: Boolean(location.requiresCount),
          countFrequencyDays: location.countFrequencyDays,
          allowNegativeStock: Boolean(location.allowNegativeStock),
          fifoRequired: Boolean(location.fifoRequired),
          status: location.status,
          isDefault: Boolean(location.isDefault),
          createdAt: location.createdAt,
          updatedAt: location.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.ensureSchema();
      const body = req.body as Record<string, unknown>;
      const propertyId = body.propertyId != null ? Number(body.propertyId) : null;
      if (propertyId == null || isNaN(propertyId)) {
        throw new AppError('propertyId é obrigatório', 400);
      }

      const code = typeof body.code === 'string' ? body.code.trim() : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) throw new AppError('Nome é obrigatório', 400);

      if (code) {
        const existing = await this.repository.findOne({
          where: { propertyId, code },
        });
        if (existing) {
          throw new AppError('Já existe um local com este código nesta propriedade', 400);
        }
      }

      const requestedType = typeof body.type === 'string' ? body.type : 'almoxarifado';
      const type = this.normalizeTypeForDatabase(requestedType) as StorageLocation['type'];
      const temperatureControl = (body.temperatureControl as StorageLocation['temperatureControl']) ?? 'ambient';
      const status = (body.status as StorageLocation['status']) ?? 'active';

      const location = this.repository.create({
        uuid: uuidv4(),
        propertyId,
        code: code || '', // trigger preenche se vazio
        name,
        description: typeof body.description === 'string' ? body.description : null,
        type,
        capacity: body.capacity != null ? Number(body.capacity) : null,
        temperatureControl,
        temperatureMin: body.temperatureMin != null && body.temperatureMin !== '' ? Number(body.temperatureMin) : null,
        temperatureMax: body.temperatureMax != null && body.temperatureMax !== '' ? Number(body.temperatureMax) : null,
        isRestricted: Boolean(body.isRestricted),
        requiresApproval: Boolean(body.requiresApproval),
        requiresCount: Boolean(body.requiresCount),
        countFrequencyDays: body.countFrequencyDays != null ? Number(body.countFrequencyDays) : null,
        allowNegativeStock: Boolean(body.allowNegativeStock),
        fifoRequired: body.fifoRequired !== false,
        status,
        isDefault: Boolean(body.isDefault),
      });

      await this.repository.save(location);

      return res.status(201).json({ success: true, data: location, message: 'Local de armazenamento criado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await this.ensureSchema();
      const { id } = req.params;
      const body = req.body as Record<string, unknown>;
      const location = await this.repository.findOne({ where: { id: Number(id) }, relations: ['property'] });

      if (!location) {
        throw new AppError('Local de armazenamento não encontrado', 404);
      }

      if (body.propertyId != null) location.propertyId = Number(body.propertyId);
      if (typeof body.code === 'string') location.code = body.code.trim();
      if (typeof body.name === 'string') {
        if (!body.name.trim()) throw new AppError('Nome não pode ser vazio', 400);
        location.name = body.name.trim();
      }
      if (body.description !== undefined) location.description = typeof body.description === 'string' ? body.description : null;
      if (body.type != null && typeof body.type === 'string') {
        location.type = this.normalizeTypeForDatabase(body.type) as StorageLocation['type'];
      }
      if (body.capacity !== undefined) location.capacity = body.capacity === '' || body.capacity == null ? null : Number(body.capacity);
      if (body.temperatureControl != null) location.temperatureControl = body.temperatureControl as StorageLocation['temperatureControl'];
      if (body.temperatureMin !== undefined) location.temperatureMin = body.temperatureMin === '' || body.temperatureMin == null ? null : Number(body.temperatureMin);
      if (body.temperatureMax !== undefined) location.temperatureMax = body.temperatureMax === '' || body.temperatureMax == null ? null : Number(body.temperatureMax);
      if (body.isRestricted !== undefined) location.isRestricted = Boolean(body.isRestricted);
      if (body.requiresApproval !== undefined) location.requiresApproval = Boolean(body.requiresApproval);
      if (body.requiresCount !== undefined) location.requiresCount = Boolean(body.requiresCount);
      if (body.countFrequencyDays !== undefined) location.countFrequencyDays = body.countFrequencyDays == null ? null : Number(body.countFrequencyDays);
      if (body.allowNegativeStock !== undefined) location.allowNegativeStock = Boolean(body.allowNegativeStock);
      if (body.fifoRequired !== undefined) location.fifoRequired = Boolean(body.fifoRequired);
      if (body.status != null) location.status = body.status as StorageLocation['status'];
      if (body.isDefault !== undefined) location.isDefault = Boolean(body.isDefault);

      await this.repository.save(location);

      return res.json({ success: true, data: location, message: 'Local de armazenamento atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.ensureSchema();
      const { id } = req.params;
      const location = await this.repository.findOne({ where: { id: Number(id) } });

      if (!location) {
        throw new AppError('Local de armazenamento não encontrado', 404);
      }

      await this.repository.remove(location);
      return res.json({ success: true, message: 'Local de armazenamento removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}
