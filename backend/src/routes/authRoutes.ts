import { Router } from 'express';
import { authController } from '../controllers/authController';
import { protect, authorize, rejectGuest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/login', authController.login);
router.post('/guest', authController.guestLogin);
router.post('/login-child', authController.loginChild);
router.post('/switch-role', protect, authController.switchRole);
router.get('/family-members', protect, authController.getFamilyMembers);
router.get('/me', protect, authController.getMe);
router.get('/children', protect, authController.getChildren);
router.get('/children-public', authController.getChildrenPublic);
router.post('/children', protect, authorize('admin'), rejectGuest, authController.addChild);
router.put('/children/:id', protect, authorize('admin'), rejectGuest, authController.updateChild);
router.delete('/children/:id', protect, authorize('admin'), rejectGuest, authController.deleteChild);
router.put('/theme', protect, rejectGuest, authController.updateTheme);
router.put('/background', protect, rejectGuest, upload.single('image'), authController.updateBackgroundImage);
router.get('/background', protect, authController.getBackgroundImage);

export default router;
