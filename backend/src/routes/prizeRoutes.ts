import { Router } from 'express';
import { prizeController } from '../controllers/prizeController';
import { protect, authorize, rejectGuest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', protect, prizeController.getAll);
router.post('/', protect, authorize('admin', 'parent'), rejectGuest, upload.array('images', 2), prizeController.create);
router.put('/:id', protect, authorize('admin', 'parent'), rejectGuest, upload.array('images', 2), prizeController.update);
router.post('/redeem', protect, authorize('child'), rejectGuest, prizeController.redeem);
router.get('/redemptions', protect, prizeController.getRedemptions);
router.get('/redemptions/child', protect, authorize('child'), prizeController.getChildRedemptions);
router.get('/redemptions/pending', protect, authorize('admin'), prizeController.getPendingRedemptions);
router.put('/redemptions/:id/approve', protect, authorize('admin'), rejectGuest, upload.array('images', 3), prizeController.approve);
router.put('/redemptions/:id/reject', protect, authorize('admin'), rejectGuest, upload.array('images', 3), prizeController.reject);

export default router;
