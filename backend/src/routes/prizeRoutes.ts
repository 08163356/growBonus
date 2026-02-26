import { Router } from 'express';
import { prizeController } from '../controllers/prizeController';
import { protect, authorize, rejectGuest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', protect, prizeController.getAll);
router.post('/', protect, authorize('admin'), rejectGuest, upload.single('image'), prizeController.create);
router.put('/:id', protect, authorize('admin'), rejectGuest, upload.single('image'), prizeController.update);
router.post('/redeem', protect, authorize('child'), rejectGuest, prizeController.redeem);
router.get('/redemptions', protect, prizeController.getRedemptions);
router.get('/redemptions/pending', protect, authorize('admin', 'parent'), prizeController.getPendingRedemptions);
router.put('/redemptions/:id/approve', protect, authorize('admin', 'parent'), rejectGuest, prizeController.approve);
router.put('/redemptions/:id/reject', protect, authorize('admin', 'parent'), rejectGuest, prizeController.reject);

export default router;
