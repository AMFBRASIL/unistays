import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Guest, GuestTier } from '@/entities/Guest.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateGuestInput, UpdateGuestInput, AddLoyaltyPointsInput } from '@/validators/guest.validator';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { IsNull, In } from 'typeorm';
import { env } from '@/config/env';
import { GuestAuthRequest } from '@/middlewares/guestAuth.middleware';
import { Reservation, ReservationStatus } from '@/entities/Reservation.entity';
import { ServiceRequest } from '@/entities/ServiceRequest.entity';
import { GuestPasswordResetToken } from '@/entities/GuestPasswordResetToken.entity';
import { EmailService } from '@/services/EmailService';
import { logger } from '@/utils/logger';
import { StorageService } from '@/services/StorageService';
import { GuestWebCheckinPixService } from '@/services/GuestWebCheckinPixService';

interface GuestResponse {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  documentType: string | null;
  documentNumber: string | null;
  nationality: string | null;
  birthDate: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  avatar: string | null;
  tier: string;
  loyaltyPoints: number;
  totalStays: number;
  totalSpent: number;
  preferences: string[] | null;
  tags: string[] | null;
  notes: string | null;
  marketingConsent: boolean;
  type: 'physical' | 'legal';
  whatsapp: string | null;
  companyName: string | null;
  tradeName: string | null;
  stateRegistration: string | null;
  cnpj: string | null;
  contactName: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  memberSince: string | null;
  marketingEmail: boolean;
  marketingSms: boolean;
  marketingWhatsapp: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  createdAt: Date;
  updatedAt: Date;
  occupation: string | null;
}

/** QueryRunner type for raw SQL (from TypeORM) */
type QueryRunner = { query: (sql: string, params?: any[]) => Promise<any>; connect?: () => Promise<void>; release?: () => Promise<void> };

export class GuestController {
  /**
   * Insere um registro no histórico de pontos de fidelidade.
   * Se a tabela guest_loyalty_points_history não existir, falha em silêncio (log).
   */
  private static async insertLoyaltyHistory(
    queryRunner: QueryRunner,
    guestId: number,
    operation: 'credit' | 'debit',
    points: number,
    balanceAfter: number,
    source: string,
    description: string | null,
    referenceType: string | null,
    referenceId: string | null,
    createdBy: number | null
  ): Promise<void> {
    try {
      const uuid = uuidv4();
      await queryRunner.query(
        `INSERT INTO guest_loyalty_points_history (uuid, guest_id, operation, points, balance_after, source, description, reference_type, reference_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuid, guestId, operation, points, balanceAfter, source, description ?? null, referenceType ?? null, referenceId ?? null, createdBy ?? null]
      );
    } catch (err) {
      console.warn('[GuestController.insertLoyaltyHistory] Tabela guest_loyalty_points_history pode não existir. Execute a migration:', err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const guestRepository = AppDataSource.getRepository(Guest);

      // Select password explicitly as it is hidden by default
      const guest = await guestRepository.createQueryBuilder('guest')
        .addSelect('guest.password')
        .where('guest.email = :email', { email })
        .getOne();

      if (!guest) {
        throw new AppError('Credenciais inválidas', 401);
      }
      if (!guest.password) {
        throw new AppError(
          'Esta conta ainda não tem senha no portal. Na tela de login, use "Criar senha" para receber um link por e-mail, ou entre pela aba "Reserva".',
          403
        );
      }

      const isPasswordValid = await bcrypt.compare(password, guest.password);
      if (!isPasswordValid) {
        throw new AppError('Credenciais inválidas', 401);
      }

      const token = jwt.sign(
        { guestId: guest.id, type: 'guest' },
        env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Remove password from response
      delete (guest as any).password;

      let preferences = null;
      if (guest.preferences) {
        try {
          preferences = typeof guest.preferences === 'string' ? JSON.parse(guest.preferences) : guest.preferences;
        } catch (error) {
          preferences = null;
        }
      }

      let tags = null;
      if (guest.tags) {
        try {
          tags = typeof guest.tags === 'string' ? JSON.parse(guest.tags) : guest.tags;
        } catch (error) {
          tags = null;
        }
      }

      const responseGuest = {
        ...guest,
        preferences,
        tags,
        totalSpent: guest.totalSpent ? Number(guest.totalSpent) : 0,
        marketingConsent: Boolean(guest.marketingConsent),
        marketingEmail: Boolean(guest.marketingEmail),
        marketingSms: Boolean(guest.marketingSms),
        marketingWhatsapp: Boolean(guest.marketingWhatsapp),
      };

      res.json({
        success: true,
        data: {
          token,
          guest: responseGuest
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /guests/login/request-password-email (público)
   * Envia e-mail com link contendo token para criar/redefinir senha do portal.
   */
  requestGuestPasswordResetEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const genericMessage =
      'Se este e-mail estiver cadastrado, você receberá em instantes um link para criar ou redefinir sua senha. Verifique também a caixa de spam.';

    try {
      const email = String(req.body?.email ?? '')
        .trim()
        .toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError('Informe um e-mail válido.', 400);
      }

      const guestRepo = AppDataSource.getRepository(Guest);
      const guest = await guestRepo
        .createQueryBuilder('guest')
        .where('LOWER(TRIM(guest.email)) = :email', { email })
        .getOne();

      if (!guest) {
        res.json({ success: true, data: { message: genericMessage } });
        return;
      }

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      const tokenRepo = AppDataSource.getRepository(GuestPasswordResetToken);
      await tokenRepo
        .createQueryBuilder()
        .update(GuestPasswordResetToken)
        .set({ usedAt: new Date() })
        .where('guest_id = :gid', { gid: guest.id })
        .andWhere('used_at IS NULL')
        .execute();

      const row = tokenRepo.create({
        tokenHash,
        guestId: guest.id,
        expiresAt,
        usedAt: null,
      });
      await tokenRepo.save(row);

      const resetUrl = `${env.FRONTEND_PUBLIC_URL}/guest-portal/reset-password?token=${encodeURIComponent(rawToken)}`;
      const companyInfo = await EmailService.getCompanyInfo(null);
      const brand = companyInfo.name || 'Uni Stays';
      const firstName = guest.firstName ? ` ${guest.firstName}` : '';

      const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h1 style="font-size: 20px; color: #1e293b;">Olá${firstName},</h1>
          <p style="color: #334155; line-height: 1.6;">
            Você solicitou criar ou redefinir a senha do <strong>portal do hóspede</strong> (${brand}).
          </p>
          <p style="color: #334155; line-height: 1.6;">
            Clique no botão abaixo. O link expira em <strong>1 hora</strong>.
          </p>
          <p style="margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              Definir senha
            </a>
          </p>
          <p style="color: #64748b; font-size: 13px; word-break: break-all;">
            Se o botão não funcionar, copie e cole este endereço no navegador:<br/>
            ${resetUrl}
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
            Se você não solicitou este e-mail, ignore esta mensagem.
          </p>
        </div>
      `.trim();

      try {
        await EmailService.sendEmail(
          guest.email!,
          `${brand} — Senha do portal do hóspede`,
          html,
          `Defina sua senha do portal (válido por 1 hora): ${resetUrl}`,
          null
        );
      } catch (sendErr: unknown) {
        logger.error(
          `[GuestController] Falha ao enviar e-mail de redefinição de senha (guest ${guest.id}): ${sendErr instanceof Error ? sendErr.message : String(sendErr)}`
        );
      }

      res.json({ success: true, data: { message: genericMessage } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /guests/login/reset-password-with-token (público)
   */
  resetGuestPasswordWithToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      if (!token || !newPassword) {
        throw new AppError('Token e nova senha são obrigatórios.', 400);
      }
      if (String(newPassword).length < 6) {
        throw new AppError('A senha deve ter no mínimo 6 caracteres.', 400);
      }
      if (confirmPassword != null && confirmPassword !== '' && confirmPassword !== newPassword) {
        throw new AppError('As senhas não conferem.', 400);
      }

      const tokenHash = createHash('sha256').update(String(token).trim(), 'utf8').digest('hex');
      const tokenRepo = AppDataSource.getRepository(GuestPasswordResetToken);
      const row = await tokenRepo.findOne({
        where: { tokenHash, usedAt: IsNull() },
      });

      if (!row) {
        throw new AppError('Link inválido ou já utilizado. Solicite um novo e-mail na tela de login.', 400);
      }
      const expires = row.expiresAt instanceof Date ? row.expiresAt : new Date(row.expiresAt);
      if (expires.getTime() < Date.now()) {
        throw new AppError('Este link expirou. Solicite um novo e-mail na tela de login.', 400);
      }

      const hashed = await bcrypt.hash(String(newPassword), 10);
      await AppDataSource.createQueryBuilder()
        .update(Guest)
        .set({ password: hashed })
        .where('id = :id', { id: row.guestId })
        .execute();

      row.usedAt = new Date();
      await tokenRepo.save(row);

      res.json({
        success: true,
        data: {
          message: 'Senha definida com sucesso. Faça login com seu e-mail e a nova senha.',
        },
      });
    } catch (error) {
      next(error);
    }
  };

  async me(req: GuestAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.guestId) {
        throw new AppError('Não autenticado', 401);
      }

      const guestRepository = AppDataSource.getRepository(Guest);
      const guest = await guestRepository.findOne({
        where: { id: req.guestId }
      });

      if (!guest) {
        throw new AppError('Hóspede não encontrado', 404);
      }

      // Compute details (similar to getById parsing logic could be reused, but for now simple return)
      // We might want to include active reservations here too
      // Let's populate minimal data for now and parse JSONs

      let preferences = null;
      if (guest.preferences) {
        try {
          preferences = typeof guest.preferences === 'string' ? JSON.parse(guest.preferences) : guest.preferences;
        } catch (error) {
          preferences = null;
        }
      }

      let tags = null;
      if (guest.tags) {
        try {
          tags = typeof guest.tags === 'string' ? JSON.parse(guest.tags) : guest.tags;
        } catch (error) {
          tags = null;
        }
      }

      const response = {
        ...guest,
        preferences,
        tags,
        totalSpent: guest.totalSpent ? Number(guest.totalSpent) : 0,
        marketingConsent: Boolean(guest.marketingConsent),
        marketingEmail: Boolean(guest.marketingEmail),
        marketingSms: Boolean(guest.marketingSms),
        marketingWhatsapp: Boolean(guest.marketingWhatsapp),
      };

      res.json({
        success: true,
        data: {
          guest: response
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /** PUT /guests/me — atualização limitada pelo próprio hóspede */
  updateMe = async (req: GuestAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.guestId) {
        throw new AppError('Não autenticado', 401);
      }
      const guestRepository = AppDataSource.getRepository(Guest);
      const guest = await guestRepository.findOne({ where: { id: req.guestId } });
      if (!guest) {
        throw new AppError('Hóspede não encontrado', 404);
      }

      const { firstName, lastName, phone, documentNumber, nationality } = req.body || {};

      if (firstName !== undefined && firstName !== null && String(firstName).trim()) {
        guest.firstName = String(firstName).trim().slice(0, 255);
      }
      if (lastName !== undefined && lastName !== null && String(lastName).trim()) {
        guest.lastName = String(lastName).trim().slice(0, 255);
      }
      if (phone !== undefined) {
        guest.phone = phone ? String(phone).trim().slice(0, 20) : null;
      }
      if (documentNumber !== undefined) {
        guest.documentNumber = documentNumber ? String(documentNumber).trim().slice(0, 50) : null;
      }
      if (nationality !== undefined) {
        guest.nationality = nationality ? String(nationality).trim().slice(0, 100) : null;
      }

      await guestRepository.save(guest);

      let preferences: unknown = null;
      if (guest.preferences) {
        try {
          preferences = typeof guest.preferences === 'string' ? JSON.parse(guest.preferences) : guest.preferences;
        } catch {
          preferences = guest.preferences;
        }
      }
      let tags: unknown = null;
      if (guest.tags) {
        try {
          tags = typeof guest.tags === 'string' ? JSON.parse(guest.tags) : guest.tags;
        } catch {
          tags = guest.tags;
        }
      }

      const response = {
        ...guest,
        preferences,
        tags,
        totalSpent: guest.totalSpent ? Number(guest.totalSpent) : 0,
        marketingConsent: Boolean(guest.marketingConsent),
        marketingEmail: Boolean(guest.marketingEmail),
        marketingSms: Boolean(guest.marketingSms),
        marketingWhatsapp: Boolean(guest.marketingWhatsapp),
      };

      res.json({ success: true, data: { guest: response } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /guests/me/web-checkin/pix?reservationId=
   * Retorna BR Code + QR (PNG data URL) para saldo pendente, ou configured:false.
   */
  getWebCheckinPix = async (req: GuestAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.guestId) {
        throw new AppError('Não autenticado', 401);
      }
      const reservationId = Number(req.query.reservationId);
      if (!reservationId || Number.isNaN(reservationId)) {
        throw new AppError('Parâmetro reservationId é obrigatório', 400);
      }
      const data = await GuestWebCheckinPixService.getPixForReservation(Number(req.guestId), reservationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /guests/me/web-checkin/upload — documento, selfie ou contrato assinado (multer field: image).
   * Usa StorageService (storage_config: local, S3, R2, etc.).
   * Query: kind=document|selfie|signed_contract, reservationId (opcional, valida titularidade).
   */
  uploadWebCheckinImage = async (req: GuestAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.guestId) {
        throw new AppError('Não autenticado', 401);
      }
      if (!req.file) {
        throw new AppError('Nenhum arquivo enviado', 400);
      }

      const kind = String(req.query.kind || '').toLowerCase();
      if (kind !== 'document' && kind !== 'selfie' && kind !== 'signed_contract') {
        throw new AppError('Use ?kind=document, ?kind=selfie ou ?kind=signed_contract', 400);
      }

      let reservationId = 0;
      if (req.query.reservationId !== undefined && req.query.reservationId !== '') {
        reservationId = Number(req.query.reservationId);
        if (!reservationId || Number.isNaN(reservationId)) {
          throw new AppError('reservationId inválido', 400);
        }
        const reservationRepository = AppDataSource.getRepository(Reservation);
        const reservation = await reservationRepository.findOne({
          where: { id: reservationId, guestId: Number(req.guestId) },
        });
        if (!reservation) {
          throw new AppError('Reserva não encontrada', 404);
        }
      }

      const folder = `guest-web-checkin/${req.guestId}/${reservationId || 'pending'}/${kind}`;
      const result = await StorageService.uploadFile(req.file, req, folder);

      res.json({
        success: true,
        data: {
          kind,
          url: result.url,
          fullUrl: result.fullUrl,
          filename: result.filename,
          originalName: result.originalName,
          size: result.size,
        },
        message: 'Imagem enviada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  /** POST /guests/me/web-checkin — registra dados e observações na reserva (pending/confirmed) */
  submitWebCheckin = async (req: GuestAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.guestId) {
        throw new AppError('Não autenticado', 401);
      }
      const reservationId = Number(req.body?.reservationId);
      if (!reservationId || Number.isNaN(reservationId)) {
        throw new AppError('ID da reserva é obrigatório', 400);
      }

      const reservationRepository = AppDataSource.getRepository(Reservation);
      const guestRepository = AppDataSource.getRepository(Guest);

      const reservation = await reservationRepository.findOne({
        where: { id: reservationId, guestId: Number(req.guestId) },
      });

      if (!reservation) {
        throw new AppError('Reserva não encontrada', 404);
      }

      const allowed = [ReservationStatus.PENDING, ReservationStatus.CONFIRMED];
      if (!allowed.includes(reservation.status)) {
        throw new AppError('Web check-in não está disponível para o status desta reserva', 400);
      }

      const guest = await guestRepository.findOne({ where: { id: Number(req.guestId) } });
      if (!guest) {
        throw new AppError('Hóspede não encontrado', 404);
      }

      const {
        fullName,
        phone,
        documentNumber,
        email,
        specialRequests,
        documentPhotoUrl,
        selfiePhotoUrl,
        signedContractPhotoUrl,
        pixPaymentDeclared,
        pixGatewayTxid,
        pixGatewayProvider,
      } = req.body || {};

      const docUrl = documentPhotoUrl != null ? String(documentPhotoUrl).trim() : '';
      const selfUrl = selfiePhotoUrl != null ? String(selfiePhotoUrl).trim() : '';
      const contractUrl = signedContractPhotoUrl != null ? String(signedContractPhotoUrl).trim() : '';
      const isAllowedPhotoRef = (u: string): boolean => {
        if (!u || u.length > 2048) return false;
        return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/');
      };
      if (!docUrl || !selfUrl || !contractUrl) {
        throw new AppError(
          'Envie a foto do documento, a selfie e o contrato assinado (passo Documentos) antes de concluir o web check-in.',
          400
        );
      }
      if (!isAllowedPhotoRef(docUrl) || !isAllowedPhotoRef(selfUrl) || !isAllowedPhotoRef(contractUrl)) {
        throw new AppError('URLs dos arquivos inválidas. Refaça o envio.', 400);
      }

      if (fullName !== undefined && String(fullName).trim()) {
        const parts = String(fullName).trim().split(/\s+/);
        guest.firstName = parts[0] || guest.firstName;
        guest.lastName = parts.length > 1 ? parts.slice(1).join(' ') : guest.lastName || '-';
      }
      if (phone !== undefined && phone !== null) {
        guest.phone = String(phone).trim().slice(0, 20) || null;
      }
      if (documentNumber !== undefined && documentNumber !== null) {
        const d = String(documentNumber).replace(/\D/g, '').slice(0, 50);
        if (d) guest.documentNumber = d;
      }
      if (email !== undefined && email !== null && String(email).includes('@')) {
        guest.email = String(email).trim().toLowerCase().slice(0, 255);
      }

      await guestRepository.save(guest);

      const stamp = new Date().toISOString();
      let note =
        `\n\n[Portal] Web check-in ${stamp}\n` +
        `${specialRequests ? String(specialRequests).trim() : '(sem observações adicionais)'}\n` +
        `Documento (imagem): ${docUrl}\n` +
        `Selfie (imagem): ${selfUrl}\n` +
        `Contrato assinado: ${contractUrl}\n`;
      if (pixPaymentDeclared === true) {
        note +=
          '\n[Portal] Hóspede indicou pagamento via PIX no web check-in — conferir extrato / conciliação.\n';
      }
      const gwTx = pixGatewayTxid != null ? String(pixGatewayTxid).trim() : '';
      const gwPr = pixGatewayProvider != null ? String(pixGatewayProvider).trim().toLowerCase() : '';
      if (gwTx && gwPr === 'efi') {
        note += `\n[Portal] PIX Efí txid: ${gwTx.slice(0, 64)}\n`;
      }
      reservation.specialRequests = ((reservation.specialRequests || '') + note).trim();
      await reservationRepository.save(reservation);

      res.json({
        success: true,
        data: {
          message: 'Web check-in registrado com sucesso.',
          reservationId: reservation.id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getReservations = async (req: GuestAuthRequest, res: Response, next: NextFunction) => {
    try {
      const reservationRepository = AppDataSource.getRepository(Reservation);
      const reservations = await reservationRepository.find({
        where: { guestId: Number(req.guestId) },
        order: { id: 'DESC' },
        relations: ['unit', 'unit.roomType', 'unit.property', 'property', 'items'],
      });

      const mappedReservations = reservations.map((res) => {
        const extrasTotal =
          res.items?.reduce((sum, it) => sum + Number(it.totalPrice || 0), 0) ?? 0;
        const services = res.items?.map((it) => it.name) ?? [];
        const webCheckInCompleted = (res.specialRequests || '').includes('[Portal] Web check-in');
        return {
          id: res.id,
          checkIn: res.checkIn,
          checkOut: res.checkOut,
          nights: res.nights,
          reservationNumber: res.reservationNumber,
          confirmationCode: res.confirmationCode,
          propertyName: res.property?.name || res.unit?.property?.name || null,
          room: res.unit?.name || res.unit?.roomType?.name || 'Quarto não atribuído',
          roomType: res.unit?.roomType?.name || 'Standard',
          unitNumber: res.unit?.number,
          roomNumber: res.unit?.number,
          floor: res.unit?.floor ?? 0,
          status: res.status,
          total: res.totalAmount ? Number(res.totalAmount) : 0,
          paid: res.paidAmount ? Number(res.paidAmount) : 0,
          balance: res.balance != null ? Number(res.balance) : Math.max(0, Number(res.totalAmount || 0) - Number(res.paidAmount || 0)),
          baseRate: res.baseRate ? Number(res.baseRate) : 0,
          taxes: res.taxes ? Number(res.taxes) : 0,
          fees: res.fees ? Number(res.fees) : 0,
          discount: res.discount ? Number(res.discount) : 0,
          guests: (res.adults || 0) + (res.children || 0) + (res.infants || 0),
          adults: res.adults,
          children: res.children,
          services,
          extrasTotal,
          items:
            res.items?.map((it) => ({
              name: it.name,
              totalPrice: Number(it.totalPrice || 0),
              quantity: it.quantity,
              type: it.type,
            })) ?? [],
          webCheckInCompleted,
        };
      });

      res.json({
        success: true,
        data: {
          reservations: mappedReservations
        }
      });
    } catch (error) {
      next(error);
    }
  }

  getServiceRequests = async (req: GuestAuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = (req as any).query;
      const serviceRequestRepository = AppDataSource.getRepository(ServiceRequest);

      const where: any = { guestId: Number(req.guestId) };
      if (status) {
        where.status = status;
      }

      const requests = await serviceRequestRepository.find({
        where,
        order: { createdAt: 'DESC' },
        relations: ['reservation', 'reservation.unit']
      });

      const categoryLabel: Record<string, string> = {
        housekeeping: 'Limpeza / Camareira',
        maintenance: 'Manutenção',
        roomservice: 'Room Service',
        concierge: 'Concierge',
        transport: 'Transporte',
        other: 'Outro',
      };

      const mappedRequests = requests.map((req) => ({
        id: req.id,
        uuid: req.uuid,
        type: categoryLabel[req.category] || (req.category ? String(req.category) : 'Solicitação'),
        category: req.category,
        description: req.description,
        status: req.status,
        priority: req.priority,
        createdAt: req.createdAt.toISOString().replace('T', ' ').substring(0, 16),
        staffNotes: req.staffNotes,
        reservationInfo: req.reservation ? `Quarto ${req.reservation.unit?.number || 'N/A'}` : null
      }));

      res.json({
        success: true,
        data: {
          requests: mappedRequests
        }
      });
    } catch (error) {
      next(error);
    }
  }

  createServiceRequest = async (req: GuestAuthRequest, res: Response, next: NextFunction) => {
    try {
      const { category, description, priority, type } = req.body;
      const serviceRequestRepository = AppDataSource.getRepository(ServiceRequest);
      const reservationRepository = AppDataSource.getRepository(Reservation);

      const contextReservation = await reservationRepository.findOne({
        where: {
          guestId: Number(req.guestId),
          status: In([ReservationStatus.CHECKED_IN, ReservationStatus.CONFIRMED, ReservationStatus.PENDING] as any),
        },
        order: { checkIn: 'DESC' },
      });

      const newRequest = serviceRequestRepository.create({
        uuid: uuidv4(),
        guestId: Number(req.guestId),
        reservationId: contextReservation?.id || null,
        category,
        description, // In a real app we might combine type + description
        status: 'pending' as any,
        priority: priority || 'normal'
      });

      await serviceRequestRepository.save(newRequest);

      res.status(201).json({
        success: true,
        data: {
          request: newRequest
        },
        message: 'Solicitação criada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, tier, page, limit: limitParam, city, nationality, sort } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      // Paginação
      const currentPage = Math.max(1, parseInt(page as string) || 1);
      const perPage = Math.min(100, Math.max(1, parseInt(limitParam as string) || 6));
      const offset = (currentPage - 1) * perPage;

      let whereClause = `WHERE deleted_at IS NULL`;
      const params: any[] = [];

      if (search) {
        whereClause += ` AND (
          first_name LIKE ? OR 
          last_name LIKE ? OR 
          email LIKE ? OR 
          document_number LIKE ? OR
          phone LIKE ? OR
          CONCAT(first_name, ' ', last_name) LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      if (tier) {
        whereClause += ` AND tier = ?`;
        params.push(tier);
      }
      if (city) {
        whereClause += ` AND city LIKE ?`;
        params.push(`%${city}%`);
      }
      if (nationality) {
        whereClause += ` AND nationality LIKE ?`;
        params.push(`%${nationality}%`);
      }

      // Contar total de registros (para paginação)
      const countQuery = `SELECT COUNT(*) as total FROM guests ${whereClause}`;
      const countResult = await queryRunner.query(countQuery, [...params]);
      const totalItems = parseInt(countResult[0]?.total || '0');
      const totalPages = Math.ceil(totalItems / perPage);

      // Ordenação
      let orderBy = 'created_at DESC'; // padrão: mais recentes
      if (sort === 'name_asc') orderBy = 'first_name ASC, last_name ASC';
      else if (sort === 'name_desc') orderBy = 'first_name DESC, last_name DESC';
      else if (sort === 'stays_desc') orderBy = 'total_stays DESC';
      else if (sort === 'spent_desc') orderBy = 'total_spent DESC';
      else if (sort === 'oldest') orderBy = 'created_at ASC';

      let query = `
        SELECT 
          id,
          uuid,
          first_name as firstName,
          last_name as lastName,
          email,
          phone,
          document_type as documentType,
          document_number as documentNumber,
          nationality,
          birth_date as birthDate,
          gender,
          address,
          city,
          state,
          zip_code as zipCode,
          country,
          avatar,
          tier,
          loyalty_points as loyaltyPoints,
          total_stays as totalStays,
          total_spent as totalSpent,
          preferences,
          tags,
          notes,
          marketing_consent as marketingConsent,
          type,
          whatsapp,
          company_name as companyName,
          trade_name as tradeName,
          state_registration as stateRegistration,
          cnpj,
          contact_name as contactName,
          address_number as addressNumber,
          address_complement as addressComplement,
          address_neighborhood as addressNeighborhood,
          occupation,
          member_since as memberSince,
          marketing_email as marketingEmail,
          marketing_sms as marketingSms,
          marketing_whatsapp as marketingWhatsapp,
          emergency_contact_name as emergencyContactName,
          emergency_contact_phone as emergencyContactPhone,
          emergency_contact_relation as emergencyContactRelation,
          created_at as createdAt,
          updated_at as updatedAt
        FROM guests
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;

      const guests = await queryRunner.query(query, [...params, perPage, offset]);
      await queryRunner.release();

      // Mapear resultados
      const guestsResponse: GuestResponse[] = guests.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        documentType: row.documentType,
        documentNumber: row.documentNumber,
        nationality: row.nationality,
        birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : null,
        gender: row.gender,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
        country: row.country,
        avatar: row.avatar,
        tier: row.tier,
        loyaltyPoints: row.loyaltyPoints,
        totalStays: row.totalStays,
        totalSpent: row.totalSpent ? Number(row.totalSpent) : 0,
        preferences: row.preferences ? (typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences) : null,
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : null,
        notes: row.notes,
        marketingConsent: Boolean(row.marketingConsent),
        type: row.type,
        whatsapp: row.whatsapp,
        companyName: row.companyName,
        tradeName: row.tradeName,
        stateRegistration: row.stateRegistration,
        cnpj: row.cnpj,
        contactName: row.contactName,
        addressNumber: row.addressNumber,
        addressComplement: row.addressComplement,
        addressNeighborhood: row.addressNeighborhood,
        occupation: row.occupation,
        memberSince: row.memberSince ? new Date(row.memberSince).toISOString().split('T')[0] : null,
        marketingEmail: Boolean(row.marketingEmail),
        marketingSms: Boolean(row.marketingSms),
        marketingWhatsapp: Boolean(row.marketingWhatsapp),
        emergencyContactName: row.emergencyContactName,
        emergencyContactPhone: row.emergencyContactPhone,
        emergencyContactRelation: row.emergencyContactRelation,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: {
          guests: guestsResponse,
          pagination: {
            page: currentPage,
            perPage,
            totalItems,
            totalPages,
          },
        },
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
            first_name as firstName,
            last_name as lastName,
            email,
            phone,
            document_type as documentType,
            document_number as documentNumber,
            nationality,
            birth_date as birthDate,
            gender,
            address,
            city,
            state,
            zip_code as zipCode,
            country,
            avatar,
            tier,
            loyalty_points as loyaltyPoints,
            total_stays as totalStays,
            total_spent as totalSpent,
            preferences,
            tags,
            notes,
            marketing_consent as marketingConsent,
            type,
            whatsapp,
            company_name as companyName,
            trade_name as tradeName,
            state_registration as stateRegistration,
            cnpj,
            contact_name as contactName,
            address_number as addressNumber,
            address_complement as addressComplement,
            address_neighborhood as addressNeighborhood,
            occupation,
            member_since as memberSince,
            marketing_email as marketingEmail,
            marketing_sms as marketingSms,
            marketing_whatsapp as marketingWhatsapp,
            emergency_contact_name as emergencyContactName,
            emergency_contact_phone as emergencyContactPhone,
            emergency_contact_relation as emergencyContactRelation,
            created_at as createdAt,
            updated_at as updatedAt
          FROM guests
          WHERE id = ? AND deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Hóspede não encontrado', 404);
        }

        const row = results[0];

        // Parse JSON fields
        let preferences = null;
        if (row.preferences) {
          try {
            preferences = typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences;
          } catch (error) {
            preferences = null;
          }
        }

        let tags = null;
        if (row.tags) {
          try {
            tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
          } catch (error) {
            tags = null;
          }
        }

        res.json({
          success: true,
          data: {
            guest: {
              id: row.id,
              uuid: row.uuid,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              phone: row.phone,
              documentType: row.documentType,
              documentNumber: row.documentNumber,
              nationality: row.nationality,
              birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : null,
              gender: row.gender,
              address: row.address,
              city: row.city,
              state: row.state,
              zipCode: row.zipCode,
              country: row.country,
              avatar: row.avatar,
              tier: row.tier,
              loyaltyPoints: row.loyaltyPoints,
              totalStays: row.totalStays,
              totalSpent: row.totalSpent ? Number(row.totalSpent) : 0,
              preferences,
              tags,
              notes: row.notes,
              marketingConsent: Boolean(row.marketingConsent),
              type: row.type,
              whatsapp: row.whatsapp,
              companyName: row.companyName,
              tradeName: row.tradeName,
              stateRegistration: row.stateRegistration,
              cnpj: row.cnpj,
              contactName: row.contactName,
              addressNumber: row.addressNumber,
              addressComplement: row.addressComplement,
              addressNeighborhood: row.addressNeighborhood,
              occupation: row.occupation,
              memberSince: row.memberSince ? new Date(row.memberSince).toISOString().split('T')[0] : null,
              marketingEmail: Boolean(row.marketingEmail),
              marketingSms: Boolean(row.marketingSms),
              marketingWhatsapp: Boolean(row.marketingWhatsapp),
              emergencyContactName: row.emergencyContactName,
              emergencyContactPhone: row.emergencyContactPhone,
              emergencyContactRelation: row.emergencyContactRelation,
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
      const data: CreateGuestInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const uuid = uuidv4();
        const preferencesJson = data.preferences ? JSON.stringify(data.preferences) : null;
        const tagsJson = data.tags ? JSON.stringify(data.tags) : null;

        // Converter birthDate de string para Date
        let birthDateValue = null;
        if (data.birthDate) {
          birthDateValue = new Date(data.birthDate);
        }

        let memberSinceValue = null;
        if (data.memberSince) {
          memberSinceValue = new Date(data.memberSince);
        }

        // Hash password if provided
        let hashedPassword = null;
        if (data.password) {
          console.log('[GuestController.create] Hashing password for guest:', data.email);
          hashedPassword = await bcrypt.hash(data.password, 10);
          console.log('[GuestController.create] Password hashed successfully');
        } else {
          console.log('[GuestController.create] No password provided for guest:', data.email);
        }

        const insertQuery = `
          INSERT INTO guests (
            uuid, first_name, last_name, email, phone, document_type, document_number,
            nationality, birth_date, gender, address, city, state, zip_code, country, avatar,
            tier, loyalty_points, preferences, tags, notes, marketing_consent,
            type, whatsapp, company_name, trade_name, state_registration, cnpj,
            contact_name, address_number, address_complement, address_neighborhood,
            member_since, marketing_email, marketing_sms, marketing_whatsapp,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            occupation, password,
            created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            NOW(), NOW()
          )
        `;

        const insertParams: any[] = [
          uuid,
          data.firstName,
          data.lastName,
          data.email || null,
          data.phone || null,
          data.documentType || null,
          data.documentNumber || null,
          data.nationality || null,
          birthDateValue,
          data.gender || null,
          data.address || null,
          data.city || null,
          data.state || null,
          data.zipCode || null,
          data.country || null,
          data.avatar || null,
          data.tier || 'bronze',
          data.loyaltyPoints || 0,
          preferencesJson,
          tagsJson,
          data.notes || null,
          data.marketingConsent || false,
          data.type || 'physical',
          data.whatsapp || null,
          data.companyName || null,
          data.tradeName || null,
          data.stateRegistration || null,
          data.cnpj || null,
          data.contactName || null,
          data.addressNumber || null,
          data.addressComplement || null,
          data.addressNeighborhood || null,
          memberSinceValue,
          data.marketingEmail !== undefined ? data.marketingEmail : true,
          data.marketingSms !== undefined ? data.marketingSms : true,
          data.marketingWhatsapp !== undefined ? data.marketingWhatsapp : true,
          data.emergencyContactName || null,
          data.emergencyContactPhone || null,
          data.emergencyContactRelation || null,
          data.occupation || null,
          hashedPassword,
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const guestId = result.insertId;

        await queryRunner.commitTransaction();

        // Histórico de pontos de fidelidade (se pontos iniciais > 0)
        if ((data.loyaltyPoints || 0) > 0) {
          await GuestController.insertLoyaltyHistory(
            queryRunner,
            guestId,
            'credit',
            data.loyaltyPoints!,
            data.loyaltyPoints!,
            'registration',
            'Cadastro novo',
            null,
            null,
            (req as AuthRequest).user?.id ?? null
          );
        }

        // Disparar evento para workflows (EventBus centralizado)
        try {
          const { EventBus } = await import('@/events/EventBus');
          const guestPayload = {
            id: guestId,
            totalStays: 0,
            ...data,
            propertyId: null,
          };
          EventBus.emit('guest.created', guestPayload);
        } catch (importError) {
          console.error('[GuestController.create] Erro ao importar EventBus:', importError);
        }

        // Buscar o hóspede criado
        const selectQuery = `
          SELECT 
            id,
            uuid,
            first_name as firstName,
            last_name as lastName,
            email,
            phone,
            document_type as documentType,
            document_number as documentNumber,
            nationality,
            birth_date as birthDate,
            gender,
            address,
            city,
            state,
            zip_code as zipCode,
            country,
            avatar,
            tier,
            loyalty_points as loyaltyPoints,
            total_stays as totalStays,
            total_spent as totalSpent,
            preferences,
            tags,
            notes,
            marketing_consent as marketingConsent,
            type,
            whatsapp,
            company_name as companyName,
            trade_name as tradeName,
            state_registration as stateRegistration,
            cnpj,
            contact_name as contactName,
            address_number as addressNumber,
            address_complement as addressComplement,
            address_neighborhood as addressNeighborhood,
            member_since as memberSince,
            marketing_email as marketingEmail,
            marketing_sms as marketingSms,
            marketing_whatsapp as marketingWhatsapp,
            emergency_contact_name as emergencyContactName,
            emergency_contact_phone as emergencyContactPhone,
            emergency_contact_relation as emergencyContactRelation,
            occupation,
            created_at as createdAt,
            updated_at as updatedAt
          FROM guests
          WHERE id = ? AND deleted_at IS NULL
        `;

        const guests = await queryRunner.query(selectQuery, [guestId]);

        if (guests.length === 0) {
          throw new AppError('Erro ao criar hóspede', 500);
        }

        const row = guests[0];

        res.status(201).json({
          success: true,
          data: {
            guest: {
              id: row.id,
              uuid: row.uuid,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              phone: row.phone,
              documentType: row.documentType,
              documentNumber: row.documentNumber,
              nationality: row.nationality,
              birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : null,
              gender: row.gender,
              address: row.address,
              city: row.city,
              state: row.state,
              zipCode: row.zipCode,
              country: row.country,
              avatar: row.avatar,
              tier: row.tier,
              loyaltyPoints: row.loyaltyPoints,
              totalStays: row.totalStays,
              totalSpent: row.totalSpent ? Number(row.totalSpent) : 0,
              preferences: row.preferences ? (typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences) : null,
              tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : null,
              notes: row.notes,
              marketingConsent: Boolean(row.marketingConsent),
              type: row.type,
              whatsapp: row.whatsapp,
              companyName: row.companyName,
              tradeName: row.tradeName,
              stateRegistration: row.stateRegistration,
              cnpj: row.cnpj,
              contactName: row.contactName,
              addressNumber: row.addressNumber,
              addressComplement: row.addressComplement,
              addressNeighborhood: row.addressNeighborhood,
              memberSince: row.memberSince ? new Date(row.memberSince).toISOString().split('T')[0] : null,
              marketingEmail: Boolean(row.marketingEmail),
              marketingSms: Boolean(row.marketingSms),
              marketingWhatsapp: Boolean(row.marketingWhatsapp),
              emergencyContactName: row.emergencyContactName,
              emergencyContactPhone: row.emergencyContactPhone,
              emergencyContactRelation: row.emergencyContactRelation,
              occupation: row.occupation,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          },
          message: 'Hóspede criado com sucesso',
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
      const data: UpdateGuestInput = req.body;
      const guestRepository = AppDataSource.getRepository(Guest);

      const guest = await guestRepository.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!guest) {
        throw new AppError('Hóspede não encontrado', 404);
      }

      const oldLoyaltyPoints = guest.loyaltyPoints;

      // Atualizar campos
      if (data.firstName !== undefined) guest.firstName = data.firstName;
      if (data.lastName !== undefined) guest.lastName = data.lastName;
      if (data.email !== undefined) guest.email = data.email;
      if (data.phone !== undefined) guest.phone = data.phone;
      if (data.documentType !== undefined) guest.documentType = data.documentType as any;
      if (data.documentNumber !== undefined) guest.documentNumber = data.documentNumber;
      if (data.nationality !== undefined) guest.nationality = data.nationality;
      if (data.birthDate !== undefined) guest.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      if (data.gender !== undefined) guest.gender = data.gender as any;
      if (data.address !== undefined) guest.address = data.address;
      if (data.city !== undefined) guest.city = data.city;
      if (data.state !== undefined) guest.state = data.state;
      if (data.zipCode !== undefined) guest.zipCode = data.zipCode;
      if (data.country !== undefined) guest.country = data.country;
      if (data.avatar !== undefined) guest.avatar = data.avatar;
      if (data.tier !== undefined) guest.tier = data.tier as GuestTier;
      if (data.loyaltyPoints !== undefined) guest.loyaltyPoints = data.loyaltyPoints;
      if (data.preferences !== undefined) guest.preferences = data.preferences;
      if (data.tags !== undefined) guest.tags = data.tags;
      if (data.notes !== undefined) guest.notes = data.notes;
      if (data.marketingConsent !== undefined) guest.marketingConsent = data.marketingConsent;
      if (data.type !== undefined) guest.type = data.type as any;
      if (data.whatsapp !== undefined) guest.whatsapp = data.whatsapp;
      if (data.companyName !== undefined) guest.companyName = data.companyName;
      if (data.tradeName !== undefined) guest.tradeName = data.tradeName;
      if (data.stateRegistration !== undefined) guest.stateRegistration = data.stateRegistration;
      if (data.cnpj !== undefined) guest.cnpj = data.cnpj;
      if (data.contactName !== undefined) guest.contactName = data.contactName;
      if (data.addressNumber !== undefined) guest.addressNumber = data.addressNumber;
      if (data.addressComplement !== undefined) guest.addressComplement = data.addressComplement;
      if (data.addressNeighborhood !== undefined) guest.addressNeighborhood = data.addressNeighborhood;
      if (data.occupation !== undefined) guest.occupation = data.occupation;
      if (data.memberSince !== undefined) guest.memberSince = data.memberSince ? new Date(data.memberSince) : null;
      if (data.marketingEmail !== undefined) guest.marketingEmail = data.marketingEmail;
      if (data.marketingSms !== undefined) guest.marketingSms = data.marketingSms;
      if (data.marketingWhatsapp !== undefined) guest.marketingWhatsapp = data.marketingWhatsapp;
      if (data.emergencyContactName !== undefined) guest.emergencyContactName = data.emergencyContactName;
      if (data.emergencyContactPhone !== undefined) guest.emergencyContactPhone = data.emergencyContactPhone;
      if (data.emergencyContactRelation !== undefined) guest.emergencyContactRelation = data.emergencyContactRelation;

      // Hash password if provided
      if (data.password !== undefined && data.password !== null && data.password !== '') {
        console.log('[GuestController.update] Hashing password for guest ID:', id);
        guest.password = await bcrypt.hash(data.password, 10);
        console.log('[GuestController.update] Password hashed successfully');
      } else {
        console.log('[GuestController.update] No password update for guest ID:', id);
      }

      // Histórico de pontos: se loyaltyPoints foi alterado, registrar movimentação
      if (data.loyaltyPoints !== undefined && data.loyaltyPoints !== oldLoyaltyPoints) {
        const delta = data.loyaltyPoints - oldLoyaltyPoints;
        const operation: 'credit' | 'debit' = delta > 0 ? 'credit' : 'debit';
        const points = Math.abs(delta);
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
          await GuestController.insertLoyaltyHistory(
            queryRunner,
            guest.id,
            operation,
            points,
            data.loyaltyPoints,
            'adjustment',
            'Alteração no cadastro',
            null,
            null,
            (req as AuthRequest).user?.id ?? null
          );
        } finally {
          await queryRunner.release();
        }
      }

      await guestRepository.save(guest);

      // Buscar dados atualizados usando SQL raw
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        const query = `
          SELECT 
            id,
            uuid,
            first_name as firstName,
            last_name as lastName,
            email,
            phone,
            document_type as documentType,
            document_number as documentNumber,
            nationality,
            birth_date as birthDate,
            gender,
            address,
            city,
            state,
            zip_code as zipCode,
            country,
            avatar,
            tier,
            loyalty_points as loyaltyPoints,
            total_stays as totalStays,
            total_spent as totalSpent,
            preferences,
            tags,
            notes,
            marketing_consent as marketingConsent,
            type,
            whatsapp,
            company_name as companyName,
            trade_name as tradeName,
            state_registration as stateRegistration,
            cnpj,
            contact_name as contactName,
            address_number as addressNumber,
            address_complement as addressComplement,
            address_neighborhood as addressNeighborhood,
            occupation,
            member_since as memberSince,
            marketing_email as marketingEmail,
            marketing_sms as marketingSms,
            marketing_whatsapp as marketingWhatsapp,
            emergency_contact_name as emergencyContactName,
            emergency_contact_phone as emergencyContactPhone,
            emergency_contact_relation as emergencyContactRelation,
            created_at as createdAt,
            updated_at as updatedAt
          FROM guests
          WHERE id = ? AND deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [guest.id]);

        if (results.length === 0) {
          throw new AppError('Erro ao atualizar hóspede', 500);
        }

        const row = results[0];

        // Parse JSON fields
        let preferences = null;
        if (row.preferences) {
          try {
            preferences = typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences;
          } catch (error) {
            preferences = null;
          }
        }

        let tags = null;
        if (row.tags) {
          try {
            tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
          } catch (error) {
            tags = null;
          }
        }

        res.json({
          success: true,
          data: {
            guest: {
              id: row.id,
              uuid: row.uuid,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              phone: row.phone,
              documentType: row.documentType,
              documentNumber: row.documentNumber,
              nationality: row.nationality,
              birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : null,
              gender: row.gender,
              address: row.address,
              city: row.city,
              state: row.state,
              zipCode: row.zipCode,
              country: row.country,
              avatar: row.avatar,
              tier: row.tier,
              loyaltyPoints: row.loyaltyPoints,
              totalStays: row.totalStays,
              totalSpent: row.totalSpent ? Number(row.totalSpent) : 0,
              preferences,
              tags,
              notes: row.notes,
              marketingConsent: Boolean(row.marketingConsent),
              type: row.type,
              whatsapp: row.whatsapp,
              companyName: row.companyName,
              tradeName: row.tradeName,
              stateRegistration: row.stateRegistration,
              cnpj: row.cnpj,
              contactName: row.contactName,
              addressNumber: row.addressNumber,
              addressComplement: row.addressComplement,
              addressNeighborhood: row.addressNeighborhood,
              occupation: row.occupation,
              memberSince: row.memberSince ? new Date(row.memberSince).toISOString().split('T')[0] : null,
              marketingEmail: Boolean(row.marketingEmail),
              marketingSms: Boolean(row.marketingSms),
              marketingWhatsapp: Boolean(row.marketingWhatsapp),
              emergencyContactName: row.emergencyContactName,
              emergencyContactPhone: row.emergencyContactPhone,
              emergencyContactRelation: row.emergencyContactRelation,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          },
          message: 'Hóspede atualizado com sucesso',
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /guests/:id/loyalty-history
   * Retorna o histórico de movimentação de pontos de fidelidade do hóspede.
   */
  async getLoyaltyHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const { id } = req.params;
      const guestId = parseInt(id, 10);
      if (isNaN(guestId)) {
        throw new AppError('ID do hóspede inválido', 400);
      }

      const guestExists = await queryRunner.query(
        'SELECT id FROM guests WHERE id = ? AND deleted_at IS NULL',
        [guestId]
      );
      if (!guestExists.length) {
        throw new AppError('Hóspede não encontrado', 404);
      }

      let rows: any[] = [];
      try {
        const result = await queryRunner.query(
          `SELECT id, uuid, guest_id as guestId, operation, points, balance_after as balanceAfter,
                  source, description, reference_type as referenceType, reference_id as referenceId,
                  created_by as createdBy, created_at as createdAt
           FROM guest_loyalty_points_history
           WHERE guest_id = ?
           ORDER BY created_at DESC
           LIMIT 200`,
          [guestId]
        );
        rows = (result as any[]) || [];
      } catch (_) {
        // Tabela pode não existir ainda (migration não executada)
      }

      res.json({
        success: true,
        data: {
          history: rows.map((r: any) => ({
            id: r.id,
            uuid: r.uuid,
            guestId: r.guestId,
            operation: r.operation,
            points: r.points,
            balanceAfter: r.balanceAfter,
            source: r.source,
            description: r.description,
            referenceType: r.referenceType,
            referenceId: r.referenceId,
            createdBy: r.createdBy,
            createdAt: r.createdAt,
          })),
        },
      });
    } catch (e) {
      if (e instanceof AppError) {
        next(e);
        return;
      }
      next(e);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * POST /guests/:id/loyalty-points
   * Adiciona ou remove pontos de fidelidade (crédito/débito) com origem e descrição.
   */
  async addLoyaltyPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id } = req.params;
      const guestId = parseInt(id, 10);
      const data: AddLoyaltyPointsInput = req.body;
      if (isNaN(guestId)) {
        throw new AppError('ID do hóspede inválido', 400);
      }

      const guestRows = await queryRunner.query(
        'SELECT id, loyalty_points as loyaltyPoints FROM guests WHERE id = ? AND deleted_at IS NULL',
        [guestId]
      );
      if (!guestRows.length) {
        throw new AppError('Hóspede não encontrado', 404);
      }
      const currentPoints = Number(guestRows[0].loyaltyPoints) || 0;

      let newBalance: number;
      const points = data.points;
      const operation = data.operation;
      const source = data.source ?? 'manual';
      const description = data.description ?? (operation === 'credit' ? `Crédito de ${points} pontos` : `Débito de ${points} pontos`);

      if (operation === 'credit') {
        newBalance = currentPoints + points;
      } else {
        if (points > currentPoints) {
          throw new AppError(`Saldo insuficiente. O hóspede tem ${currentPoints} pontos.`, 400);
        }
        newBalance = currentPoints - points;
      }

      await queryRunner.query(
        'UPDATE guests SET loyalty_points = ?, updated_at = NOW() WHERE id = ?',
        [newBalance, guestId]
      );
      await GuestController.insertLoyaltyHistory(
        queryRunner,
        guestId,
        operation,
        points,
        newBalance,
        source,
        description,
        null,
        null,
        req.user?.id ?? null
      );

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        data: {
          guestId,
          operation,
          points,
          previousBalance: currentPoints,
          newBalance,
        },
        message: operation === 'credit' ? `${points} pontos adicionados.` : `${points} pontos removidos.`,
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e instanceof AppError) {
        next(e);
        return;
      }
      next(e);
    } finally {
      await queryRunner.release();
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;
      const guestId = parseInt(id, 10);

      // Verificar se hóspede existe
      const checkQuery = `SELECT id FROM guests WHERE id = ? AND deleted_at IS NULL`;
      const existing = await queryRunner.query(checkQuery, [guestId]);

      if (existing.length === 0) {
        throw new AppError('Hóspede não encontrado', 404);
      }

      // Verificar se há reservas não canceladas
      const reservationsQuery = `
        SELECT id, reservation_number, status
        FROM reservations
        WHERE guest_id = ? AND (deleted_at IS NULL)
        AND status != 'cancelled'
        LIMIT 1
      `;
      const reservations = await queryRunner.query(reservationsQuery, [guestId]);
      if ((reservations as any[]).length > 0) {
        throw new AppError(
          'Não é possível remover o hóspede pois existem reservas vinculadas (ativas ou concluídas). Cancele as reservas antes de remover o hóspede.',
          400
        );
      }

      // Verificar se há solicitações de serviço pendentes (pendências)
      try {
        const serviceRequestsQuery = `
          SELECT id FROM service_requests
          WHERE guest_id = ? AND status IN ('pending', 'in_progress')
          LIMIT 1
        `;
        const serviceRequests = await queryRunner.query(serviceRequestsQuery, [guestId]);
        if ((serviceRequests as any[]).length > 0) {
          throw new AppError(
            'Não é possível remover o hóspede pois existem solicitações de serviço pendentes. Resolva ou cancele as pendências antes de remover o hóspede.',
            400
          );
        }
      } catch (e) {
        if (e instanceof AppError) throw e;
        // Tabela service_requests pode não existir; ignorar e seguir
      }

      // Soft delete
      const deleteQuery = `UPDATE guests SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
      await queryRunner.query(deleteQuery, [guestId]);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Hóspede excluído com sucesso',
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
