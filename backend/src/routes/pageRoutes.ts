import { Router } from 'express';
import { PageController } from '@/controllers/PageController';
// import { authMiddleware } from '@/middlewares/auth.middleware'; // TODO: Enable auth when ready

const router = Router();
const pageController = new PageController();

// Public navigation route (or protected, depending on requirements)
router.get('/navigation', pageController.getNavigation);

// Groups CRUD
router.get('/groups', pageController.getGroups);
router.post('/groups', pageController.createGroup);
router.put('/groups/:id', pageController.updateGroup);
router.delete('/groups/:id', pageController.deleteGroup);

// Pages CRUD
router.get('/', pageController.getPages);
router.post('/', pageController.createPage);
router.put('/:id', pageController.updatePage);
router.delete('/:id', pageController.deletePage);

export default router;
