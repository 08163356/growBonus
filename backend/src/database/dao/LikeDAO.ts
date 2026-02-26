import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { Like } from '../../types';

export class LikeDAO extends BaseDAO<Like> {
  constructor() {
    super('likes');
  }

  create(pointRecordId: number, userId: number): Like | null {
    try {
      const stmt = db.prepare('INSERT INTO likes (point_record_id, user_id) VALUES (?, ?)');
      const result = stmt.run(pointRecordId, userId);
      return this.findById(result.lastInsertRowid as number)!;
    } catch {
      return null;
    }
  }

  remove(pointRecordId: number, userId: number): void {
    db.prepare('DELETE FROM likes WHERE point_record_id = ? AND user_id = ?').run(pointRecordId, userId);
  }

  isLiked(pointRecordId: number, userId: number): boolean {
    const row = db.prepare(
      'SELECT id FROM likes WHERE point_record_id = ? AND user_id = ?'
    ).get(pointRecordId, userId);
    return !!row;
  }

  getLikeCount(pointRecordId: number): number {
    const row = db.prepare(
      'SELECT COUNT(*) as count FROM likes WHERE point_record_id = ?'
    ).get(pointRecordId) as any;
    return row.count;
  }

  getLatestLikes(childId: number, limit = 5): any[] {
    return db.prepare(`
      SELECT l.*, u.name as user_name, pr.points, bt.name as template_name
      FROM likes l
      JOIN users u ON l.user_id = u.id
      JOIN point_records pr ON l.point_record_id = pr.id
      LEFT JOIN behavior_templates bt ON pr.template_id = bt.id
      WHERE pr.child_id = ?
      ORDER BY l.created_at DESC
      LIMIT ?
    `).all(childId, limit);
  }
}

export const likeDAO = new LikeDAO();
