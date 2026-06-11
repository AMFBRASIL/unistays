import { Request, Response, NextFunction } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { RoomType, RoomTypeStatus } from '@/entities/RoomType.entity';
import { Amenity } from '@/entities/Amenity.entity';
import { Property, PropertyType } from '@/entities/Property.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateRoomTypeInput, UpdateRoomTypeInput } from '@/validators/roomType.validator';

export class RoomTypeController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId } = req.query;
      const roomTypeRepository = AppDataSource.getRepository(RoomType);

      const where: any = {};
      if (propertyId) {
        where.propertyId = parseInt(propertyId as string, 10);
      }

      const roomTypes = await roomTypeRepository.find({
        where,
        relations: ['amenities', 'property'],
        order: { createdAt: 'DESC' },
      });

      const roomTypesResponse = roomTypes.map((rt) => ({
        id: rt.id,
        uuid: rt.uuid,
        propertyId: rt.propertyId,
        code: rt.code,
        name: rt.name,
        description: rt.description,
        propertyType: rt.propertyType,
        maxGuests: rt.maxGuests,
        maxAdults: rt.maxAdults,
        maxChildren: rt.maxChildren,
        basePrice: rt.basePrice ? Number(rt.basePrice) : null,
        adultPrice: rt.adultPrice ? Number(rt.adultPrice) : 0,
        childPrice: rt.childPrice ? Number(rt.childPrice) : 0,
        infantPrice: rt.infantPrice ? Number(rt.infantPrice) : 0,
        pricingStyle: rt.pricingStyle,
        sizeM2: rt.sizeM2 ? Number(rt.sizeM2) : null,
        images: rt.images,
        status: rt.status,
        amenities: rt.amenities?.map((a) => ({
          id: a.id,
          uuid: a.uuid,
          code: a.code,
          name: a.name,
          category: a.category,
          icon: a.icon,
          isChargeable: a.isChargeable,
          price: a.price ? Number(a.price) : null,
        })) || [],
        createdAt: rt.createdAt,
        updatedAt: rt.updatedAt,
      }));

      res.json({
        success: true,
        data: { roomTypes: roomTypesResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const roomTypeRepository = AppDataSource.getRepository(RoomType);

      const roomType = await roomTypeRepository.findOne({
        where: { id: parseInt(id, 10) },
        relations: ['amenities', 'property'],
      });

      if (!roomType) {
        throw new AppError('Tipo de quarto não encontrado', 404);
      }

      res.json({
        success: true,
        data: {
          roomType: {
            id: roomType.id,
            uuid: roomType.uuid,
            propertyId: roomType.propertyId,
            code: roomType.code,
            name: roomType.name,
            description: roomType.description,
            propertyType: roomType.propertyType,
            maxGuests: roomType.maxGuests,
            maxAdults: roomType.maxAdults,
            maxChildren: roomType.maxChildren,
            basePrice: roomType.basePrice ? Number(roomType.basePrice) : null,
            adultPrice: roomType.adultPrice ? Number(roomType.adultPrice) : 0,
            childPrice: roomType.childPrice ? Number(roomType.childPrice) : 0,
            infantPrice: roomType.infantPrice ? Number(roomType.infantPrice) : 0,
            pricingStyle: roomType.pricingStyle,
            sizeM2: roomType.sizeM2 ? Number(roomType.sizeM2) : null,
            images: roomType.images,
            status: roomType.status,
            amenities: roomType.amenities?.map((a) => ({
              id: a.id,
              uuid: a.uuid,
              code: a.code,
              name: a.name,
              category: a.category,
              icon: a.icon,
              isChargeable: a.isChargeable,
              price: a.price ? Number(a.price) : null,
            })) || [],
            createdAt: roomType.createdAt,
            updatedAt: roomType.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateRoomTypeInput = req.body;
      const roomTypeRepository = AppDataSource.getRepository(RoomType);
      const propertyRepository = AppDataSource.getRepository(Property);
      const amenityRepository = AppDataSource.getRepository(Amenity);

      // Verificar se a propriedade existe
      const property = await propertyRepository.findOne({
        where: { id: data.propertyId },
      });

      if (!property) {
        throw new AppError('Propriedade não encontrada', 404);
      }

      // Verificar se já existe um tipo de quarto com o mesmo código na propriedade
      const existingRoomType = await roomTypeRepository.findOne({
        where: {
          propertyId: data.propertyId,
          code: data.code,
        },
      });

      if (existingRoomType) {
        throw new AppError('Já existe um tipo de quarto com este código nesta propriedade', 400);
      }

      // Criar tipo de quarto
      const roomType = roomTypeRepository.create({
        propertyId: data.propertyId,
        code: data.code,
        name: data.name,
        description: data.description || null,
        propertyType: data.propertyType as PropertyType,
        maxGuests: data.maxGuests,
        maxAdults: data.maxAdults,
        maxChildren: data.maxChildren,
        basePrice: data.basePrice !== undefined ? data.basePrice : null,
        adultPrice: data.adultPrice !== undefined ? data.adultPrice : 0,
        childPrice: data.childPrice !== undefined ? data.childPrice : 0,
        infantPrice: data.infantPrice !== undefined ? data.infantPrice : 0,
        pricingStyle: data.pricingStyle || 'per_unit',
        sizeM2: data.sizeM2 || null,
        images: data.images || null,
        status: (data.status as RoomTypeStatus) || RoomTypeStatus.ACTIVE,
      });

      // Adicionar amenities se fornecidas
      if (data.amenityIds && data.amenityIds.length > 0) {
        const amenities = await amenityRepository.findBy({ id: In(data.amenityIds) });
        if (amenities.length !== data.amenityIds.length) {
          throw new AppError('Uma ou mais amenidades não foram encontradas', 404);
        }
        roomType.amenities = amenities;
      }

      await roomTypeRepository.save(roomType);

      // Carregar relacionamentos para resposta
      const savedRoomType = await roomTypeRepository.findOne({
        where: { id: roomType.id },
        relations: ['amenities'],
      });

      if (!savedRoomType) {
        throw new AppError('Erro ao criar tipo de quarto', 500);
      }

      res.status(201).json({
        success: true,
        data: {
          roomType: {
            id: savedRoomType.id,
            uuid: savedRoomType.uuid,
            propertyId: savedRoomType.propertyId,
            code: savedRoomType.code,
            name: savedRoomType.name,
            description: savedRoomType.description,
            propertyType: savedRoomType.propertyType,
            maxGuests: savedRoomType.maxGuests,
            maxAdults: savedRoomType.maxAdults,
            maxChildren: savedRoomType.maxChildren,
            basePrice: savedRoomType.basePrice ? Number(savedRoomType.basePrice) : null,
            adultPrice: savedRoomType.adultPrice ? Number(savedRoomType.adultPrice) : 0,
            childPrice: savedRoomType.childPrice ? Number(savedRoomType.childPrice) : 0,
            infantPrice: savedRoomType.infantPrice ? Number(savedRoomType.infantPrice) : 0,
            pricingStyle: savedRoomType.pricingStyle,
            sizeM2: savedRoomType.sizeM2 ? Number(savedRoomType.sizeM2) : null,
            images: savedRoomType.images,
            status: savedRoomType.status,
            amenities: savedRoomType.amenities?.map((a) => ({
              id: a.id,
              uuid: a.uuid,
              code: a.code,
              name: a.name,
              category: a.category,
              icon: a.icon,
              isChargeable: a.isChargeable,
              price: a.price ? Number(a.price) : null,
            })) || [],
            createdAt: savedRoomType.createdAt,
            updatedAt: savedRoomType.updatedAt,
          },
        },
        message: 'Tipo de quarto criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateRoomTypeInput = req.body;
      const roomTypeRepository = AppDataSource.getRepository(RoomType);
      const amenityRepository = AppDataSource.getRepository(Amenity);

      const roomType = await roomTypeRepository.findOne({
        where: { id: parseInt(id, 10) },
        relations: ['amenities'],
      });

      if (!roomType) {
        throw new AppError('Tipo de quarto não encontrado', 404);
      }

      // Atualizar campos básicos
      if (data.code !== undefined) roomType.code = data.code;
      if (data.name !== undefined) roomType.name = data.name;
      if (data.description !== undefined) roomType.description = data.description;
      if (data.propertyType !== undefined) roomType.propertyType = data.propertyType as PropertyType;
      if (data.maxGuests !== undefined) roomType.maxGuests = data.maxGuests;
      if (data.maxAdults !== undefined) roomType.maxAdults = data.maxAdults;
      if (data.maxChildren !== undefined) roomType.maxChildren = data.maxChildren;
      if (data.basePrice !== undefined) roomType.basePrice = data.basePrice;
      if (data.adultPrice !== undefined) roomType.adultPrice = data.adultPrice;
      if (data.childPrice !== undefined) roomType.childPrice = data.childPrice;
      if (data.infantPrice !== undefined) roomType.infantPrice = data.infantPrice;
      if (data.pricingStyle !== undefined) roomType.pricingStyle = data.pricingStyle;
      if (data.sizeM2 !== undefined) roomType.sizeM2 = data.sizeM2;
      if (data.images !== undefined) roomType.images = data.images;
      if (data.status !== undefined) roomType.status = data.status as RoomTypeStatus;

      // Atualizar amenities se fornecidas
      if (data.amenityIds !== undefined) {
        if (data.amenityIds.length > 0) {
          const amenities = await amenityRepository.findBy({ id: In(data.amenityIds) });
          if (amenities.length !== data.amenityIds.length) {
            throw new AppError('Uma ou mais amenidades não foram encontradas', 404);
          }
          roomType.amenities = amenities;
        } else {
          roomType.amenities = [];
        }
      }

      await roomTypeRepository.save(roomType);

      res.json({
        success: true,
        data: {
          roomType: {
            id: roomType.id,
            uuid: roomType.uuid,
            propertyId: roomType.propertyId,
            code: roomType.code,
            name: roomType.name,
            description: roomType.description,
            propertyType: roomType.propertyType,
            maxGuests: roomType.maxGuests,
            maxAdults: roomType.maxAdults,
            maxChildren: roomType.maxChildren,
            basePrice: roomType.basePrice ? Number(roomType.basePrice) : null,
            adultPrice: roomType.adultPrice ? Number(roomType.adultPrice) : 0,
            childPrice: roomType.childPrice ? Number(roomType.childPrice) : 0,
            infantPrice: roomType.infantPrice ? Number(roomType.infantPrice) : 0,
            pricingStyle: roomType.pricingStyle,
            sizeM2: roomType.sizeM2 ? Number(roomType.sizeM2) : null,
            images: roomType.images,
            status: roomType.status,
            amenities: roomType.amenities?.map((a) => ({
              id: a.id,
              uuid: a.uuid,
              code: a.code,
              name: a.name,
              category: a.category,
              icon: a.icon,
              isChargeable: a.isChargeable,
              price: a.price ? Number(a.price) : null,
            })) || [],
            createdAt: roomType.createdAt,
            updatedAt: roomType.updatedAt,
          },
        },
        message: 'Tipo de quarto atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const roomTypeRepository = AppDataSource.getRepository(RoomType);

      const roomType = await roomTypeRepository.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!roomType) {
        throw new AppError('Tipo de quarto não encontrado', 404);
      }

      await roomTypeRepository.softRemove(roomType);

      res.json({
        success: true,
        message: 'Tipo de quarto removido com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
