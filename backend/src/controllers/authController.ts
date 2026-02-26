import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { userDAO } from '../database/dao/UserDAO';

export const authController = {
  login(req: Request, res: Response) {
    const { username, password, pin, familyId } = req.body;

    // PIN 登录（孩子端）
    if (pin && familyId) {
      const result = authService.loginByPin(pin, familyId);
      if (!result) {
        res.status(401).json({ success: false, message: 'PIN码不正确' });
        return;
      }
      res.json({ success: true, data: result });
      return;
    }

    // 密码登录（大人端）
    if (!username || !password) {
      res.status(400).json({ success: false, message: '请输入用户名和密码' });
      return;
    }

    const result = authService.login(username, password);
    if (!result) {
      res.status(401).json({ success: false, message: '用户名或密码不正确' });
      return;
    }

    res.json({ success: true, data: result });
  },

  guestLogin(req: Request, res: Response) {
    const familyId = req.body.familyId || 1;
    const result = authService.guestLogin(familyId);
    res.json({ success: true, data: result });
  },

  loginChild(req: Request, res: Response) {
    const { childId, familyId } = req.body;
    if (!childId || !familyId) {
      res.status(400).json({ success: false, message: '参数不完整' });
      return;
    }
    const result = authService.loginChild(childId, familyId);
    if (!result) {
      res.status(401).json({ success: false, message: '孩子不存在' });
      return;
    }
    res.json({ success: true, data: result });
  },

  switchRole(req: AuthenticatedRequest, res: Response) {
    const { targetUserId, password } = req.body;
    if (!targetUserId) {
      res.status(400).json({ success: false, message: '请选择要切换的角色' });
      return;
    }
    const result = authService.switchRole(targetUserId, req.user.family_id, password);
    if (result.error) {
      res.status(result.status || 400).json({ success: false, message: result.error });
      return;
    }
    res.json({ success: true, data: result.data });
  },

  getFamilyMembers(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const members = authService.getFamilyMembers(familyId);
    res.json({ success: true, data: members });
  },

  getMe(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        theme: user.theme,
        familyId: user.family_id,
      },
    });
  },

  getChildren(req: AuthenticatedRequest, res: Response) {
    const familyId = req.user.family_id;
    const children = authService.getChildren(familyId);
    res.json({ success: true, data: children });
  },

  getChildrenPublic(req: Request, res: Response) {
    const familyId = parseInt(req.query.familyId as string) || 1;
    const children = authService.getChildren(familyId);
    res.json({ success: true, data: children });
  },

  updateTheme(req: AuthenticatedRequest, res: Response) {
    const { theme } = req.body;
    userDAO.updateTheme(req.user.id, theme);
    res.json({ success: true, message: '主题已更新' });
  },

  updateBackgroundImage(req: AuthenticatedRequest, res: Response) {
    const filename = req.file ? req.file.filename : '';
    userDAO.updateBackgroundImage(req.user.id, filename);
    res.json({ success: true, data: { backgroundImage: filename } });
  },

  getBackgroundImage(req: AuthenticatedRequest, res: Response) {
    const image = userDAO.getBackgroundImage(req.user.id);
    res.json({ success: true, data: { backgroundImage: image } });
  },

  addChild(req: AuthenticatedRequest, res: Response) {
    const { name, pin, avatar } = req.body;
    if (!name || !pin || pin.length !== 4) {
      res.status(400).json({ success: false, message: '请输入名字和4位PIN码' });
      return;
    }
    const result = authService.addChild(req.user.family_id, { name, pin, avatar });
    if (result.error) {
      res.status(400).json({ success: false, message: result.error });
      return;
    }
    res.json({ success: true, data: result.data });
  },

  updateChild(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.id as string);
    const { name, pin, avatar } = req.body;
    const result = authService.updateChild(childId, req.user.family_id, { name, pin, avatar });
    if (result.error) {
      res.status(400).json({ success: false, message: result.error });
      return;
    }
    res.json({ success: true, data: result.data });
  },

  deleteChild(req: AuthenticatedRequest, res: Response) {
    const childId = parseInt(req.params.id as string);
    const result = authService.deleteChild(childId, req.user.family_id);
    if (result.error) {
      res.status(400).json({ success: false, message: result.error });
      return;
    }
    res.json({ success: true, message: '已删除' });
  },
};
