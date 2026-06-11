import { Router } from 'express';
import { UnitRateController } from '@/controllers/UnitRateController';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const unitRateController = new UnitRateController();

// All routes require authentication
router.use(authenticate);

// Get complete pricing map data (optimized - single request)
router.get('/pricing-map', unitRateController.getPricingMapData.bind(unitRateController));

// Get all unit rates (with optional date range filter)
router.get('/', unitRateController.getAllUnitRates.bind(unitRateController));

// Get rates for a specific unit
router.get('/unit/:unitId', unitRateController.getUnitRates.bind(unitRateController));

// Create or update a single rate
router.post('/', unitRateController.upsertRate.bind(unitRateController));

// Bulk create/update rates
router.post('/bulk', unitRateController.bulkUpsertRates.bind(unitRateController));

// Delete a rate
router.delete('/:id', unitRateController.deleteRate.bind(unitRateController));

export default router;
