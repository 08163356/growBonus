import { achievementDAO } from '../database/dao/AchievementDAO';
import { userAchievementDAO } from '../database/dao/UserAchievementDAO';
import { pointRecordDAO } from '../database/dao/PointRecordDAO';
import { userDAO } from '../database/dao/UserDAO';

export const achievementService = {
  getAll(familyId: number) {
    return achievementDAO.findByFamilyId(familyId);
  },

  getUnlocked(userId: number) {
    return userAchievementDAO.findByUserId(userId);
  },

  checkAndUnlock(childId: number): string[] {
    const child = userDAO.findById(childId);
    if (!child) return [];

    const achievements = achievementDAO.findByFamilyId(child.family_id);
    const newlyUnlocked: string[] = [];

    for (const achievement of achievements) {
      if (userAchievementDAO.isUnlocked(childId, achievement.id)) continue;

      let conditionMet = false;

      switch (achievement.condition_type) {
        case 'total_points': {
          const total = pointRecordDAO.getTotalPoints(childId);
          conditionMet = total >= achievement.condition_value;
          break;
        }
        case 'consecutive_days': {
          const days = pointRecordDAO.getConsecutiveDays(childId);
          conditionMet = days >= achievement.condition_value;
          break;
        }
        case 'life_count': {
          const count = pointRecordDAO.getCategoryCount(childId, 'life');
          conditionMet = count >= achievement.condition_value;
          break;
        }
        case 'learn_count': {
          const count = pointRecordDAO.getCategoryCount(childId, 'learn');
          conditionMet = count >= achievement.condition_value;
          break;
        }
        case 'social_count': {
          const count = pointRecordDAO.getCategoryCount(childId, 'social');
          conditionMet = count >= achievement.condition_value;
          break;
        }
        case 'achievement_count': {
          const count = pointRecordDAO.getCategoryCount(childId, 'achievement');
          conditionMet = count >= achievement.condition_value;
          break;
        }
        case 'total_records': {
          const records = pointRecordDAO.findByChildId(childId, 99999);
          conditionMet = records.length >= achievement.condition_value;
          break;
        }
      }

      if (conditionMet) {
        userAchievementDAO.unlock(childId, achievement.id);
        newlyUnlocked.push(achievement.name);
      }
    }

    return newlyUnlocked;
  },
};
