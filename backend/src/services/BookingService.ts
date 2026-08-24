import { AppDataSource } from '../config/database';
import { Property } from '../entities/Property.entity';
import { Unit, UnitStatus } from '../entities/Unit.entity';
import { Reservation, ReservationStatus, StayType as ReservationStayType } from '../entities/Reservation.entity';
import { Guest, GuestTier } from '../entities/Guest.entity';
import { RatePlan } from '../entities/RatePlan.entity';
import { UnitRate } from '../entities/UnitRate.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual, Not, In, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../utils/bcrypt';
import QRCode from 'qrcode';

export class BookingService {
    /**
     * Get properties by type
     */
    static async getPropertiesByType(type?: string) {
        const propertyRepository = AppDataSource.getRepository(Property);

        const where: any = { deletedAt: IsNull() };
        // Map frontend types to backend types if needed, or assume they match
        if (type) {
            if (type === 'hotel') where.type = 'hotel';
            else if (type === 'apart-hotel') where.type = 'apart-hotel';
            else if (type === 'loft') where.type = 'loft';
            else if (type === 'temporada') where.type = 'temporada';
            else where.type = type;
        }

        const properties = await propertyRepository.find({
            where,
            relations: ['amenities'],
            order: { name: 'ASC' }
        });

        return properties;
    }

    /**
     * Get available regions (cities) from properties
     */
    static async getAvailableRegions() {
        const propertyRepository = AppDataSource.getRepository(Property);

        const properties = await propertyRepository
            .createQueryBuilder('property')
            .select('DISTINCT property.city', 'city')
            .where('property.city IS NOT NULL')
            .andWhere('property.deletedAt IS NULL')
            .getRawMany();

        return properties.map(p => p.city).filter(Boolean);
    }
    static async checkAvailability(params: {
        propertyType?: string;
        region?: string;
        checkIn: Date;
        checkOut: Date;
        guests: number;
        stayType?: string;
    }) {
        const { propertyType, region, checkIn, checkOut, guests, stayType = 'daily' } = params;

        const unitRepository = AppDataSource.getRepository(Unit);
        const reservationRepository = AppDataSource.getRepository(Reservation);

        const where: any = { deletedAt: IsNull(), status: UnitStatus.AVAILABLE };

        // Correct relations: remove 'rates' as relation, add property relations
        const units = await unitRepository.find({
            where,
            relations: ['roomType', 'roomType.property', 'roomType.amenities'],
        });

        // Filter by property type
        let filteredUnits = units;
        if (propertyType) {
            filteredUnits = units.filter(unit =>
                unit.roomType?.property?.type === propertyType
            );
        }

        // Filter by region (city)
        if (region) {
            filteredUnits = filteredUnits.filter(unit =>
                unit.roomType?.property?.city === region
            );
        }

        // Filter by capacity
        filteredUnits = filteredUnits.filter(unit =>
            (unit.roomType?.maxGuests || unit.maxCapacity || 0) >= guests
        );

        // Check availability for each unit and group by RoomType
        const availableCategoriesMap = new Map<number, any>();

        for (const unit of filteredUnits) {
            // Check if unit has conflicting reservations where status is NOT cancelled/noshow
            const conflictingReservations = await reservationRepository.count({
                where: {
                    unitId: unit.id,
                    status: Not(In([ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW])),
                    checkIn: LessThanOrEqual(checkOut),
                    checkOut: MoreThanOrEqual(checkIn),
                }
            });

            if (conflictingReservations === 0) {
                // Get prices for different stay types using dynamic rates and JSON columns
                const prices = await this.calculatePrices(unit, stayType, checkIn, checkOut);

                // Only consider if we have a valid price
                if (prices.daily > 0 || prices[stayType] > 0) {
                    const roomTypeId = unit.roomTypeId;
                    if (!roomTypeId) continue; // Skip units without RoomType

                    if (!availableCategoriesMap.has(roomTypeId)) {
                        // Initialize category entry
                        availableCategoriesMap.set(roomTypeId, {
                            id: roomTypeId, // This acts as the key for the frontend selection
                            name: unit.roomType?.name || unit.name || 'Categoria',
                            description: unit.roomType?.description || unit.notes || '',
                            capacity: unit.roomType?.maxGuests || unit.maxCapacity || 0,
                            size: unit.roomType?.sizeM2 || unit.sizeM2 || 0,
                            beds: unit.roomType?.maxAdults ? `${unit.roomType.maxAdults} Adultos` : unit.beds || '',
                            amenities: unit.roomType?.amenities?.map(a => a.name) || [],
                            rating: 5.0,
                            reviews: 12,
                            prices, // Assume prices are consistent per category
                            available: true,
                            originalPrice: prices.originalPrice,
                            propertyName: unit.roomType?.property?.name || '',
                            propertyType: unit.roomType?.property?.type || '',
                            city: unit.roomType?.property?.city || '',
                            neighborhood: unit.roomType?.property?.neighborhood || '',
                            unitId: unit.id, // Store at least one valid unit ID for booking
                            remainingUnits: 0,
                            imageUrl: unit.roomType?.images?.[0] || unit.images?.[0] || null,
                            taxRate: (unit.roomType?.property?.settings as any)?.taxRate || 5,
                            serviceFee: (unit.roomType?.property?.settings as any)?.serviceFee || 0,
                            units: [] // List of specific units available in this category
                        });
                    }

                    // Increment available count and add unit details
                    const category = availableCategoriesMap.get(roomTypeId);
                    category.remainingUnits += 1;
                    const rawImg = unit.images as string[] | string | null | undefined;
                    const unitImages = Array.isArray(rawImg)
                        ? rawImg
                        : typeof rawImg === 'string' && rawImg.startsWith('[')
                            ? (JSON.parse(rawImg) as string[])
                            : rawImg
                              ? [String(rawImg)]
                              : [];
                    category.units.push({
                        id: unit.id,
                        number: unit.number,
                        floor: unit.floor,
                        view: unit.view,
                        amenities: unit.roomType?.amenities?.map(a => a.name) || [],
                        images: unitImages
                    });
                }
            }
        }

        // Convert map to array
        return Array.from(availableCategoriesMap.values());
    }

    /**
     * Calculate prices for different stay types considering dynamic UnitRates
     */
    private static async calculatePrices(unit: Unit, currentStayType: string, startDate?: Date, endDate?: Date) {
        const prices: any = {
            daily: 0,
            weekly: 0,
            monthly: 0,
            longstay: 0,
            originalPrice: 0,
        };

        // 1. Try to get dynamic rates for the range if provided
        if (startDate && endDate) {
            const unitRateRepository = AppDataSource.getRepository(UnitRate);
            const dynamicRates = await unitRateRepository.find({
                where: {
                    unitId: unit.id,
                    date: Between(startDate, endDate),
                    available: true
                }
            });

            if (dynamicRates.length > 0) {
                // Calculate average for the specified stay types
                let totalDaily = 0;
                let totalWeekly = 0;
                let totalMonthly = 0;
                let daysCount = 0;

                // Create a map for quick lookup
                const ratesMap = new Map(dynamicRates.map(r => [new Date(r.date).toISOString().split('T')[0], r]));

                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const dateStr = currentDate.toISOString().split('T')[0];
                    const rate = ratesMap.get(dateStr);

                    if (rate) {
                        totalDaily += Number(rate.dailyRate || 0);
                        totalWeekly += Number(rate.weeklyRate || 0);
                        totalMonthly += Number(rate.monthlyRate || 0);
                        daysCount++;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                if (daysCount > 0) {
                    prices.daily = totalDaily / daysCount;
                    prices.weekly = totalWeekly / daysCount;
                    prices.monthly = totalMonthly / daysCount;
                    prices.originalPrice = prices.daily;

                    // If everything is calculated, we can return or continue to fallback for missing types
                    if (prices.daily > 0) {
                        if (!prices.weekly) prices.weekly = Math.round(prices.daily * 0.9);
                        if (!prices.monthly) prices.monthly = Math.round(prices.daily * 0.8);
                        prices.longstay = Math.round(prices.daily * 0.7);
                        return prices;
                    }
                }
            }
        }

        // --- FALLBACK LOGIC (Existing JSON rates) ---

        // 1. Try Unit generic rates (JSON)
        let rates = unit.rates;

        // 2. Fallback to Property rates (JSON) via RoomType
        if (!rates || (!rates.daily && !rates.weekly && !rates.monthly)) {
            const property = unit.roomType?.property;
            if (property && property.settings && (property.settings as any).rates) {
                rates = (property.settings as any).rates;
            }
        }

        if (!rates) {
            return prices;
        }

        // Set Base Prices directly from JSON
        prices.daily = Number(rates.daily || 0);
        prices.originalPrice = Number(rates.daily || 0);
        prices.weekly = Number(rates.weekly || 0);
        prices.monthly = Number(rates.monthly || 0);

        // Estimate logical prices if missing
        if (prices.daily > 0) {
            if (!prices.weekly) prices.weekly = Math.round(prices.daily * 0.9);
            if (!prices.monthly) prices.monthly = Math.round(prices.daily * 0.8);
            if (!prices.longstay) prices.longstay = Math.round(prices.daily * 0.7);
        }

        return prices;
    }

    /**
     * Create a new reservation from booking engine
     */
    static async createReservation(data: {
        unitId: number;
        checkIn: Date;
        checkOut: Date;
        guests: number;
        stayType: string;
        guestInfo: {
            name: string;
            email: string;
            phone: string;
            cpf: string;
            observations?: string;
        };
        paymentMethod?: string;
        promotionCode?: string;
        paymentStatus?: 'pending' | 'paid';
        pixGatewayProvider?: string;
        pixGatewayTxid?: string;
    }) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const {
                unitId,
                checkIn,
                checkOut,
                guests,
                stayType,
                guestInfo,
                paymentMethod,
                promotionCode,
                paymentStatus,
                pixGatewayProvider,
                pixGatewayTxid
            } = data;
            let generatedPassword = '';
            let isNewGuest = false;

            // 1. Find or create guest
            const guestRepository = queryRunner.manager.getRepository(Guest);
            let guest = await guestRepository.findOne({
                where: { email: guestInfo.email }
            });

            if (!guest) {
                isNewGuest = true;
                // Create new guest
                const nameParts = guestInfo.name.trim().split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                // Gerar senha aleatória de 8 caracteres
                generatedPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await hashPassword(generatedPassword);

                guest = guestRepository.create({
                    uuid: uuidv4(),
                    firstName,
                    lastName,
                    email: guestInfo.email,
                    phone: guestInfo.phone,
                    documentType: 'cpf',
                    documentNumber: guestInfo.cpf,
                    password: hashedPassword,
                    tier: GuestTier.BRONZE,
                    loyaltyPoints: 0,
                    totalStays: 0,
                    totalSpent: 0,
                    marketingConsent: true,
                    marketingEmail: true,
                    marketingWhatsapp: true,
                    marketingSms: true,
                    memberSince: new Date(),
                    type: 'physical',
                });

                await guestRepository.save(guest);

                // Trigger 'guest.created' workflow (EventBus centralizado)
                try {
                    const { EventBus } = await import('@/events/EventBus');
                    EventBus.emit('guest.created', {
                        ...guest,
                        id: guest.id,
                        email: guest.email,
                        totalStays: 0,
                        propertyId: null,
                    });
                } catch (error) {
                    console.error('Error emitting guest.created event:', error);
                }
            }

            // 2. Get unit and calculate prices
            const unitRepository = queryRunner.manager.getRepository(Unit);
            const unit = await unitRepository.findOne({
                where: { id: unitId },
                relations: ['roomType', 'roomType.property'] // Correct relations
            });

            if (!unit) {
                throw new Error('Unidade não encontrada');
            }

            const prices = await this.calculatePrices(unit, stayType, checkIn, checkOut);
            const pricePerNight = prices[stayType as keyof typeof prices] || prices.daily;

            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            let subtotal = pricePerNight * nights;

            // Apply promotion if exists
            let discount = 0;
            let appliedPromoDetails = null;
            if (promotionCode) {
                const promoResult = await queryRunner.query(
                    `SELECT * FROM promotions 
                     WHERE (code = ? OR promo_code = ?) 
                     AND status = 'active' 
                     AND (valid_from <= CURDATE() OR valid_from IS NULL) 
                     AND (valid_to >= CURDATE() OR valid_to IS NULL) 
                     AND deleted_at IS NULL`,
                    [promotionCode, promotionCode]
                );

                if (promoResult && promoResult.length > 0) {
                    const promo = promoResult[0];
                    const discountPercentage = promo.discount_percentage !== undefined ? promo.discount_percentage : promo.discountPercentage;
                    const discountValue = promo.discount_value !== undefined ? promo.discount_value : promo.discountValue;

                    appliedPromoDetails = {
                        name: promo.name,
                        code: promo.code || promo.promo_code || promo.promoCode,
                        type: promo.type,
                        discountPercentage: discountPercentage,
                        discountValue: discountValue
                    };

                    if (discountPercentage) {
                        discount = subtotal * (Number(discountPercentage) / 100);
                    } else if (discountValue) {
                        discount = Number(discountValue);
                    }
                }
            }

            // Taxes & Fees dynamic calculation
            const propertySettings = unit.roomType?.property?.settings as any || {};
            const taxRate = propertySettings.taxRate !== undefined ? Number(propertySettings.taxRate) : 5; // Default 5%
            const serviceFeeRate = propertySettings.serviceFee !== undefined ? Number(propertySettings.serviceFee) : 0; // Default 0%

            const taxes = subtotal * (taxRate / 100);
            const serviceFees = subtotal * (serviceFeeRate / 100);

            const total = Math.max(0, subtotal - discount + taxes + serviceFees);

            // 3. Generate confirmation code
            const confirmationCode = `RES${Date.now().toString().slice(-6)}`;

            // 4. Create reservation
            const reservationRepository = queryRunner.manager.getRepository(Reservation);

            // Determine stay type enum
            let reservationStayType = ReservationStayType.DAILY;
            if (stayType === 'weekly') reservationStayType = ReservationStayType.WEEKLY;
            if (stayType === 'monthly') reservationStayType = ReservationStayType.MONTHLY;
            if (stayType === 'longstay') reservationStayType = ReservationStayType.LONG_STAY;

            const reservation = reservationRepository.create({
                // uuid is auto-generated
                guestId: guest.id,
                unitId: unit.id,
                propertyId: unit.roomType?.propertyId || unit.propertyId || 0, // Ensure not null if required
                confirmationCode,
                reservationNumber: confirmationCode,
                checkIn: checkIn,
                checkOut: checkOut,
                stayType: reservationStayType,
                adults: guests,
                children: 0,
                status: ReservationStatus.CONFIRMED,
                channel: 'booking_engine',
                totalAmount: total,
                baseRate: pricePerNight,
                specialRequests: guestInfo.observations || null,
                paymentStatus: paymentStatus === 'paid' ? 'paid' : 'pending',
                currency: 'BRL',
                nights: nights,
                paymentMethod: paymentMethod,
                discount: discount,
                paidAmount: paymentStatus === 'paid' ? total : 0,
                balance: paymentStatus === 'paid' ? 0 : total,
                paymentNotes:
                    paymentStatus === 'paid'
                        ? `Pagamento PIX confirmado pelo hóspede.${pixGatewayProvider ? ` Provedor: ${pixGatewayProvider}.` : ''}${pixGatewayTxid ? ` TXID: ${pixGatewayTxid}.` : ''}`
                        : null
            });

            await reservationRepository.save(reservation);

            // 5. Generate QR Code
            const qrCodeData = `RESERVATION:${confirmationCode}`;
            const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

            // 6. Update guest stats
            guest.totalStays = (guest.totalStays || 0) + 1;
            guest.totalSpent = (Number(guest.totalSpent) || 0) + total;
            await guestRepository.save(guest);

            await queryRunner.commitTransaction();

            // Disparar evento para workflows (EventBus centralizado)
            try {
                const { EventBus } = await import('@/events/EventBus');
                EventBus.emit('reservation.created', {
                    reservation: {
                        id: reservation.id,
                        confirmationCode: reservation.confirmationCode,
                        reservationNumber: reservation.reservationNumber,
                        checkIn: reservation.checkIn,
                        checkOut: reservation.checkOut,
                        status: reservation.status,
                        channel: reservation.channel,
                        totalAmount: reservation.totalAmount,
                        nights: reservation.nights,
                        guestId: reservation.guestId,
                        propertyId: reservation.propertyId,
                        unitId: reservation.unitId,
                        externalId: reservation.externalId,
                    },
                    guest: {
                        id: guest.id,
                        email: guest.email,
                        firstName: guest.firstName,
                        lastName: guest.lastName,
                        phone: guest.phone,
                        totalStays: guest.totalStays,
                        tier: guest.tier,
                    },
                    channel: reservation.channel,
                    totalStays: guest.totalStays,
                    tier: guest.tier,
                    propertyId: reservation.propertyId || null,
                });
            } catch (workflowErr) {
                console.error('Error emitting reservation.created event:', workflowErr);
            }

            return {
                reservation: {
                    id: reservation.id,
                    confirmationCode: reservation.confirmationCode,
                    status: reservation.status,
                    checkIn: reservation.checkIn,
                    checkOut: reservation.checkOut,
                    guests: reservation.adults + reservation.children,
                    nights,
                    subtotal,
                    taxes,
                    serviceFees,
                    total,
                    discount,
                    qrCode: qrCodeUrl,
                    unitName: unit.roomType?.name || unit.name || 'Unidade',
                    guestName: `${guest.firstName} ${guest.lastName}`,
                    guestEmail: guest.email,
                    guestCredentials: isNewGuest ? {
                        email: guest.email,
                        password: generatedPassword
                    } : null,
                    appliedPromotion: appliedPromoDetails
                }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Get rate plans
     */
    static async getRatePlans() {
        const ratePlanRepository = AppDataSource.getRepository(RatePlan);

        const ratePlans = await ratePlanRepository.find({
            where: { deletedAt: IsNull() },
            order: { name: 'ASC' }
        });

        return ratePlans;
    }
}
