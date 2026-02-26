import { Request, Response } from 'express';
import { prizeService } from '../services/prizeService';
import { AuthenticatedRequest } from '../middleware/auth';

// 积分阈值自动计算档位
function autoTier(pointsCost: number): string {
  if (pointsCost <= 100) return 'small';
  if (pointsCost <= 500) return 'medium';
  if (pointsCost <= 2000) return 'large';
  return 'super';
}

export const prizeController = {
  getAll(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const prizes = prizeService.getAll(familyId);
    res.json({ success: true, data: prizes });
  },

  create(req: AuthenticatedRequest, res: Response) {
    try {
      const data = { ...req.body, familyId: req.user.family_id };
      // 多图处理
      const files = req.files as Express.Multer.File[] | undefined;
      if (files && files.length > 0) {
        data.image = files[0].filename;
        data.images = files.map((f: Express.Multer.File) => f.filename).join(',');
      } else if (req.file) {
        data.image = req.file.filename;
        data.images = req.file.filename;
      }
      // 自动计算档位
      const pointsCost = parseInt(data.pointsCost);
      if (!isNaN(pointsCost)) {
        data.tier = autoTier(pointsCost);
      }
      const prize = prizeService.create(data);
      res.status(201).json({ success: true, data: prize });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const data = { ...req.body };
      const files = req.files as Express.Multer.File[] | undefined;
      if (files && files.length > 0) {
        data.image = files[0].filename;
        data.images = files.map((f: Express.Multer.File) => f.filename).join(',');
      } else if (req.file) {
        data.image = req.file.filename;
        data.images = req.file.filename;
      }
      // 自动计算档位
      const pointsCost = parseInt(data.pointsCost);
      if (!isNaN(pointsCost)) {
        data.tier = autoTier(pointsCost);
      }
      const prize = prizeService.update(id, data);
      res.json({ success: true, data: prize });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  redeem(req: AuthenticatedRequest, res: Response) {
    try {
      const { prizeId } = req.body;
      const childId = req.user.id;
      const familyId = req.user.family_id;
      const redemption = prizeService.redeem(childId, prizeId, familyId);
      res.status(201).json({ success: true, data: redemption });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  getRedemptions(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const redemptions = prizeService.getRedemptions(familyId);
    res.json({ success: true, data: redemptions });
  },

  getChildRedemptions(req: AuthenticatedRequest, res: Response) {
    const childId = req.user.id;
    const redemptions = prizeService.getChildRedemptions(childId);
    res.json({ success: true, data: redemptions });
  },

  getPendingRedemptions(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const redemptions = prizeService.getPendingRedemptions(familyId);
    res.json({ success: true, data: redemptions });
  },

  approve(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { message } = req.body || {};
      const files = req.files as Express.Multer.File[] | undefined;
      const images = files && files.length > 0
        ? files.map((f: Express.Multer.File) => f.filename).join(',')
        : '';
      prizeService.approve(id, req.user.id, message, images);
      res.json({ success: true, message: '已通过' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  reject(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { message } = req.body || {};
      const files = req.files as Express.Multer.File[] | undefined;
      const images = files && files.length > 0
        ? files.map((f: Express.Multer.File) => f.filename).join(',')
        : '';
      prizeService.reject(id, req.user.id, message, images);
      res.json({ success: true, message: '已拒绝' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
