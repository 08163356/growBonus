import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { Achievement } from '../../types';

export class AchievementDAO extends BaseDAO<Achievement> {
  constructor() {
    super('achievements');
  }

  findByFamilyId(familyId: number): Achievement[] {
    return db.prepare('SELECT * FROM achievements WHERE family_id = ?').all(familyId) as Achievement[];
  }
}

export const achievementDAO = new AchievementDAO();
