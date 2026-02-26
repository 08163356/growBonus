import { Router } from 'express';
import { templateController } from '../controllers/templateController';
import { protect, authorize, rejectGuest } from '../middleware/auth';

const router = Router();

router.get('/', protect, templateController.getAll);
router.post('/', protect, authorize('admin'), rejectGuest, templateController.create);
router.put('/:id', protect, authorize('admin'), rejectGuest, templateController.update);
router.delete('/:id', protect, authorize('admin'), rejectGuest, templateController.delete);

export default router;
