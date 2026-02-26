import db from '../database/connection';
import { pointRecordDAO } from '../database/dao/PointRecordDAO';
import { achievementService } from './achievementService';

export const pointService = {
  createRecord(data: {
    childId: number;
    templateId?: number;
    points: number;
    note?: string;
    encouragement?: string;
    photoUrl?: string;
    createdBy: number;
  }) {
    const record = pointRecordDAO.create(data);
    // 异步检测成就
    try {
      achievementService.checkAndUnlock(data.childId);
    } catch (e) {
      console.error('Achievement check failed:', e);
    }
    return record;
  },

  getRecords(childId: number, limit = 50, offset = 0) {
    return pointRecordDAO.findByChildIdWithDetails(childId, limit, offset);
  },

  getTodayRecords(childId: number) {
    return pointRecordDAO.getTodayRecords(childId);
  },

  getSummary(childId: number) {
    const totalPoints = pointRecordDAO.getTotalPoints(childId);
    const usedPoints = pointRecordDAO.getUsedPoints(childId);
    const availablePoints = totalPoints - usedPoints;
    const consecutiveDays = pointRecordDAO.getConsecutiveDays(childId);

    return {
      totalPoints,
      usedPoints,
      availablePoints,
      consecutiveDays,
    };
  },

  deleteRecord(recordId: number) {
    pointRecordDAO.deleteById(recordId);
  },
};
