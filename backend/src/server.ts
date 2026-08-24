import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { AppDataSource } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middlewares/error.middleware';

// Import Routes
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import propertyRoutes from '@/routes/property.routes';
import reservationRoutes from '@/routes/reservation.routes';
import userGroupRoutes from '@/routes/usergroup.routes';
import roomTypeRoutes from '@/routes/roomType.routes';
import amenityRoutes from '@/routes/amenity.routes';
import unitOfMeasureRoutes from '@/routes/unitOfMeasure.routes';
import stockConfigRoutes from '@/routes/stockConfig.routes';
import productGroupRoutes from '@/routes/productGroup.routes';
import productConfigRoutes from '@/routes/productConfig.routes';
import productCategoryRoutes from '@/routes/productCategory.routes';
import productRoutes from '@/routes/product.routes';
import unitRoutes from '@/routes/unit.routes';
import uploadRoutes from '@/routes/upload.routes';
import storageConfigRoutes from '@/routes/storageConfig.routes';
import guestRoutes from '@/routes/guest.routes';
import guestPortalPublicRoutes from '@/routes/guestPortalPublic.routes';
import companyRoutes from '@/routes/company.routes';
import supplierRoutes from '@/routes/supplier.routes';
import supplierCategoryRoutes from '@/routes/supplierCategory.routes';
import ratePlanRoutes from '@/routes/ratePlan.routes';
import promotionRoutes from '@/routes/promotion.routes';
import seasonRoutes from '@/routes/season.routes';
import policyRoutes from '@/routes/policy.routes';
import extraRoutes from '@/routes/extra.routes';
import mealRoutes from '@/routes/meal.routes';
import parkingRoutes from '@/routes/parking.routes';
import emailConfigRoutes from '@/routes/emailConfig.routes';
import smtpConfigRoutes from '@/routes/smtpConfig.routes';
import emailTemplateRoutes from '@/routes/emailTemplate.routes';
import aiConfigRoutes from '@/routes/aiConfig.routes';
import invoiceParamsRoutes from '@/routes/invoiceParams.routes';
import fiscalParamsRoutes from '@/routes/fiscalParams.routes';
import chartOfAccountsRoutes from '@/routes/chartOfAccounts.routes';
import financialCategoryRoutes from '@/routes/financialCategory.routes';
import bookingEngineConfigRoutes from '@/routes/bookingEngineConfig.routes';
import workflowRoutes from '@/routes/workflow.routes';
import generalSettingsRoutes from '@/routes/generalSettings.routes';
import pageRoutes from '@/routes/pageRoutes';
import campaignRoutes from '@/routes/campaign.routes';
import emailAutomationRoutes from '@/routes/emailAutomation.routes';
import emailSegmentRoutes from '@/routes/emailSegment.routes';
import paymentMethodRoutes from '@/routes/paymentMethod.routes';
import unitRateRoutes from '@/routes/unitrate.routes';
import housekeepingRoutes from '@/routes/housekeeping.routes';
import transactionRoutes from '@/routes/transaction.routes';
import dashboardRoutes from '@/routes/dashboard.routes';
import stockLocationRoutes from '@/routes/stock_locations.routes';
import storageLocationRoutes from '@/routes/storageLocation.routes';
import maintenanceRoutes from '@/routes/maintenance_orders.routes';
import equipmentCategoryRoutes from '@/routes/equipmentCategory.routes';
import equipmentLocationRoutes from '@/routes/equipmentLocation.routes';
import equipmentRoutes from '@/routes/equipment.routes';
import guestAuthRoutes from '@/routes/guestauth.routes';
import bookingRoutes from '@/routes/booking.routes';
import setupRoutes from '@/routes/setup.routes';
import inventoryItemRoutes from '@/routes/inventoryItem.routes';
import inventoryMovementRoutes from '@/routes/inventoryMovement.routes';
import inventoryCountRoutes from '@/routes/inventoryCount.routes';
import purchaseOrderRoutes from '@/routes/purchaseOrder.routes';
import contractTemplateRoutes from '@/routes/contractTemplate.routes';
import propertyBankAccountRoutes from '@/routes/propertyBankAccount.routes';

// ... (in app.use section)



const app = express();
let workflowListenersRegistered = false;

// Nginx/reverse proxy envia X-Forwarded-For; necessário para rate-limit e req.ip corretos
if (env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.set('trust proxy', 1);
}

const ensureDataSourceInitialized = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');
  }

  if (!workflowListenersRegistered) {
    const { registerWorkflowListeners } = await import('@/events/workflowListeners');
    registerWorkflowListeners();
    const { registerIntegrationListeners } = await import('@/events/integrationListeners');
    registerIntegrationListeners();
    const { registerOutboundWebhookListeners } = await import('@/events/outboundWebhookListeners');
    registerOutboundWebhookListeners();
    const { ensureOutboundWebhookSchema } = await import('@/services/webhooks/ensureOutboundWebhookSchema');
    await ensureOutboundWebhookSchema();
    workflowListenersRegistered = true;
  }
};

// Security Middlewares
app.use(helmet());
const allowedOrigins = new Set([
  'https://unistays-backend.vercel.app',
  'https://unistays.com.br',
  'https://www.unistays.com.br',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server tools/curl requests without Origin header
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    // Dev: Vite pode usar 8080, 8081, 8082… quando a API é chamada direto na :3020
    if (env.NODE_ENV !== 'production') {
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});
app.use('/api/', limiter);

// Body Parsing
app.use(compression() as any);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Servir arquivos estáticos de upload
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ensure database is initialized before handling API routes (works for local server and serverless)
app.use(async (_req, _res, next) => {
  try {
    await ensureDataSourceInitialized();
    next();
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/properties`, propertyRoutes);
app.use(`/api/${env.API_VERSION}/reservations`, reservationRoutes);
app.use(`/api/${env.API_VERSION}/user-groups`, userGroupRoutes);
app.use(`/api/${env.API_VERSION}/room-types`, roomTypeRoutes);
app.use(`/api/${env.API_VERSION}/amenities`, amenityRoutes);
app.use(`/api/${env.API_VERSION}/units`, unitRoutes);
app.use(`/api/${env.API_VERSION}/units-of-measure`, unitOfMeasureRoutes);
app.use(`/api/${env.API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${env.API_VERSION}/storage-config`, storageConfigRoutes);
// Portal do hóspede: rotas públicas sem token staff (deve vir antes de /guests para não cair em router.use(authenticate))
app.use(`/api/${env.API_VERSION}/guests/public`, guestPortalPublicRoutes);
app.use(`/api/${env.API_VERSION}/guests`, guestRoutes);
app.use(`/api/${env.API_VERSION}/companies`, companyRoutes);
app.use(`/api/${env.API_VERSION}/suppliers`, supplierRoutes);
app.use(`/api/${env.API_VERSION}/supplier-categories`, supplierCategoryRoutes);
app.use(`/api/${env.API_VERSION}/rate-plans`, ratePlanRoutes);
app.use(`/api/${env.API_VERSION}/promotions`, promotionRoutes);
app.use(`/api/${env.API_VERSION}/seasons`, seasonRoutes);
app.use(`/api/${env.API_VERSION}/policies`, policyRoutes);
app.use(`/api/${env.API_VERSION}/extras`, extraRoutes);
app.use(`/api/${env.API_VERSION}/meals`, mealRoutes);
app.use(`/api/${env.API_VERSION}/parking`, parkingRoutes);
app.use(`/api/${env.API_VERSION}/units-of-measure`, unitOfMeasureRoutes);
app.use(`/api/${env.API_VERSION}/stock-config`, stockConfigRoutes);
app.use(`/api/${env.API_VERSION}/product-groups`, productGroupRoutes);
app.use(`/api/${env.API_VERSION}/product-config`, productConfigRoutes);
app.use(`/api/${env.API_VERSION}/product-categories`, productCategoryRoutes);
app.use(`/api/${env.API_VERSION}/products`, productRoutes);
app.use(`/api/${env.API_VERSION}/email-configs`, emailConfigRoutes);
app.use(`/api/${env.API_VERSION}/smtp-configs`, smtpConfigRoutes);
app.use(`/api/${env.API_VERSION}/email-templates`, emailTemplateRoutes);
app.use(`/api/${env.API_VERSION}/ai-configs`, aiConfigRoutes);
app.use(`/api/${env.API_VERSION}/invoice-params`, invoiceParamsRoutes);
app.use(`/api/${env.API_VERSION}/fiscal-params`, fiscalParamsRoutes);
app.use(`/api/${env.API_VERSION}/chart-of-accounts`, chartOfAccountsRoutes);
app.use(`/api/${env.API_VERSION}/financial-categories`, financialCategoryRoutes);
app.use(`/api/${env.API_VERSION}/booking-engine-config`, bookingEngineConfigRoutes);
app.use(`/api/${env.API_VERSION}/general-settings`, generalSettingsRoutes);
app.use(`/api/${env.API_VERSION}/workflows`, workflowRoutes);
app.use(`/api/${env.API_VERSION}/pages`, pageRoutes);
app.use(`/api/${env.API_VERSION}/stock-locations`, stockLocationRoutes);
app.use(`/api/${env.API_VERSION}/storage-locations`, storageLocationRoutes);
app.use(`/api/${env.API_VERSION}/campaigns`, campaignRoutes);
app.use(`/api/${env.API_VERSION}/maintenance`, maintenanceRoutes);
app.use(`/api/${env.API_VERSION}/equipment-categories`, equipmentCategoryRoutes);
app.use(`/api/${env.API_VERSION}/equipment-locations`, equipmentLocationRoutes);
app.use(`/api/${env.API_VERSION}/equipments`, equipmentRoutes);
app.use(`/api/${env.API_VERSION}/email-automations`, emailAutomationRoutes);
app.use(`/api/${env.API_VERSION}/email-segments`, emailSegmentRoutes);
app.use(`/api/${env.API_VERSION}/guests`, guestAuthRoutes);
app.use(`/api/${env.API_VERSION}/booking`, bookingRoutes);
import bookingChannelRoutes from '@/routes/bookingChannel.routes';
import integrationRoutes from '@/routes/integration.routes';
import outboundWebhookRoutes from '@/routes/outboundWebhook.routes';

app.use(`/api/${env.API_VERSION}/payment-methods`, paymentMethodRoutes);
app.use(`/api/${env.API_VERSION}/booking-channels`, bookingChannelRoutes);
app.use(`/api/${env.API_VERSION}/integrations`, integrationRoutes);
app.use(`/api/${env.API_VERSION}/outbound-webhooks`, outboundWebhookRoutes);
app.use(`/api/${env.API_VERSION}/unit-rates`, unitRateRoutes);
app.use(`/api/${env.API_VERSION}/housekeeping`, housekeepingRoutes);
app.use(`/api/${env.API_VERSION}/financial/transactions`, transactionRoutes);
app.use(`/api/${env.API_VERSION}/dashboard`, dashboardRoutes);
app.use(`/api/${env.API_VERSION}/setup`, setupRoutes);
app.use(`/api/${env.API_VERSION}/inventory-items`, inventoryItemRoutes);
app.use(`/api/${env.API_VERSION}/inventory-movements`, inventoryMovementRoutes);
app.use(`/api/${env.API_VERSION}/inventory-counts`, inventoryCountRoutes);
app.use(`/api/${env.API_VERSION}/purchase-orders`, purchaseOrderRoutes);
app.use(`/api/${env.API_VERSION}/contract-templates`, contractTemplateRoutes);
app.use(`/api/${env.API_VERSION}/property-bank-accounts`, propertyBankAccountRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Database and Start Server
// Migrations/Seeds removed as requested


const startServer = async () => {
  try {
    await ensureDataSourceInitialized();

    try {
      const { startChannexFeedPoller } = await import('@/services/integrations/ChannexFeedPoller');
      startChannexFeedPoller();
    } catch (err) {
      logger.warn('Channex feed poller not started', err);
    }

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API available at http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await AppDataSource.destroy();
  process.exit(0);
});

if (!process.env.VERCEL) {
  startServer();
}

export default app;
