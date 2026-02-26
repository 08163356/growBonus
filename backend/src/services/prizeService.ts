import db from '../database/connection';
import { prizeDAO } from '../database/dao/PrizeDAO';
import { redemptionDAO } from '../database/dao/RedemptionDAO';
import { pointRecordDAO } from '../database/dao/PointRecordDAO';
import { familyDAO } from '../database/dao/FamilyDAO';
import { userDAO } from '../database/dao/UserDAO';

export const prizeService = {
  getAll(familyId: number) {
    return prizeDAO.findByFamilyId(familyId);
  },

  getByTier(familyId: number, tier: string) {
    return prizeDAO.findByTier(familyId, tier);
  },

  create(data: any) {
    return prizeDAO.create(data);
  },

  update(id: number, data: any) {
    return prizeDAO.update(id, data);
  },

  redeem(childId: number, prizeId: number, familyId: number) {
    const prize = prizeDAO.findById(prizeId);
    if (!prize) throw new Error('奖品不存在');
    if (!prize.is_active) throw new Error('奖品已下架');
    if (prize.stock === 0) throw new Error('奖品库存不足');

    const totalPoints = pointRecordDAO.getTotalPoints(childId);
    const usedPoints = pointRecordDAO.getUsedPoints(childId);
    const available = totalPoints - usedPoints;
    if (available < prize.points_cost) throw new Error('积分不足');

    if (prize.type === 'material' && prize.material_cost > 0) {
      const budget = familyDAO.getBudgetStatus(familyId);
      if (!budget) throw new Error('家庭信息不存在');
      if (budget.remaining < prize.material_cost) {
        throw new Error('实物奖品预算已用完，可以兑换特别奖励哦！');
      }
    }

    const doRedeem = db.transaction(() => {
      const redemption = redemptionDAO.create({
        childId,
        prizeId,
        pointsCost: prize.points_cost,
      });

      if (prize.stock > 0) {
        prizeDAO.decrementStock(prizeId);
      }

      return redemption;
    });

    return doRedeem();
  },

  getRedemptions(familyId: number) {
    return redemptionDAO.findByFamilyId(familyId);
  },

  getPendingRedemptions(familyId: number) {
    return redemptionDAO.findPendingByFamilyId(familyId);
  },

  approve(redemptionId: number, approvedBy: number) {
    const redemption = redemptionDAO.findById(redemptionId);
    if (!redemption) throw new Error('兑换记录不存在');

    const prize = prizeDAO.findById(redemption.prize_id);
    if (!prize) throw new Error('奖品不存在');

    const doApprove = db.transaction(() => {
      redemptionDAO.updateStatus(redemptionId, 'approved', approvedBy);

      if (prize.type === 'material' && prize.material_cost > 0) {
        const user = userDAO.findById(redemption.child_id);
        if (user) {
          familyDAO.addMaterialUsed(user.family_id, prize.material_cost);
        }
      }
    });

    doApprove();
  },

  reject(redemptionId: number, approvedBy: number) {
    redemptionDAO.updateStatus(redemptionId, 'rejected', approvedBy);
  },
};
