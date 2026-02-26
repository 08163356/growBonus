import { Router } from 'express';
import { pointController } from '../controllers/pointController';
import { protect, authorize, rejectGuest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', protect, authorize('admin', 'parent'), rejectGuest, upload.single('photo'), pointController.create);
router.get('/child/:childId', protect, pointController.getByChild);
router.get('/summary/:childId', protect, pointController.getSummary);
router.get('/today/:childId', protect, pointController.getTodayRecords);
router.delete('/:id', protect, authorize('admin', 'parent'), rejectGuest, pointController.deleteRecord);
router.post('/:id/like', protect, rejectGuest, pointController.toggleLike);
router.get('/likes/:childId', protect, pointController.getLatestLikes);

export default router;
