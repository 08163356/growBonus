import { Router } from 'express';
import authRoutes from './authRoutes';
import pointRoutes from './pointRoutes';
import prizeRoutes from './prizeRoutes';
import templateRoutes from './templateRoutes';
import achievementRoutes from './achievementRoutes';
import reportRoutes from './reportRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/points', pointRoutes);
router.use('/prizes', prizeRoutes);
router.use('/templates', templateRoutes);
router.use('/achievements', achievementRoutes);
router.use('/reports', reportRoutes);
router.use('/upload', uploadRoutes);

export default router;
