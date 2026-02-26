import { Request, Response } from 'express';
import { achievementService } from '../services/achievementService';
import { AuthenticatedRequest } from '../middleware/auth';

export const achievementController = {
  getAll(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const achievements = achievementService.getAll(familyId);
    res.json({ success: true, data: achievements });
  },

  getUnlocked(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.childId as string);
    const unlocked = achievementService.getUnlocked(childId);
    res.json({ success: true, data: unlocked });
  },
};
