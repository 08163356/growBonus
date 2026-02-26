import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userDAO } from '../database/dao/UserDAO';
import { JwtPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: '未登录，请先登录' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Guest mode: virtual user, no DB lookup
    if (decoded.role === 'guest') {
      req.user = {
        id: 0,
        family_id: decoded.familyId,
        username: 'guest',
        password_hash: '',
        name: '游客',
        role: 'guest',
        avatar: '👀',
        pin: '',
        theme: 'default',
        status: 'active',
        created_at: '',
      };
      next();
      return;
    }

    const user = userDAO.findById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: '用户不存在' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: '认证无效，请重新登录' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(403).json({ success: false, message: '无权限执行此操作' });
      return;
    }
    // Guest can pass authorize checks (will be blocked by rejectGuest on mutations)
    if (req.user.role === 'guest') {
      next();
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: '无权限执行此操作' });
      return;
    }
    next();
  };
};

export const rejectGuest = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'guest') {
    res.status(403).json({ success: false, message: '游客模式下无法执行此操作' });
    return;
  }
  next();
};
