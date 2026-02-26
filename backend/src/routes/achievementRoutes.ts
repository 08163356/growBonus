import { Router } from 'express';
import { achievementController } from '../controllers/achievementController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, achievementController.getAll);
router.get('/unlocked/:childId', protect, achievementController.getUnlocked);

export default router;
