import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import { familyDAO } from '../database/dao/FamilyDAO';
import { AuthenticatedRequest } from '../middleware/auth';

export const reportController = {
  getWeeklyReport(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.childId as string);
    const report = reportService.getWeeklyReport(childId);
    res.json({ success: true, data: report });
  },

  getMonthlyReport(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.childId as string);
    const report = reportService.getMonthlyReport(childId);
    res.json({ success: true, data: report });
  },

  getBudgetStatus(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const budget = reportService.getBudgetStatus(familyId);
    res.json({ success: true, data: budget });
  },

  addBudget(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const { amount } = req.body;
    familyDAO.addBudget(familyId, amount);
    const budget = reportService.getBudgetStatus(familyId);
    res.json({ success: true, data: budget, message: '预算已追加' });
  },
};
