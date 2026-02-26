import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { Prize } from '../../types';

export class PrizeDAO extends BaseDAO<Prize> {
  constructor() {
    super('prizes');
  }

  findByFamilyId(familyId: number): Prize[] {
    return db.prepare('SELECT * FROM prizes WHERE family_id = ? AND is_active = 1').all(familyId) as Prize[];
  }

  findByTier(familyId: number, tier: string): Prize[] {
    return db.prepare('SELECT * FROM prizes WHERE family_id = ? AND tier = ? AND is_active = 1').all(familyId, tier) as Prize[];
  }

  create(data: {
    familyId: number;
    name: string;
    description?: string;
    image?: string;
    images?: string;
    pointsCost: number;
    materialCost?: number;
    tier: string;
    type: string;
    stock?: number;
  }): Prize {
    const stmt = db.prepare(`
      INSERT INTO prizes (family_id, name, description, image, images, points_cost, material_cost, tier, type, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.familyId, data.name, data.description || '', data.image || '', data.images || '',
      data.pointsCost, data.materialCost || 0, data.tier, data.type, data.stock ?? -1
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<{
    name: string; description: string; image: string; images: string; pointsCost: number;
    materialCost: number; tier: string; type: string; stock: number; isActive: number;
  }>): Prize | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.image !== undefined) { fields.push('image = ?'); values.push(data.image); }
    if (data.images !== undefined) { fields.push('images = ?'); values.push(data.images); }
    if (data.pointsCost !== undefined) { fields.push('points_cost = ?'); values.push(data.pointsCost); }
    if (data.materialCost !== undefined) { fields.push('material_cost = ?'); values.push(data.materialCost); }
    if (data.tier !== undefined) { fields.push('tier = ?'); values.push(data.tier); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.stock !== undefined) { fields.push('stock = ?'); values.push(data.stock); }
    if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE prizes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  decrementStock(id: number): void {
    db.prepare('UPDATE prizes SET stock = stock - 1 WHERE id = ? AND stock > 0').run(id);
  }
}

export const prizeDAO = new PrizeDAO();
