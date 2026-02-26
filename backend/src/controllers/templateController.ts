import { Request, Response } from 'express';
import { templateDAO } from '../database/dao/TemplateDAO';
import { AuthenticatedRequest } from '../middleware/auth';

export const templateController = {
  getAll(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const category = req.query.category as string;
    
    const templates = category 
      ? templateDAO.findByCategory(familyId, category)
      : templateDAO.findByFamilyId(familyId);
    
    res.json({ success: true, data: templates });
  },

  create(req: AuthenticatedRequest, res: Response) {
    try {
      const data = { ...req.body, familyId: req.user.family_id };
      const template = templateDAO.create(data);
      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const template = templateDAO.update(id, req.body);
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  delete(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id as string);
    templateDAO.update(id, { isActive: 0 });
    res.json({ success: true, message: '模板已删除' });
  },
};
