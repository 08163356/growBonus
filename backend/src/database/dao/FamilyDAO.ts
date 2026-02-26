import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { Family } from '../../types';

export class FamilyDAO extends BaseDAO<Family> {
  constructor() {
    super('families');
  }

  create(data: { name: string; materialBudget?: number }): Family {
    const stmt = db.prepare(`
      INSERT INTO families (name, material_budget) VALUES (?, ?)
    `);
    const result = stmt.run(data.name, data.materialBudget || 3000);
    return this.findById(result.lastInsertRowid as number)!;
  }

  getBudgetStatus(familyId: number): { materialBudget: number; materialUsed: number; remaining: number } | undefined {
    const family = db.prepare('SELECT material_budget, material_used FROM families WHERE id = ?').get(familyId) as any;
    if (!family) return undefined;
    return {
      materialBudget: family.material_budget,
      materialUsed: family.material_used,
      remaining: family.material_budget - family.material_used,
    };
  }

  addMaterialUsed(familyId: number, amount: number): void {
    db.prepare('UPDATE families SET material_used = material_used + ? WHERE id = ?').run(amount, familyId);
  }

  addBudget(familyId: number, amount: number): void {
    db.prepare('UPDATE families SET material_budget = material_budget + ? WHERE id = ?').run(amount, familyId);
  }
}

export const familyDAO = new FamilyDAO();
