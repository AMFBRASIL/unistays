import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Transaction, TransactionType, TransactionStatus } from '@/entities/Transaction.entity';
import { Reservation } from '@/entities/Reservation.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateTransactionInput, UpdateTransactionInput } from '@/validators/transaction.validator';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '@/services/StorageService';

export class TransactionController {
    async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, type, status, propertyId, startDate, endDate, categoryId } = req.query;
            const queryRunner = AppDataSource.createQueryRunner();


            let query = `
        SELECT 
          t.id,
          t.uuid,
          t.transaction_number as transactionNumber,
          t.type,
          t.financial_category_id as financialCategoryId,
          fc.name as categoryName,
          t.description,
          t.amount,
          t.currency,
          t.status,
          t.payment_method_id as paymentMethodId,
          pm.name as paymentMethodName,
          t.payment_date as paymentDate,
          t.due_date as dueDate,
          t.reservation_id as reservationId,
          t.property_id as propertyId,
          t.supplier_id as supplierId,
          t.notes,
          t.attachments,
          t.created_at as createdAt,
          t.updated_at as updatedAt,
          p.name as propertyName,
          r.channel as channel,
          s.name as supplierName,
          DATE_FORMAT(COALESCE(t.payment_date, t.due_date, t.created_at), '%d/%m/%Y') as date
        FROM transactions t
        LEFT JOIN properties p ON t.property_id = p.id
        LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
        LEFT JOIN financial_categories fc ON t.financial_category_id = fc.id AND fc.deleted_at IS NULL
        LEFT JOIN reservations r ON t.reservation_id = r.id
        LEFT JOIN suppliers s ON t.supplier_id = s.id
        WHERE t.deleted_at IS NULL
      `;

            const params: any[] = [];

            if (search) {
                query += ` AND (t.description LIKE ? OR t.transaction_number LIKE ? OR t.notes LIKE ?)`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (type) {
                query += ` AND t.type = ?`;
                params.push(type);
            }

            if (status) {
                query += ` AND t.status = ?`;
                params.push(status);
            }

            if (propertyId) {
                query += ` AND t.property_id = ?`;
                params.push(parseInt(propertyId as string));
            }

            if (categoryId) {
                query += ` AND t.financial_category_id = ?`;
                params.push(parseInt(categoryId as string));
            }

            // Incluir: pagas no período OU sempre todas as pendentes (payment_date NULL)
            if (startDate && endDate) {
                query += ` AND ( (t.payment_date >= ? AND t.payment_date <= ?) OR (t.payment_date IS NULL) )`;
                params.push(startDate, endDate);
            } else if (startDate) {
                query += ` AND ( t.payment_date >= ? OR (t.payment_date IS NULL) )`;
                params.push(startDate);
            } else if (endDate) {
                query += ` AND ( t.payment_date <= ? OR (t.payment_date IS NULL) )`;
                params.push(endDate);
            }

            query += ` ORDER BY COALESCE(t.payment_date, t.due_date, t.created_at) DESC, t.created_at DESC`;

            console.log('[TransactionController] Executando query getAll:', query);
            console.log('[TransactionController] Params:', params);

            const transactions = await queryRunner.query(query, params);
            await queryRunner.release();

            console.log('[TransactionController] Transações encontradas:', transactions.length);

            res.json({
                success: true,
                data: { transactions },
            });
        } catch (error) {
            console.error('[TransactionController] ❌ Erro ao buscar transações:', error);
            next(error);
        }
    }

    async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const transactionRepository = AppDataSource.getRepository(Transaction);

            const transaction = await transactionRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['property', 'reservation', 'financialCategory']
            });

            if (!transaction) {
                throw new AppError('Transação não encontrada', 404);
            }

            res.json({
                success: true,
                data: { transaction },
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: CreateTransactionInput = req.body;
            console.log('[TransactionController.create] INÍCIO - Dados recebidos:', JSON.stringify(data, null, 2));
            console.log('[TransactionController.create] financialCategoryId:', data.financialCategoryId, 'tipo:', typeof data.financialCategoryId);

            const transactionRepository = AppDataSource.getRepository(Transaction);

            // Gerar número de transação único
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const count = await transactionRepository.count();
            const transactionNumber = `${data.type.toUpperCase().substring(0, 3)}-${year}${month}-${String(count + 1).padStart(5, '0')}`;

            console.log('[TransactionController.create] Transaction number gerado:', transactionNumber);

            const transaction = transactionRepository.create({
                ...data,
                type: data.type as TransactionType,
                status: data.status as TransactionStatus,
                financialCategoryId: data.financialCategoryId,
                chartOfAccountId: data.chartOfAccountId ?? null,
                uuid: uuidv4(),
                transactionNumber,
                createdBy: req.user?.id,
                paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            });

            console.log('[TransactionController.create] Entidade criada (antes de save):', {
                type: transaction.type,
                financialCategoryId: transaction.financialCategoryId,
                amount: transaction.amount,
                description: transaction.description,
            });

            await transactionRepository.save(transaction);

            console.log('[TransactionController.create] ✅ Transaction salva com sucesso! ID:', transaction.id);

            // Disparar evento transaction.created para workflows (mapeamento de plano de contas, etc.)
            try {
                const { EventBus } = await import('@/events/EventBus');
                
                // Buscar nome da categoria para incluir no payload
                const queryRunner = AppDataSource.createQueryRunner();
                await queryRunner.connect();
                let categoryName = '';
                try {
                    const catRows = await queryRunner.query(
                        'SELECT name FROM financial_categories WHERE id = ? AND deleted_at IS NULL LIMIT 1',
                        [transaction.financialCategoryId]
                    );
                    if (catRows.length > 0) categoryName = catRows[0].name;
                } finally {
                    await queryRunner.release();
                }

                EventBus.emit('transaction.created', {
                    transactionId: transaction.id,
                    transaction: {
                        id: transaction.id,
                        uuid: transaction.uuid,
                        transactionNumber: transaction.transactionNumber,
                        type: transaction.type,
                        financialCategoryId: transaction.financialCategoryId,
                        categoryName,
                        description: transaction.description,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        status: transaction.status,
                        paymentMethodId: transaction.paymentMethodId,
                        paymentDate: transaction.paymentDate,
                        propertyId: transaction.propertyId,
                    },
                    type: transaction.type,
                    categoryId: transaction.financialCategoryId,
                    categoryName,
                    amount: transaction.amount,
                    propertyId: transaction.propertyId ?? null,
                });
                console.log('[TransactionController.create] ✓ Evento transaction.created emitido para workflow');
            } catch (importErr) {
                console.error('[TransactionController.create] EventBus import error:', importErr);
            }

            // Disparar evento payment.received quando criada já como completed e tipo income
            if (transaction.status === TransactionStatus.COMPLETED && transaction.type === TransactionType.INCOME && transaction.reservationId) {
                try {
                    const { EventBus } = await import('@/events/EventBus');
                    const resRepo = AppDataSource.getRepository(Reservation);
                    const resv = await resRepo.findOne({ where: { id: transaction.reservationId }, relations: ['guest'] });
                    if (resv?.guest) {
                        const g = resv.guest;
                        EventBus.emit('payment.received', {
                            transaction: { id: transaction.id, amount: transaction.amount, description: transaction.description, paymentDate: transaction.paymentDate },
                            reservation: { id: resv.id, reservationNumber: resv.reservationNumber, totalAmount: resv.totalAmount, guestId: resv.guestId, propertyId: resv.propertyId },
                            guest: { id: g.id, email: g.email, firstName: g.firstName, lastName: g.lastName, phone: g.phone, totalStays: g.totalStays, tier: g.tier },
                            amount: String(transaction.amount),
                            propertyId: transaction.propertyId ?? resv.propertyId ?? null,
                        });
                    }
                } catch (importErr) {
                    console.error('[TransactionController.create] EventBus import error:', importErr);
                }
            }

            res.status(201).json({
                success: true,
                data: { transaction },
                message: 'Transação registrada com sucesso',
            });
        } catch (error: any) {
            console.error('[TransactionController.create] ❌ Erro ao criar transaction:', error);
            console.error('[TransactionController.create] Erro name:', error?.name);
            console.error('[TransactionController.create] Erro message:', error?.message);
            console.error('[TransactionController.create] Erro stack:', error?.stack);
            if (error?.driverError) console.error('[TransactionController.create] driverError:', error.driverError);
            if (error?.sql) console.error('[TransactionController.create] sql:', error.sql);
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data: UpdateTransactionInput = req.body;
            const transactionRepository = AppDataSource.getRepository(Transaction);

            const transaction = await transactionRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['reservation', 'reservation.guest', 'financialCategory'],
            });

            if (!transaction) {
                throw new AppError('Transação não encontrada', 404);
            }

            const previousStatus = transaction.status;

            Object.assign(transaction, {
                ...data,
                type: data.type ? (data.type as TransactionType) : transaction.type,
                status: data.status ? (data.status as TransactionStatus) : transaction.status,
                financialCategoryId: data.financialCategoryId ?? transaction.financialCategoryId,
                paymentDate: data.paymentDate ? new Date(data.paymentDate) : transaction.paymentDate,
                dueDate: data.dueDate ? new Date(data.dueDate) : transaction.dueDate,
            });

            await transactionRepository.save(transaction);

            // Disparar evento payment.received quando status muda para completed e tipo é income
            const isNowCompleted = transaction.status === TransactionStatus.COMPLETED;
            const wasNotCompletedBefore = previousStatus !== TransactionStatus.COMPLETED;
            const isIncome = transaction.type === TransactionType.INCOME;
            if (isNowCompleted && wasNotCompletedBefore && isIncome && transaction.reservationId && transaction.reservation?.guest) {
                try {
                    const { EventBus } = await import('@/events/EventBus');
                    const resv = transaction.reservation;
                    const g = resv.guest;
                    EventBus.emit('payment.received', {
                        transaction: {
                            id: transaction.id,
                            amount: transaction.amount,
                            description: transaction.description,
                            paymentDate: transaction.paymentDate,
                        },
                        reservation: {
                            id: resv.id,
                            reservationNumber: resv.reservationNumber,
                            totalAmount: resv.totalAmount,
                            guestId: resv.guestId,
                            propertyId: resv.propertyId,
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
                        amount: String(transaction.amount),
                        propertyId: transaction.propertyId ?? resv.propertyId ?? null,
                    });
                } catch (importErr) {
                    console.error('[TransactionController.update] EventBus import error:', importErr);
                }
            }

            res.json({
                success: true,
                data: { transaction },
                message: 'Transação atualizada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const transactionRepository = AppDataSource.getRepository(Transaction);

            const transaction = await transactionRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!transaction) {
                throw new AppError('Transação não encontrada', 404);
            }

            await transactionRepository.softRemove(transaction);

            res.json({
                success: true,
                message: 'Transação excluída com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { propertyId, startDate, endDate } = req.query;
            const queryRunner = AppDataSource.createQueryRunner();

            let baseWhere = `WHERE deleted_at IS NULL`;
            const params: any[] = [];
            const paramsPending: any[] = [];

            if (propertyId) {
                baseWhere += ` AND property_id = ?`;
                params.push(parseInt(propertyId as string));
                paramsPending.push(parseInt(propertyId as string));
            }

            // Para receitas/despesas concluídas: filtrar por payment_date
            let periodWhere = baseWhere;
            if (startDate) {
                periodWhere += ` AND payment_date >= ?`;
                params.push(startDate);
            }
            if (endDate) {
                periodWhere += ` AND payment_date <= ?`;
                params.push(endDate);
            }

            // Pendentes: não filtrar por data (mostrar todos os itens em aberto)
            const pendingWhere = baseWhere;

            const statsQuery = `
        SELECT 
          SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as totalRevenue,
          SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as totalExpenses
        FROM transactions
        ${periodWhere}
      `;
            const stats = await queryRunner.query(statsQuery, params);

            const pendingQuery = `
        SELECT 
          SUM(CASE WHEN type = 'income' AND status = 'pending' THEN amount ELSE 0 END) as pendingReceivable,
          SUM(CASE WHEN type = 'expense' AND status = 'pending' THEN amount ELSE 0 END) as pendingPayable,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingCount
        FROM transactions
        ${pendingWhere}
      `;
            const pendingParams = propertyId ? [parseInt(propertyId as string)] : [];
            const pendingStats = await queryRunner.query(pendingQuery, pendingParams);

            // Gráfico: apenas transações com payment_date (concluídas), agrupadas por mês
            let chartWhere = baseWhere + ` AND payment_date IS NOT NULL`;
            const chartParams: any[] = propertyId ? [parseInt(propertyId as string)] : [];
            if (startDate) {
                chartWhere += ` AND payment_date >= ?`;
                chartParams.push(startDate);
            }
            if (endDate) {
                chartWhere += ` AND payment_date <= ?`;
                chartParams.push(endDate);
            }

            const chartQuery = `
        SELECT 
          DATE_FORMAT(payment_date, '%b') as month,
          DATE_FORMAT(payment_date, '%Y-%m') as sortKey,
          SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as receita,
          SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as despesas
        FROM transactions
        ${chartWhere}
        GROUP BY DATE_FORMAT(payment_date, '%Y-%m'), DATE_FORMAT(payment_date, '%b')
        ORDER BY DATE_FORMAT(payment_date, '%Y-%m') ASC
        LIMIT 12
      `;

            const chartData = await queryRunner.query(chartQuery, chartParams);

            await queryRunner.release();

            const result = stats[0];
            const pendingResult = pendingStats[0];
            const revenue = parseFloat(result?.totalRevenue || 0);
            const expenses = parseFloat(result?.totalExpenses || 0);

            res.json({
                success: true,
                data: {
                    summary: {
                        totalRevenue: revenue,
                        totalExpenses: expenses,
                        netProfit: revenue - expenses,
                        pendingReceivable: parseFloat(pendingResult?.pendingReceivable || 0),
                        pendingPayable: parseFloat(pendingResult?.pendingPayable || 0),
                        pendingCount: parseInt(pendingResult?.pendingCount || 0)
                    },
                    chartData: chartData.map((d: any) => ({
                        ...d,
                        receita: parseFloat(d.receita || 0),
                        despesas: parseFloat(d.despesas || 0),
                        lucro: parseFloat(d.receita || 0) - parseFloat(d.despesas || 0)
                    }))
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async uploadAttachments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                throw new AppError('Nenhum arquivo enviado', 400);
            }

            const files = req.files as Express.Multer.File[];
            const uploadResults = await StorageService.uploadFiles(files, req, 'transactions');

            const attachments = uploadResults.map(result => ({
                url: result.url,
                fullUrl: result.fullUrl,
                filename: result.filename,
                originalName: result.originalName,
                size: result.size,
            }));

            res.json({
                success: true,
                data: { attachments },
                message: 'Arquivos enviados com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}
