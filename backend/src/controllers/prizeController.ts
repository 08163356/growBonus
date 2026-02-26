import { Request, Response } from 'express';
import { prizeService } from '../services/prizeService';
import { AuthenticatedRequest } from '../middleware/auth';

export const prizeController = {
  getAll(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const prizes = prizeService.getAll(familyId);
    res.json({ success: true, data: prizes });
  },

  create(req: AuthenticatedRequest, res: Response) {
    try {
      const data = { ...req.body, familyId: req.user.family_id };
      if (req.file) data.image = req.file.filename;
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
      if (req.file) data.image = req.file.filename;
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

  getPendingRedemptions(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const redemptions = prizeService.getPendingRedemptions(familyId);
    res.json({ success: true, data: redemptions });
  },

  approve(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      prizeService.approve(id, req.user.id);
      res.json({ success: true, message: '已通过' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  reject(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      prizeService.reject(id, req.user.id);
      res.json({ success: true, message: '已拒绝' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
