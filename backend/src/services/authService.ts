import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userDAO } from '../database/dao/UserDAO';

function generateToken(payload: { id: number; role: string; familyId: number }) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '30d' as any });
}

function formatUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    theme: user.theme,
    familyId: user.family_id,
    backgroundImage: user.background_image || '',
  };
}

export const authService = {
  login(username: string, password: string) {
    const user = userDAO.findByUsername(username);
    if (!user) return null;

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) return null;

    return {
      token: generateToken({ id: user.id, role: user.role, familyId: user.family_id }),
      user: formatUser(user),
    };
  },

  loginByPin(pin: string, familyId: number) {
    const children = userDAO.findChildrenByFamilyId(familyId);
    const child = children.find(c => c.pin === pin);
    if (!child) return null;

    return {
      token: generateToken({ id: child.id, role: child.role, familyId: child.family_id }),
      user: formatUser(child),
    };
  },

  loginChild(childId: number, familyId: number) {
    const child = userDAO.findById(childId);
    if (!child || child.role !== 'child' || child.family_id !== familyId) return null;

    return {
      token: generateToken({ id: child.id, role: child.role, familyId: child.family_id }),
      user: formatUser(child),
    };
  },

  guestLogin(familyId: number) {
    const token = generateToken({ id: 0, role: 'guest', familyId });
    return {
      token,
      user: {
        id: 0,
        name: '游客',
        role: 'guest',
        avatar: '👀',
        theme: 'default',
        familyId,
        backgroundImage: '',
      },
    };
  },

  switchRole(targetUserId: number, familyId: number, password?: string) {
    const targetUser = userDAO.findById(targetUserId);
    if (!targetUser || targetUser.family_id !== familyId) {
      return { error: '用户不存在', status: 404 };
    }

    // Children can switch directly without password
    if (targetUser.role === 'child') {
      return {
        data: {
          token: generateToken({ id: targetUser.id, role: targetUser.role, familyId: targetUser.family_id }),
          user: formatUser(targetUser),
        },
      };
    }

    // Adults require password
    if (!password) {
      return { error: '请输入密码', status: 401 };
    }
    const isMatch = bcrypt.compareSync(password, targetUser.password_hash);
    if (!isMatch) {
      return { error: '密码不正确', status: 401 };
    }

    return {
      data: {
        token: generateToken({ id: targetUser.id, role: targetUser.role, familyId: targetUser.family_id }),
        user: formatUser(targetUser),
      },
    };
  },

  getFamilyMembers(familyId: number) {
    const allUsers = userDAO.findByFamilyId(familyId);
    return allUsers.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
    }));
  },

  getChildren(familyId: number) {
    return userDAO.findChildrenByFamilyId(familyId).map(c => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      theme: c.theme,
    }));
  },

  addChild(familyId: number, data: { name: string; pin: string; avatar?: string }) {
    const existing = userDAO.findChildrenByFamilyId(familyId);
    const pinExists = existing.find(c => c.pin === data.pin);
    if (pinExists) return { error: 'PIN码已被使用' };

    const child = userDAO.create({
      familyId,
      username: `child_${Date.now()}`,
      passwordHash: '',
      name: data.name,
      role: 'child',
      avatar: data.avatar || '👧',
      pin: data.pin,
    });
    return { data: { id: child.id, name: child.name, avatar: child.avatar, theme: child.theme } };
  },

  updateChild(childId: number, familyId: number, data: { name?: string; pin?: string; avatar?: string }) {
    const child = userDAO.findById(childId);
    if (!child || child.role !== 'child' || child.family_id !== familyId) {
      return { error: '孩子不存在' };
    }
    if (data.pin) {
      const siblings = userDAO.findChildrenByFamilyId(familyId);
      const pinExists = siblings.find(c => c.pin === data.pin && c.id !== childId);
      if (pinExists) return { error: 'PIN码已被使用' };
    }
    userDAO.updateChild(childId, data);
    const updated = userDAO.findById(childId);
    return { data: { id: updated!.id, name: updated!.name, avatar: updated!.avatar, theme: updated!.theme } };
  },

  deleteChild(childId: number, familyId: number) {
    const child = userDAO.findById(childId);
    if (!child || child.role !== 'child' || child.family_id !== familyId) {
      return { error: '孩子不存在' };
    }
    userDAO.deleteChild(childId);
    return { success: true };
  },
};
