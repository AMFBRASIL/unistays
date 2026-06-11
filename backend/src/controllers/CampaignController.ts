import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Campaign, CampaignStatus } from '@/entities/Campaign.entity';
import { Guest } from '@/entities/Guest.entity';
import { EmailService } from '@/services/EmailService';
import { AppError } from '@/middlewares/error.middleware';
import { IsNull, Not } from 'typeorm';

export class CampaignController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const campaignRepository = AppDataSource.getRepository(Campaign);
            const campaigns = await campaignRepository.find({
                order: { createdAt: 'DESC' },
                withDeleted: false
            });

            res.json({
                success: true,
                data: { campaigns },
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const campaignRepository = AppDataSource.getRepository(Campaign);
            const campaign = await campaignRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!campaign) {
                throw new AppError('Campanha não encontrada', 404);
            }

            res.json({
                success: true,
                data: { campaign },
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body;
            const campaignRepository = AppDataSource.getRepository(Campaign);

            const campaign = campaignRepository.create({
                ...data,
                status: CampaignStatus.DRAFT,
            });

            await campaignRepository.save(campaign);

            res.status(201).json({
                success: true,
                data: { campaign },
                message: 'Campanha criada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = req.body;
            const campaignRepository = AppDataSource.getRepository(Campaign);

            const campaign = await campaignRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!campaign) {
                throw new AppError('Campanha não encontrada', 404);
            }

            // Update fields
            campaignRepository.merge(campaign, data);
            await campaignRepository.save(campaign);

            res.json({
                success: true,
                data: { campaign },
                message: 'Campanha atualizada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const campaignRepository = AppDataSource.getRepository(Campaign);

            const campaign = await campaignRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!campaign) {
                throw new AppError('Campanha não encontrada', 404);
            }

            await campaignRepository.softRemove(campaign);

            res.json({
                success: true,
                message: 'Campanha excluída com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async send(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const campaignRepository = AppDataSource.getRepository(Campaign);
            const guestRepository = AppDataSource.getRepository(Guest);

            const campaign = await campaignRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!campaign) {
                throw new AppError('Campanha não encontrada', 404);
            }

            if (campaign.status === CampaignStatus.COMPLETED) {
                throw new AppError('Campanha já enviada', 400);
            }

            // Buscar público alvo (Guests)
            // Por enquanto, simples filtro: marketingConsent = true
            // Futuramente, usar campaign.segments para filtrar
            const guests = await guestRepository.find({
                where: { marketingConsent: true, email: Not(IsNull()) }
            });

            if (guests.length === 0) {
                throw new AppError('Nenhum destinatário encontrado', 404);
            }

            // Iniciar envio (poderia ser uma fila)
            let sentCount = 0;
            let errorCount = 0;

            for (const guest of guests) {
                if (!guest.email) continue;

                try {
                    // Substituir variáveis no conteúdo (ex: {{firstName}})
                    let content = campaign.content || '';
                    content = content.replace(/{{firstName}}/g, guest.firstName || 'Cliente');
                    content = content.replace(/{{lastName}}/g, guest.lastName || '');

                    await EmailService.sendEmail(
                        guest.email,
                        campaign.subject || 'Novidades da Unistays',
                        content,
                        undefined, // text version
                        undefined  // propertyId (global)
                    );
                    sentCount++;
                } catch (error) {
                    console.error(`Erro ao enviar para ${guest.email}:`, error);
                    errorCount++;
                }
            }

            // Atualizar status da campanha
            campaign.status = CampaignStatus.COMPLETED;
            campaign.sent = sentCount;
            campaign.delivered = sentCount; // Assumindo entregue por enquanto
            await campaignRepository.save(campaign);

            res.json({
                success: true,
                message: `Campanha enviada com sucesso. Enviados: ${sentCount}. Erros: ${errorCount}`,
                data: { sent: sentCount, errors: errorCount }
            });

        } catch (error) {
            next(error);
        }
    }
    async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const campaignRepository = AppDataSource.getRepository(Campaign);

            const stats = await campaignRepository
                .createQueryBuilder('campaign')
                .select([
                    'SUM(campaign.sent) as totalSent',
                    'SUM(campaign.delivered) as delivered',
                    'SUM(campaign.opened) as opened',
                    'SUM(campaign.clicked) as clicked',
                    'SUM(campaign.bounced) as bounced',
                    'SUM(campaign.unsubscribed) as unsubscribed'
                ])
                .getRawOne();

            // Calculate rates
            // Note: SUM returns string in some drivers, cast to int
            const sent = parseInt(stats.totalSent) || 0;
            const delivered = parseInt(stats.delivered) || 0;
            const opened = parseInt(stats.opened) || 0;
            const clicked = parseInt(stats.clicked) || 0;
            const bounced = parseInt(stats.bounced) || 0;
            const unsubscribed = parseInt(stats.unsubscribed) || 0;

            const openRate = sent > 0 ? (opened / sent) * 100 : 0;
            const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
            const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0;
            const unsubscribeRate = sent > 0 ? (unsubscribed / sent) * 100 : 0;

            res.json({
                success: true,
                data: {
                    totalSent: sent,
                    delivered,
                    opened,
                    clicked,
                    bounced,
                    unsubscribed,
                    openRate: parseFloat(openRate.toFixed(1)),
                    clickRate: parseFloat(clickRate.toFixed(1)),
                    bounceRate: parseFloat(bounceRate.toFixed(1)),
                    unsubscribeRate: parseFloat(unsubscribeRate.toFixed(1))
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const campaignRepository = AppDataSource.getRepository(Campaign);
            // Group by date of creation or schedule
            const performance = await campaignRepository
                .createQueryBuilder('campaign')
                .select([
                    "DATE_FORMAT(campaign.created_at, '%d %b') as date",
                    'SUM(campaign.sent) as enviados',
                    'SUM(campaign.opened) as abertos',
                    'SUM(campaign.clicked) as cliques'
                ])
                .groupBy("DATE_FORMAT(campaign.created_at, '%d %b')")
                .orderBy('campaign.created_at', 'ASC')
                .limit(7)
                .getRawMany();

            res.json({
                success: true,
                data: { performance }
            });
        } catch (error) {
            next(error);
        }
    }
}
