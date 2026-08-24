import { Router } from 'express';
import { IntegrationController } from '@/controllers/IntegrationController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new IntegrationController();

// Public Channex → Unistays webhook (no JWT)
router.post(
  '/webhooks/channex/:connectionUuid',
  controller.channexWebhook.bind(controller),
);

router.get('/providers', authenticate, controller.listProviders.bind(controller));
router.get('/connections', authenticate, controller.listConnections.bind(controller));
router.get('/connections/:id(\\d+)', authenticate, controller.getConnection.bind(controller));
router.post('/connections', authenticate, controller.createConnection.bind(controller));
router.put('/connections/:id(\\d+)', authenticate, controller.updateConnection.bind(controller));
router.delete('/connections/:id(\\d+)', authenticate, controller.deleteConnection.bind(controller));
router.post('/connections/:id(\\d+)/test', authenticate, controller.testConnection.bind(controller));
router.get(
  '/connections/:id(\\d+)/external-properties',
  authenticate,
  controller.listExternalProperties.bind(controller),
);
router.get(
  '/connections/:id(\\d+)/external-listings',
  authenticate,
  controller.listExternalListings.bind(controller),
);
router.get(
  '/connections/:id(\\d+)/external-room-types',
  authenticate,
  controller.listExternalRoomTypes.bind(controller),
);
router.get(
  '/connections/:id(\\d+)/mappings',
  authenticate,
  controller.listMappings.bind(controller),
);
router.put(
  '/connections/:id(\\d+)/mappings',
  authenticate,
  controller.upsertMapping.bind(controller),
);
router.delete(
  '/connections/:id(\\d+)/mappings/:mappingId(\\d+)',
  authenticate,
  controller.deleteMapping.bind(controller),
);
router.delete(
  '/connections/:id(\\d+)/mappings/by-external/:externalId',
  authenticate,
  controller.deleteMappingByExternal.bind(controller),
);
router.post(
  '/connections/:id(\\d+)/register-webhook',
  authenticate,
  controller.registerWebhook.bind(controller),
);
router.post(
  '/connections/:id(\\d+)/pull-bookings',
  authenticate,
  controller.pullBookings.bind(controller),
);
router.get(
  '/connections/:id(\\d+)/external-rate-plans',
  authenticate,
  controller.listExternalRatePlans.bind(controller),
);
router.post(
  '/connections/:id(\\d+)/provision',
  authenticate,
  controller.provisionFromUnistays.bind(controller),
);
router.post(
  '/connections/:id(\\d+)/sync-availability',
  authenticate,
  controller.syncAvailability.bind(controller),
);
router.post(
  '/connections/:id(\\d+)/sync-rates',
  authenticate,
  controller.syncRates.bind(controller),
);
router.post(
  '/connections/:id(\\d+)/doctor',
  authenticate,
  controller.doctor.bind(controller),
);
router.post(
  '/connections/:id(\\d+)/recover-bookings',
  authenticate,
  controller.recoverBookings.bind(controller),
);
router.get(
  '/reservations/:reservationId(\\d+)/channel-flow',
  authenticate,
  controller.reservationChannelFlow.bind(controller),
);

export default router;
