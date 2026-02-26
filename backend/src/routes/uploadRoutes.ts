import { Router } from 'express';
import { protect, rejectGuest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { fileStorage } from '../services/fileStorageService';

const router = Router();

router.post('/image', protect, rejectGuest, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: '请选择图片' });
    return;
  }
  const url = fileStorage.getUrl(req.file.filename);
  res.json({ success: true, data: { filename: req.file.filename, url } });
});

export default router;
