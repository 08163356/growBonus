import { Request, Response } from 'express';
import { pointService } from '../services/pointService';
import { AuthenticatedRequest } from '../middleware/auth';
import { likeDAO } from '../database/dao/LikeDAO';

export const pointController = {
  create(req: AuthenticatedRequest, res: Response) {
    try {
      const { childId, templateId, points, note, encouragement } = req.body;
      const photoUrl = req.file ? req.file.filename : '';

      const record = pointService.createRecord({
        childId,
        templateId,
        points,
        note,
        encouragement,
        photoUrl,
        createdBy: req.user.id,
      });

      res.status(201).json({ success: true, data: record });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  getByChild(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.childId as string);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const records = pointService.getRecords(childId, limit, offset);
    res.json({ success: true, data: records });
  },

  getSummary(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.childId as string);
    const summary = pointService.getSummary(childId);
    res.json({ success: true, data: summary });
  },

  getTodayRecords(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.childId as string);
    const records = pointService.getTodayRecords(childId);
    res.json({ success: true, data: records });
  },

  deleteRecord(req: AuthenticatedRequest, res: Response) {
    const recordId = parseInt(req.params.id as string);
    pointService.deleteRecord(recordId);
    res.json({ success: true, message: '记录已删除' });
  },

  toggleLike(req: AuthenticatedRequest, res: Response) {
    const recordId = parseInt(req.params.id as string);
    const userId = req.user.id;

    if (likeDAO.isLiked(recordId, userId)) {
      likeDAO.remove(recordId, userId);
      res.json({ success: true, data: { liked: false, count: likeDAO.getLikeCount(recordId) } });
    } else {
      likeDAO.create(recordId, userId);
      res.json({ success: true, data: { liked: true, count: likeDAO.getLikeCount(recordId) } });
    }
  },

  getLatestLikes(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.childId as string);
    const likes = likeDAO.getLatestLikes(childId);
    res.json({ success: true, data: likes });
  },
};
