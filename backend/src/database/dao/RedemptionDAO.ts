import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { Redemption } from '../../types';

export class RedemptionDAO extends BaseDAO<Redemption> {
  constructor() {
    super('redemptions');
  }

  create(data: { childId: number; prizeId: number; pointsCost: number }): Redemption {
    const stmt = db.prepare(`
      INSERT INTO redemptions (child_id, prize_id, points_cost) VALUES (?, ?, ?)
    `);
    const result = stmt.run(data.childId, data.prizeId, data.pointsCost);
    return this.findById(result.lastInsertRowid as number)!;
  }

  findByChildId(childId: number): any[] {
    return db.prepare(`
      SELECT r.*, p.name as prize_name, p.image as prize_image, p.tier, p.type as prize_type
      FROM redemptions r
      JOIN prizes p ON r.prize_id = p.id
      WHERE r.child_id = ?
      ORDER BY r.created_at DESC
    `).all(childId);
  }

  findByFamilyId(familyId: number): any[] {
    return db.prepare(`
      SELECT r.*, p.name as prize_name, p.image as prize_image, p.tier, p.type as prize_type,
             u.name as child_name, u.avatar as child_avatar
      FROM redemptions r
      JOIN prizes p ON r.prize_id = p.id
      JOIN users u ON r.child_id = u.id
      WHERE u.family_id = ?
      ORDER BY r.created_at DESC
    `).all(familyId);
  }

  findPendingByFamilyId(familyId: number): any[] {
    return db.prepare(`
      SELECT r.*, p.name as prize_name, p.image as prize_image, p.tier, p.type as prize_type,
             p.material_cost, u.name as child_name, u.avatar as child_avatar
      FROM redemptions r
      JOIN prizes p ON r.prize_id = p.id
      JOIN users u ON r.child_id = u.id
      WHERE u.family_id = ? AND r.status = 'pending'
      ORDER BY r.created_at DESC
    `).all(familyId);
  }

  updateStatus(id: number, status: string, approvedBy?: number): void {
    if (approvedBy) {
      db.prepare('UPDATE redemptions SET status = ?, approved_by = ? WHERE id = ?').run(status, approvedBy, id);
    } else {
      db.prepare('UPDATE redemptions SET status = ? WHERE id = ?').run(status, id);
    }
  }
}

export const redemptionDAO = new RedemptionDAO();
