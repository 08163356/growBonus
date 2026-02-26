import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { PointRecord } from '../../types';

export class PointRecordDAO extends BaseDAO<PointRecord> {
  constructor() {
    super('point_records');
  }

  create(data: {
    childId: number;
    templateId?: number;
    points: number;
    note?: string;
    encouragement?: string;
    photoUrl?: string;
    createdBy: number;
  }): PointRecord {
    const stmt = db.prepare(`
      INSERT INTO point_records (child_id, template_id, points, note, encouragement, photo_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.childId,
      data.templateId || null,
      data.points,
      data.note || '',
      data.encouragement || '',
      data.photoUrl || '',
      data.createdBy
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  findByChildId(childId: number, limit = 50, offset = 0): PointRecord[] {
    return db.prepare(
      'SELECT * FROM point_records WHERE child_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(childId, limit, offset) as PointRecord[];
  }

  findByChildIdWithDetails(childId: number, limit = 50, offset = 0): any[] {
    return db.prepare(`
      SELECT pr.*, bt.name as template_name, bt.category, bt.icon as template_icon,
             u.name as created_by_name,
             (SELECT COUNT(*) FROM likes WHERE point_record_id = pr.id) as like_count
      FROM point_records pr
      LEFT JOIN behavior_templates bt ON pr.template_id = bt.id
      LEFT JOIN users u ON pr.created_by = u.id
      WHERE pr.child_id = ?
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `).all(childId, limit, offset);
  }

  getTotalPoints(childId: number): number {
    const row = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM point_records WHERE child_id = ?').get(childId) as any;
    return row.total;
  }

  getUsedPoints(childId: number): number {
    const row = db.prepare(`
      SELECT COALESCE(SUM(points_cost), 0) as total 
      FROM redemptions 
      WHERE child_id = ? AND status IN ('approved', 'fulfilled', 'pending')
    `).get(childId) as any;
    return row.total;
  }

  getTodayRecords(childId: number): PointRecord[] {
    return db.prepare(`
      SELECT pr.*, bt.name as template_name, bt.category, bt.icon as template_icon
      FROM point_records pr
      LEFT JOIN behavior_templates bt ON pr.template_id = bt.id
      WHERE pr.child_id = ? AND date(pr.created_at) = date('now', 'localtime')
      ORDER BY pr.created_at DESC
    `).all(childId) as PointRecord[];
  }

  getDateRangeSummary(childId: number, startDate: string, endDate: string): any[] {
    return db.prepare(`
      SELECT date(created_at, 'localtime') as date, SUM(points) as total_points, COUNT(*) as count
      FROM point_records
      WHERE child_id = ? AND date(created_at, 'localtime') >= ? AND date(created_at, 'localtime') <= ?
      GROUP BY date(created_at, 'localtime')
      ORDER BY date(created_at, 'localtime')
    `).all(childId, startDate, endDate);
  }

  getCategorySummary(childId: number, startDate: string, endDate: string): any[] {
    return db.prepare(`
      SELECT bt.category, SUM(pr.points) as total_points, COUNT(*) as count
      FROM point_records pr
      LEFT JOIN behavior_templates bt ON pr.template_id = bt.id
      WHERE pr.child_id = ? AND date(pr.created_at, 'localtime') >= ? AND date(pr.created_at, 'localtime') <= ?
      GROUP BY bt.category
    `).all(childId, startDate, endDate);
  }

  getConsecutiveDays(childId: number): number {
    const records = db.prepare(`
      SELECT DISTINCT date(created_at) as record_date
      FROM point_records
      WHERE child_id = ?
      ORDER BY record_date DESC
    `).all(childId) as any[];

    if (records.length === 0) return 0;

    let consecutive = 1;
    const today = new Date().toISOString().split('T')[0];
    
    if (records[0].record_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (records[0].record_date !== yesterday) return 0;
    }

    for (let i = 1; i < records.length; i++) {
      const curr = new Date(records[i - 1].record_date);
      const prev = new Date(records[i].record_date);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        consecutive++;
      } else {
        break;
      }
    }

    return consecutive;
  }

  getCategoryCount(childId: number, category: string): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count
      FROM point_records pr
      JOIN behavior_templates bt ON pr.template_id = bt.id
      WHERE pr.child_id = ? AND bt.category = ?
    `).get(childId, category) as any;
    return row.count;
  }
}

export const pointRecordDAO = new PointRecordDAO();
