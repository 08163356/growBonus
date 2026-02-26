import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { BehaviorTemplate } from '../../types';

export class TemplateDAO extends BaseDAO<BehaviorTemplate> {
  constructor() {
    super('behavior_templates');
  }

  findByFamilyId(familyId: number): BehaviorTemplate[] {
    return db.prepare('SELECT * FROM behavior_templates WHERE family_id = ? AND is_active = 1').all(familyId) as BehaviorTemplate[];
  }

  findByCategory(familyId: number, category: string): BehaviorTemplate[] {
    return db.prepare('SELECT * FROM behavior_templates WHERE family_id = ? AND category = ? AND is_active = 1').all(familyId, category) as BehaviorTemplate[];
  }

  create(data: {
    familyId: number;
    name: string;
    category: string;
    points: number;
    icon?: string;
    description?: string;
  }): BehaviorTemplate {
    const stmt = db.prepare(`
      INSERT INTO behavior_templates (family_id, name, category, points, icon, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.familyId, data.name, data.category, data.points,
      data.icon || '⭐', data.description || ''
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<{ name: string; category: string; points: number; icon: string; description: string; isActive: number }>): BehaviorTemplate | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.points !== undefined) { fields.push('points = ?'); values.push(data.points); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE behavior_templates SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }
}

export const templateDAO = new TemplateDAO();
