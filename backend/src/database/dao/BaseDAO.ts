import db from '../connection';

export class BaseDAO<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  findById(id: number): T | undefined {
    return db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id) as T | undefined;
  }

  findAll(): T[] {
    return db.prepare(`SELECT * FROM ${this.tableName}`).all() as T[];
  }

  deleteById(id: number): void {
    db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id);
  }

  count(): number {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`).get() as any;
    return row.count;
  }
}
