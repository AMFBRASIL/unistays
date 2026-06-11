import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { IsNull } from 'typeorm';
import { Reservation, ReservationStatus } from '@/entities/Reservation.entity';
import { ReservationItem, ReservationItemType } from '@/entities/ReservationItem.entity';
import { Guest } from '@/entities/Guest.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '@/services/EmailService';

export class ReservationController {
  private formatDateBR(value?: Date | string | null): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR');
  }

  private applyContractVariables(template: string, reservation: Reservation): string {
    const guestFullName = reservation.guest
      ? [reservation.guest.firstName, reservation.guest.lastName].filter(Boolean).join(' ').trim()
      : '';
    const paidAmount = Number(reservation.paidAmount || 0);
    const totalAmount = Number(reservation.totalAmount || 0);
    const unit = reservation.unit;
    const roomTypeName = unit?.roomType?.name?.trim() || '';
    const unitNumber = unit?.number?.trim() || '';
    const quartoNome =
      [roomTypeName, unitNumber ? `Unidade ${unitNumber}` : ''].filter(Boolean).join(' — ') ||
      roomTypeName ||
      unitNumber ||
      '';
    const money = (n: number) =>
      Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const variables: Record<string, string> = {
      hotel_nome: reservation.property?.name || 'Unistays',
      hotel_nome_fantasia: reservation.property?.name || 'Unistays',
      hospede_nome: guestFullName || reservation.guest?.name || '',
      hospede_documento: reservation.guest?.documentNumber || '',
      hospede_rg: '',
      hospede_endereco: reservation.guest?.address || '',
      hospede_telefone: reservation.guest?.phone || '',
      hospede_email: reservation.guest?.email || '',
      hospede_nacionalidade: reservation.guest?.nationality || '',
      hospede_cidade: reservation.guest?.city || '',
      hospede_estado: reservation.guest?.state || '',
      contratada_nome: reservation.property?.name || 'Unistays',
      contratada_documento: reservation.property?.taxId || '',
      imovel_endereco: reservation.property?.address || '',
      propriedade_telefone: reservation.property?.phone || '',
      propriedade_email: reservation.property?.email || '',
      propriedade_website: reservation.property?.website || '',
      propriedade_cep: reservation.property?.zipCode || '',
      propriedade_bairro: reservation.property?.neighborhood || '',
      reserva_codigo: reservation.reservationNumber || '',
      confirmacao_codigo: reservation.confirmationCode || '',
      checkin_data: this.formatDateBR(reservation.checkIn),
      checkout_data: this.formatDateBR(reservation.checkOut),
      checkin_hora: reservation.checkInTime || '14:00',
      checkout_hora: reservation.checkOutTime || '12:00',
      noites: String(reservation.nights ?? ''),
      status_reserva: reservation.status || '',
      hospedes_quantidade: String((reservation.adults || 0) + (reservation.children || 0)),
      hospedes_adultos: String(reservation.adults || 0),
      hospedes_criancas: String(reservation.children || 0),
      quarto_nome: quartoNome,
      tipo_quarto: roomTypeName,
      unidade_numero: unitNumber,
      unidade_andar: unit?.floor != null ? String(unit.floor) : '',
      unidade_capacidade: unit?.capacity != null ? String(unit.capacity) : '',
      plano_tarifa: reservation.ratePlan?.name || '',
      valor_total: money(totalAmount),
      valor_diaria: money(Number(reservation.baseRate || 0)),
      valor_desconto: money(Number(reservation.discount || 0)),
      valor_taxas: money(Number(reservation.taxes || 0)),
      valor_taxas_servico: money(Number(reservation.fees || 0)),
      valor_sinal: money(Number(reservation.depositAmount || 0)),
      valor_saldo: money(Math.max(0, totalAmount - paidAmount)),
      forma_pagamento: reservation.paymentMethod || '',
      /** Caução: quando não houver campo específico, reutiliza depósito/sinal cadastrado na reserva */
      valor_caucao: money(Number(reservation.depositAmount || 0)),
      observacoes_reserva: reservation.specialRequests || '',
      politica_pets: reservation.petDetails ? `Permitido. ${reservation.petDetails}` : 'Nao permitir animais de estimacao, salvo autorizacao previa por escrito.',
      cancelamento_prazo_dias: '7',
      cancelamento_percentual_reembolso: '70',
      cancelamento_percentual_multa: '50',
      caucao_prazo_devolucao_dias: '5',
      foro_cidade_uf: reservation.property?.city && reservation.property?.state
        ? `${reservation.property.city}/${reservation.property.state}`
        : 'Cidade/UF',
      cidade_assinatura: reservation.property?.city || 'Cidade',
      data_assinatura: this.formatDateBR(new Date()),
      testemunha1_nome: '',
      testemunha1_documento: '',
      testemunha2_nome: '',
      testemunha2_documento: '',
    };

    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
      return variables[key] ?? '';
    });
  }

  /**
   * Emite eventos financeiros para workflows (valor pago e comissão).
   * Os workflows criam as transações automaticamente.
   */
  private async emitFinancialEvents(reservation: Reservation, amountPaid: number, amountCommission: number, userId?: number): Promise<void> {
    try {
      const { EventBus } = await import('@/events/EventBus');
      const payload = {
        reservation: {
          id: reservation.id,
          reservationNumber: reservation.reservationNumber,
          nights: reservation.nights,
          totalAmount: reservation.totalAmount,
          checkIn: reservation.checkIn,
          depositDueDate: reservation.depositDueDate,
          stayType: reservation.stayType,
          currency: reservation.currency,
          agencyName: reservation.agencyName,
          propertyId: reservation.propertyId,
        },
        propertyId: reservation.propertyId ?? null,
        userId,
      };

      if (amountPaid > 0) {
        EventBus.emit('financial.reservation_payment', { ...payload, amount: amountPaid });
      }
      if (amountCommission > 0) {
        EventBus.emit('financial.reservation_commission', { ...payload, amount: amountCommission });
      }
    } catch (err) {
      console.error('[ReservationController] Erro ao emitir eventos financeiros:', err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, unitId, status, startDate, endDate, search, isActiveNow } = req.query;
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const queryBuilder = reservationRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.property', 'property')
        .leftJoinAndSelect('reservation.unit', 'unit')
        .leftJoinAndSelect('unit.roomType', 'roomType')
        .leftJoinAndSelect('reservation.guest', 'guest')
        .leftJoinAndSelect('reservation.ratePlan', 'ratePlan')
        .leftJoinAndSelect('reservation.accompanyingGuests', 'accompanyingGuests')
        .where('reservation.deletedAt IS NULL');

      if (propertyId) {
        queryBuilder.andWhere('reservation.propertyId = :propertyId', { propertyId: parseInt(propertyId as string) });
      }

      if (unitId) {
        queryBuilder.andWhere('reservation.unitId = :unitId', { unitId: parseInt(unitId as string) });
      }

      if (status && status !== 'all') {
        const statusList = (status as string).split(',').map(s => s.trim());
        if (statusList.length > 1) {
          queryBuilder.andWhere('reservation.status IN (:...statusList)', { statusList });
        } else {
          queryBuilder.andWhere('reservation.status = :status', { status });
        }
      }

      if (startDate) {
        queryBuilder.andWhere('reservation.checkIn >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('reservation.checkOut <= :endDate', { endDate });
      }

      if (isActiveNow === 'true') {
        const today = new Date().toISOString().split('T')[0];
        queryBuilder.andWhere('DATE(reservation.checkIn) <= :today AND DATE(reservation.checkOut) >= :today', { today });
      }

      if (search) {
        queryBuilder.andWhere('(reservation.reservationNumber LIKE :search OR guest.name LIKE :search)', { search: `%${search}%` });
      }

      const reservations = await queryBuilder
        .orderBy('reservation.createdAt', 'DESC')
        .getMany();

      console.log('Reservations API:', {
        count: reservations.length,
        status,
        isActiveNow,
        unitIds: reservations.map(r => r.unitId)
      });

      res.json({
        success: true,
        data: { reservations },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna IDs das unidades ocupadas no período (checkIn–checkOut).
   * Usado pelo modal Nova Reserva para não permitir selecionar unidade já reservada.
   */
  async getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { checkIn, checkOut } = req.query as { checkIn?: string; checkOut?: string };
      if (!checkIn || !checkOut) {
        res.status(400).json({ success: false, error: { message: 'checkIn e checkOut são obrigatórios (YYYY-MM-DD)' } });
        return;
      }
      const reservationRepository = AppDataSource.getRepository(Reservation);
      const raw = await reservationRepository
        .createQueryBuilder('reservation')
        .select('DISTINCT reservation.unitId', 'unitId')
        .where('reservation.deletedAt IS NULL')
        .andWhere('reservation.unitId IS NOT NULL')
        .andWhere('reservation.status NOT IN (:...excluded)', {
          excluded: [ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW],
        })
        .andWhere('DATE(reservation.checkIn) <= :checkOut', { checkOut })
        .andWhere('DATE(reservation.checkOut) >= :checkIn', { checkIn })
        .getRawMany<{ unitId: number }>();
      const occupiedUnitIds = raw.map((r) => Number(r.unitId)).filter((id) => !Number.isNaN(id));
      res.json({
        success: true,
        data: { occupiedUnitIds },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const reservation = await reservationRepository.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
        relations: ['property', 'unit', 'unit.roomType', 'guest', 'ratePlan', 'creator', 'items', 'accompanyingGuests'],
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      res.json({
        success: true,
        data: { reservation },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservationRepository = AppDataSource.getRepository(Reservation);

      // Gerar número de reserva único
      const reservationNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Map fields (exclude items – saved separately with unitPrice/totalPrice)
      const { bookingChannel, items: rawItems, ...rest } = req.body;
      const dataToSave = {
        ...rest,
        channel: req.body.channel || bookingChannel || req.body.bookingSource,
        depositDueDate: req.body.depositDueDate === "" ? null : req.body.depositDueDate,
        paymentId: req.body.paymentId || null,
        operatorName: req.body.operatorName || null,
        channelId: req.body.channelId || null,
      };

      const reservation = (reservationRepository.create({
        ...dataToSave,
        reservationNumber,
        createdBy: req.userId,
        status: req.body.status || ReservationStatus.PENDING,
      } as any) as unknown) as Reservation;

      // Comissionamento / Agência: garantir mapeamento explícito
      reservation.isAgency = req.body.isAgency === true;
      reservation.agencyName = req.body.agencyName && String(req.body.agencyName).trim() ? String(req.body.agencyName).trim() : null;
      reservation.agencyContact = req.body.agencyContact && String(req.body.agencyContact).trim() ? String(req.body.agencyContact).trim() : null;
      reservation.agencyEmail = req.body.agencyEmail && String(req.body.agencyEmail).trim() ? String(req.body.agencyEmail).trim() : null;
      if (req.body.agencyCommission != null && req.body.agencyCommission !== '') {
        const commission = Number(req.body.agencyCommission);
        reservation.agencyCommission = !Number.isNaN(commission) ? commission : null;
      } else {
        reservation.agencyCommission = null;
      }
      if (req.body.commissionAmount != null && req.body.commissionAmount !== '') {
        const commissionAmount = Number(req.body.commissionAmount);
        reservation.commissionAmount = !Number.isNaN(commissionAmount) ? commissionAmount : null;
      } else {
        reservation.commissionAmount = null;
      }
      reservation.externalId = req.body.externalId && String(req.body.externalId).trim() ? String(req.body.externalId).trim() : null;
      reservation.voucherNumber = req.body.voucherNumber && String(req.body.voucherNumber).trim() ? String(req.body.voucherNumber).trim() : null;
      reservation.agencyNotes = req.body.agencyNotes && String(req.body.agencyNotes).trim() ? String(req.body.agencyNotes).trim() : null;

      if (req.body.accompanyingGuests && Array.isArray(req.body.accompanyingGuests)) {
        reservation.accompanyingGuests = req.body.accompanyingGuests.map((g: any) => ({ id: g.id } as any));
      }

      await reservationRepository.save(reservation);

      // Save reservation items with unit_price/total_price (accept price+quantity or unitPrice+totalPrice)
      if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
        const itemRepository = AppDataSource.getRepository(ReservationItem);
        for (const it of rawItems) {
          const qty = Number(it.quantity ?? 1);
          const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
          const totalPrice = Number(it.totalPrice ?? unitPrice * qty);
          const item = itemRepository.create({
            reservationId: reservation.id,
            name: it.name || 'Extra',
            quantity: qty,
            unitPrice,
            totalPrice,
            type: (it.type as ReservationItemType) || ReservationItemType.EXTRA,
          });
          await itemRepository.save(item);
        }
      }

      // Emitir eventos financeiros para workflows (valor pago e comissão)
      const paidAmount = Number(reservation.paidAmount) || 0;
      const commissionAmount = Number(reservation.commissionAmount) || 0;
      await this.emitFinancialEvents(reservation, paidAmount, commissionAmount, req.userId);

      // Link items if present (already handled by cascade but let's be sure or just rely on cascade)
      // Update Guest Data if provided
      if (reservation.guestId) {
        const guestRepo = AppDataSource.getRepository(Guest);
        const guestData: any = {};

        if (req.body.guestOccupation) guestData.occupation = req.body.guestOccupation;
        if (req.body.guestCompany) guestData.companyName = req.body.guestCompany;
        if (req.body.guestNotes) guestData.notes = req.body.guestNotes;
        if (req.body.guestBirthdate) guestData.birthDate = req.body.guestBirthdate;
        if (req.body.guestAddress) guestData.address = req.body.guestAddress;
        if (req.body.guestCity) guestData.city = req.body.guestCity;
        if (req.body.guestState) guestData.state = req.body.guestState;
        if (req.body.guestZipCode) guestData.zipCode = req.body.guestZipCode;
        if (req.body.guestCountry) guestData.country = req.body.guestCountry;

        // Handle Name Split if provided
        if (req.body.guestName) {
          const parts = req.body.guestName.trim().split(' ');
          if (parts.length > 0) {
            guestData.firstName = parts[0];
            if (parts.length > 1) guestData.lastName = parts.slice(1).join(' ');
          }
        }

        if (Object.keys(guestData).length > 0) {
          await guestRepo.update(reservation.guestId, guestData);
        }
      }

      // Disparar evento para workflows (EventBus centralizado)
      if (reservation.guestId) {
        try {
          const { EventBus } = await import('@/events/EventBus');
          const guestRepo = AppDataSource.getRepository(Guest);
          const guest = await guestRepo.findOne({ where: { id: reservation.guestId } });
          if (guest) {
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
              propertyId: reservation.propertyId ?? null,
            });
          }
        } catch (importErr) {
          console.error('[ReservationController.create] EventBus import error:', importErr);
        }
      }

      res.status(201).json({
        success: true,
        data: { reservation },
        message: 'Reserva criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const reservation = await reservationRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      const previousStatus = reservation.status;

      // Map fields
      const { bookingChannel, ...rest } = req.body;
      const dataToUpdate = {
        ...rest,
        depositDueDate: req.body.depositDueDate === "" ? null : req.body.depositDueDate,
        channel: req.body.channel || bookingChannel || req.body.bookingSource,
      };
      if (bookingChannel && !dataToUpdate.channel) {
        dataToUpdate.channel = bookingChannel;
      }

      Object.assign(reservation, dataToUpdate);
      if (req.body.paymentId) reservation.paymentId = req.body.paymentId;
      if (req.body.operatorName) reservation.operatorName = req.body.operatorName;
      if (req.body.channelId) reservation.channelId = req.body.channelId;

      // Comissionamento / Agência: garantir mapeamento explícito no update
      if (typeof req.body.isAgency === 'boolean') reservation.isAgency = req.body.isAgency;
      if (req.body.agencyName !== undefined) reservation.agencyName = req.body.agencyName && String(req.body.agencyName).trim() ? String(req.body.agencyName).trim() : null;
      if (req.body.agencyContact !== undefined) reservation.agencyContact = req.body.agencyContact && String(req.body.agencyContact).trim() ? String(req.body.agencyContact).trim() : null;
      if (req.body.agencyEmail !== undefined) reservation.agencyEmail = req.body.agencyEmail && String(req.body.agencyEmail).trim() ? String(req.body.agencyEmail).trim() : null;
      if (req.body.agencyCommission !== undefined) {
        if (req.body.agencyCommission != null && req.body.agencyCommission !== '') {
          const commission = Number(req.body.agencyCommission);
          reservation.agencyCommission = !Number.isNaN(commission) ? commission : null;
        } else {
          reservation.agencyCommission = null;
        }
      }
      if (req.body.commissionAmount !== undefined) {
        if (req.body.commissionAmount != null && req.body.commissionAmount !== '') {
          const commissionAmount = Number(req.body.commissionAmount);
          reservation.commissionAmount = !Number.isNaN(commissionAmount) ? commissionAmount : null;
        } else {
          reservation.commissionAmount = null;
        }
      }
      if (req.body.externalId !== undefined) reservation.externalId = req.body.externalId && String(req.body.externalId).trim() ? String(req.body.externalId).trim() : null;
      if (req.body.voucherNumber !== undefined) reservation.voucherNumber = req.body.voucherNumber && String(req.body.voucherNumber).trim() ? String(req.body.voucherNumber).trim() : null;
      if (req.body.agencyNotes !== undefined) reservation.agencyNotes = req.body.agencyNotes && String(req.body.agencyNotes).trim() ? String(req.body.agencyNotes).trim() : null;

      if (req.body.accompanyingGuests && Array.isArray(req.body.accompanyingGuests)) {
        reservation.accompanyingGuests = req.body.accompanyingGuests.map((g: any) => ({ id: g.id }));
      }

      await reservationRepository.save(reservation);

      // Emitir eventos financeiros (deltas) quando paidAmount ou commissionAmount aumentam
      const paidAmount = Number(reservation.paidAmount) || 0;
      const commissionAmount = Number(reservation.commissionAmount) || 0;
      if (paidAmount > 0 || commissionAmount > 0) {
        const { Transaction, TransactionType } = await import('@/entities/Transaction.entity');
        const txRepo = AppDataSource.getRepository(Transaction);
        const existingIncomes = await txRepo.find({ where: { reservationId: reservation.id, type: TransactionType.INCOME } });
        const { FinancialCategory } = await import('@/entities/FinancialCategory.entity');
        const fcRepo = AppDataSource.getRepository(FinancialCategory);
        const comissaoCat = await fcRepo.findOne({ where: { type: 'expense' as any, name: 'Comissão', deletedAt: IsNull() } });
        const existingExpenses = comissaoCat
          ? await txRepo.find({ where: { reservationId: reservation.id, type: TransactionType.EXPENSE, financialCategoryId: comissaoCat.id } })
          : [];
        const sumIncome = existingIncomes.reduce((s, t) => s + Number(t.amount), 0);
        const sumExpense = existingExpenses.reduce((s, t) => s + Number(t.amount), 0);
        const deltaIncome = Math.max(0, paidAmount - sumIncome);
        const deltaExpense = Math.max(0, commissionAmount - sumExpense);
        if (deltaIncome > 0 || deltaExpense > 0) {
          await this.emitFinancialEvents(reservation, deltaIncome, deltaExpense, req.userId);
        }
      }

      // Disparar evento para workflows quando o status muda para cancelled (EventBus centralizado)
      const isNowCancelled = reservation.status === ReservationStatus.CANCELLED;
      const wasNotCancelledBefore = previousStatus !== ReservationStatus.CANCELLED;
      if (isNowCancelled && wasNotCancelledBefore && reservation.guestId) {
        try {
          const { EventBus } = await import('@/events/EventBus');
          const guestRepo = AppDataSource.getRepository(Guest);
          const guest = await guestRepo.findOne({ where: { id: reservation.guestId } });
          if (guest) {
            EventBus.emit('reservation.cancelled', {
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
              propertyId: reservation.propertyId ?? null,
            });
          }
        } catch (importErr) {
          console.error('[ReservationController.update] EventBus import error:', importErr);
        }
      }

      // Update Guest Data Side-Effect
      if (reservation.guestId) {
        const guestRepo = AppDataSource.getRepository(Guest);
        const guestData: any = {};

        if (req.body.guestOccupation) guestData.occupation = req.body.guestOccupation;
        if (req.body.guestCompany) guestData.companyName = req.body.guestCompany;
        if (req.body.guestNotes) guestData.notes = req.body.guestNotes;
        if (req.body.guestBirthdate) guestData.birthDate = req.body.guestBirthdate;
        if (req.body.guestAddress) guestData.address = req.body.guestAddress;
        if (req.body.guestCity) guestData.city = req.body.guestCity;
        if (req.body.guestState) guestData.state = req.body.guestState;
        if (req.body.guestZipCode) guestData.zipCode = req.body.guestZipCode;
        if (req.body.guestCountry) guestData.country = req.body.guestCountry;
        if (req.body.guestPhone) guestData.phone = req.body.guestPhone;
        if (req.body.guestEmail) guestData.email = req.body.guestEmail;
        if (req.body.guestCPF) {
          guestData.documentNumber = req.body.guestCPF;
        }

        if (req.body.guestName) {
          const parts = req.body.guestName.trim().split(' ');
          if (parts.length > 0) {
            guestData.firstName = parts[0];
            if (parts.length > 1) guestData.lastName = parts.slice(1).join(' ');
          }
        }

        if (Object.keys(guestData).length > 0) {
          await guestRepo.update(reservation.guestId, guestData);
        }
      }

      res.json({
        success: true,
        data: { reservation },
        message: 'Reserva atualizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const reservation = await reservationRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      await reservationRepository.softRemove(reservation);

      res.json({
        success: true,
        message: 'Reserva deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const reservation = await reservationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['guest'],
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      reservation.status = ReservationStatus.CHECKED_IN;
      await reservationRepository.save(reservation);

      // Disparar evento para workflows (EventBus centralizado)
      if (reservation.guestId && reservation.guest) {
        try {
          const { EventBus } = await import('@/events/EventBus');
          const g = reservation.guest;
          EventBus.emit('reservation.checkin', {
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
            },
            guest: {
              id: g.id,
              email: g.email,
              firstName: g.firstName,
              lastName: g.lastName,
              phone: g.phone,
              totalStays: g.totalStays,
              tier: g.tier,
            },
            channel: reservation.channel,
            totalStays: g.totalStays,
            tier: g.tier,
            propertyId: reservation.propertyId ?? null,
          });
        } catch (importErr) {
          console.error('[ReservationController.checkIn] EventBus import error:', importErr);
        }
      }

      res.json({
        success: true,
        data: { reservation },
        message: 'Check-in realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const reservation = await reservationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['guest'],
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      reservation.status = ReservationStatus.CHECKED_OUT;
      await reservationRepository.save(reservation);

      // Disparar evento para workflows (EventBus centralizado)
      if (reservation.guestId && reservation.guest) {
        try {
          const { EventBus } = await import('@/events/EventBus');
          const g = reservation.guest;
          EventBus.emit('reservation.checkout', {
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
            },
            guest: {
              id: g.id,
              email: g.email,
              firstName: g.firstName,
              lastName: g.lastName,
              phone: g.phone,
              totalStays: g.totalStays,
              tier: g.tier,
            },
            channel: reservation.channel,
            totalStays: g.totalStays,
            tier: g.tier,
            propertyId: reservation.propertyId ?? null,
          });
        } catch (importErr) {
          console.error('[ReservationController.checkOut] EventBus import error:', importErr);
        }
      }

      res.json({
        success: true,
        data: { reservation },
        message: 'Check-out realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera HTML do contrato de reserva com variáveis preenchidas.
   */
  async getContractHtml(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        throw new AppError('ID de reserva inválido', 400);
      }

      const reservationRepository = AppDataSource.getRepository(Reservation);
      const reservation = await reservationRepository.findOne({
        where: { id, deletedAt: IsNull() },
        relations: ['property', 'unit', 'unit.roomType', 'guest', 'ratePlan'],
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      const rows = await AppDataSource.query(
        `SELECT content
         FROM contract_templates
         WHERE module_key = 'reservations'
           AND is_active = 1
           AND status IN ('active', 'draft')
         ORDER BY (status = 'active') DESC, version_no DESC, updated_at DESC
         LIMIT 1`
      );

      if (!rows || rows.length === 0) {
        throw new AppError('Nenhum template de contrato de reservas encontrado.', 404);
      }

      const template = rows[0].content as string;
      const html = this.applyContractVariables(template, reservation);

      res.json({
        success: true,
        data: {
          reservationId: reservation.id,
          reservationNumber: reservation.reservationNumber,
          html,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envia os detalhes da reserva por e-mail (usa configuração SMTP/API ativa)
   */
  async sendDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const channels = req.body?.channels ?? {};
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const reservation = await reservationRepository.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
        relations: ['property', 'unit', 'unit.roomType', 'guest', 'ratePlan'],
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      const sent = { email: false, whatsapp: false };

      if (channels.email) {
        const guestEmail = reservation.guest?.email?.trim();
        if (!guestEmail) {
          throw new AppError('O hóspede desta reserva não possui e-mail cadastrado.', 400);
        }
        const companyInfo = await EmailService.getCompanyInfo(reservation.propertyId);
        const companyName = companyInfo.name || reservation.property?.name || undefined;
        const { html, text } = EmailService.getReservationDetailsEmailContent(
          reservation as any,
          companyName
        );
        const subject = `Detalhes da sua reserva ${reservation.reservationNumber} - ${reservation.property?.name || 'Unistays'}`;
        await EmailService.sendEmail(
          guestEmail,
          subject,
          html,
          text,
          reservation.propertyId
        );
        sent.email = true;
      }

      // WhatsApp: por enquanto apenas indicar sucesso se selecionado (sem envio real)
      if (channels.whatsapp) {
        sent.whatsapp = true;
      }

      res.json({
        success: true,
        message: sent.email
          ? 'Detalhes da reserva enviados por e-mail com sucesso.'
          : sent.whatsapp
            ? 'Canais processados.'
            : 'Nenhum canal selecionado.',
        data: { sent },
      });
    } catch (error) {
      next(error);
    }
  }
}
