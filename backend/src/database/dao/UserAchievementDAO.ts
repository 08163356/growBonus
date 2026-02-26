import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { UserAchievement } from '../../types';

export class UserAchievementDAO extends BaseDAO<UserAchievement> {
  constructor() {
    super('user_achievements');
  }

  findByUserId(userId: number): any[] {
    return db.prepare(`
      SELECT ua.*, a.name, a.description, a.icon, a.condition_type, a.condition_value
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `).all(userId);
  }

  isUnlocked(userId: number, achievementId: number): boolean {
    const row = db.prepare(
      'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).get(userId, achievementId);
    return !!row;
  }

  unlock(userId: number, achievementId: number): UserAchievement {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)
    `);
    stmt.run(userId, achievementId);
    const row = db.prepare(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).get(userId, achievementId) as UserAchievement;
    return row;
  }
}

export const userAchievementDAO = new UserAchievementDAO();
