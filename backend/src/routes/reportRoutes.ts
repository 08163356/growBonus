import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { protect, authorize, rejectGuest } from '../middleware/auth';

const router = Router();

router.get('/weekly/:childId', protect, authorize('admin', 'parent'), reportController.getWeeklyReport);
router.get('/monthly/:childId', protect, authorize('admin', 'parent'), reportController.getMonthlyReport);
router.get('/budget', protect, authorize('admin', 'parent'), reportController.getBudgetStatus);
router.post('/budget/add', protect, authorize('admin'), rejectGuest, reportController.addBudget);

export default router;
