import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Guest } from '../entities/Guest.entity';
import { Reservation } from '../entities/Reservation.entity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

const JWT_SECRET = env.JWT_SECRET;

export class GuestAuthController {
    // Register new guest account
    async register(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, phone, documentNumber, password } = req.body;

            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Nome, sobrenome, e-mail e senha são obrigatórios' }
                });
            }

            if (String(password).length < 6) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'A senha deve ter pelo menos 6 caracteres' }
                });
            }

            const guestRepository = AppDataSource.getRepository(Guest);
            const normalizedEmail = String(email).trim().toLowerCase();

            const existingGuest = await guestRepository
                .createQueryBuilder('guest')
                .where('LOWER(guest.email) = :email', { email: normalizedEmail })
                .getOne();

            if (existingGuest) {
                return res.status(409).json({
                    success: false,
                    error: { message: 'Já existe uma conta com este e-mail' }
                });
            }

            const hashedPassword = await bcrypt.hash(String(password), 10);
            const guest = guestRepository.create({
                firstName: String(firstName).trim(),
                lastName: String(lastName).trim(),
                email: normalizedEmail,
                phone: phone ? String(phone).trim() : null,
                documentType: documentNumber ? 'cpf' : null,
                documentNumber: documentNumber ? String(documentNumber).replace(/\D/g, '') : null,
                password: hashedPassword,
                nationality: 'Brasil',
                country: 'Brasil',
                marketingConsent: false,
                marketingEmail: true,
                marketingSms: false,
                marketingWhatsapp: false,
            });

            const savedGuest = await guestRepository.save(guest);

            const token = jwt.sign(
                { guestId: savedGuest.id, type: 'guest' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                success: true,
                data: {
                    token,
                    guest: {
                        id: savedGuest.id,
                        firstName: savedGuest.firstName,
                        lastName: savedGuest.lastName,
                        name: savedGuest.name,
                        email: savedGuest.email,
                        phone: savedGuest.phone,
                        documentNumber: savedGuest.documentNumber,
                        nationality: savedGuest.nationality,
                        tier: savedGuest.tier,
                        loyaltyPoints: savedGuest.loyaltyPoints,
                        totalStays: savedGuest.totalStays,
                        memberSince: savedGuest.createdAt,
                        preferences: savedGuest.preferences,
                        reservationId: null
                    }
                }
            });
        } catch (error) {
            console.error('Guest register error:', error);
            return res.status(500).json({
                success: false,
                error: { message: 'Erro ao criar conta' }
            });
        }
    }

    // Login with email and password
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Email e senha são obrigatórios' }
                });
            }

            const guestRepository = AppDataSource.getRepository(Guest);

            // Need to use QueryBuilder to load password field (it's excluded by default)
            const guest = await guestRepository
                .createQueryBuilder('guest')
                .where('guest.email = :email', { email })
                .addSelect('guest.password')
                .leftJoinAndSelect('guest.reservations', 'reservations')
                .getOne();

            if (!guest) {
                return res.status(401).json({
                    success: false,
                    error: { message: 'Email ou senha incorretos' }
                });
            }

            // Check if guest has a password set
            if (!guest.password) {
                return res.status(401).json({
                    success: false,
                    error: { message: 'Conta sem senha configurada. Use o código de reserva para acessar.' }
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, guest.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: { message: 'Email ou senha incorretos' }
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { guestId: guest.id, type: 'guest' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                data: {
                    token,
                    guest: {
                        id: guest.id,
                        firstName: guest.firstName,
                        lastName: guest.lastName,
                        name: guest.name,
                        email: guest.email,
                        phone: guest.phone,
                        avatar: guest.avatar,
                        documentNumber: guest.documentNumber,
                        nationality: guest.nationality,
                        tier: guest.tier,
                        loyaltyPoints: guest.loyaltyPoints,
                        totalStays: guest.totalStays,
                        memberSince: guest.createdAt,
                        preferences: guest.preferences,
                        reservationId: guest.reservations?.[0]?.id
                    }
                }
            });
        } catch (error) {
            console.error('Guest login error:', error);
            return res.status(500).json({
                success: false,
                error: { message: 'Erro ao fazer login' }
            });
        }
    }

    // Login with reservation code
    async loginWithReservation(req: Request, res: Response) {
        try {
            const { reservationCode, lastName, checkInDate } = req.body;

            if (!reservationCode || !lastName || !checkInDate) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Todos os campos são obrigatórios' }
                });
            }

            const reservationRepository = AppDataSource.getRepository(Reservation);
            const code = String(reservationCode).trim();
            const reservation = await reservationRepository
                .createQueryBuilder('r')
                .leftJoinAndSelect('r.guest', 'guest')
                .where('(r.confirmationCode = :code OR r.reservationNumber = :code)', { code })
                .getOne();

            if (!reservation || !reservation.guest) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Reserva não encontrada' }
                });
            }

            // Verify last name (case insensitive) — usa coluna last_name do hóspede
            const expectedLast = (reservation.guest.lastName || '').toLowerCase().trim();
            const providedLast = String(lastName).toLowerCase().trim();
            if (!expectedLast || expectedLast !== providedLast) {
                return res.status(401).json({
                    success: false,
                    error: { message: 'Dados da reserva não conferem' }
                });
            }

            // Verify check-in date
            const reservationCheckIn = new Date(reservation.checkIn).toISOString().split('T')[0];
            if (reservationCheckIn !== checkInDate) {
                return res.status(401).json({
                    success: false,
                    error: { message: 'Data de check-in não confere' }
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { guestId: reservation.guest.id, type: 'guest' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                data: {
                    token,
                    guest: {
                        id: reservation.guest.id,
                        firstName: reservation.guest.firstName,
                        lastName: reservation.guest.lastName,
                        name: reservation.guest.name,
                        email: reservation.guest.email,
                        phone: reservation.guest.phone,
                        avatar: reservation.guest.avatar,
                        documentNumber: reservation.guest.documentNumber,
                        nationality: reservation.guest.nationality,
                        tier: reservation.guest.tier,
                        loyaltyPoints: reservation.guest.loyaltyPoints,
                        totalStays: reservation.guest.totalStays,
                        memberSince: reservation.guest.createdAt,
                        preferences: reservation.guest.preferences,
                        reservationId: reservation.id
                    }
                }
            });
        } catch (error) {
            console.error('Guest reservation login error:', error);
            return res.status(500).json({
                success: false,
                error: { message: 'Erro ao buscar reserva' }
            });
        }
    }

    // Get guest profile
    async getProfile(req: Request, res: Response) {
        try {
            const guestId = (req as any).guestId; // From auth middleware

            const guestRepository = AppDataSource.getRepository(Guest);
            const guest = await guestRepository.findOne({
                where: { id: guestId },
                relations: ['reservations', 'reservations.unit', 'reservations.unit.property']
            });

            if (!guest) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Hóspede não encontrado' }
                });
            }

            return res.json({
                success: true,
                data: {
                    guest: {
                        id: guest.id,
                        name: guest.name,
                        email: guest.email,
                        phone: guest.phone,
                        cpf: guest.cpf,
                        avatar: guest.avatar,
                        reservations: guest.reservations
                    }
                }
            });
        } catch (error) {
            console.error('Get guest profile error:', error);
            return res.status(500).json({
                success: false,
                error: { message: 'Erro ao buscar perfil' }
            });
        }
    }
}
