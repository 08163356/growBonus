import db from '../connection';
import { BaseDAO } from './BaseDAO';
import { User } from '../../types';

export class UserDAO extends BaseDAO<User> {
  constructor() {
    super('users');
  }

  findByUsername(username: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  }

  findByFamilyId(familyId: number): User[] {
    return db.prepare('SELECT * FROM users WHERE family_id = ?').all(familyId) as User[];
  }

  findChildrenByFamilyId(familyId: number): User[] {
    return db.prepare('SELECT * FROM users WHERE family_id = ? AND role = ?').all(familyId, 'child') as User[];
  }

  findByFamilyAndRole(familyId: number, role: string): User[] {
    return db.prepare('SELECT * FROM users WHERE family_id = ? AND role = ?').all(familyId, role) as User[];
  }

  create(data: {
    familyId: number;
    username: string;
    passwordHash: string;
    name: string;
    role: string;
    avatar?: string;
    pin?: string;
  }): User {
    const stmt = db.prepare(`
      INSERT INTO users (family_id, username, password_hash, name, role, avatar, pin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.familyId,
      data.username,
      data.passwordHash,
      data.name,
      data.role,
      data.avatar || '',
      data.pin || ''
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  updateTheme(userId: number, theme: string): void {
    db.prepare('UPDATE users SET theme = ? WHERE id = ?').run(theme, userId);
  }

  updateAvatar(userId: number, avatar: string): void {
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, userId);
  }

  updateChild(id: number, data: { name?: string; avatar?: string; pin?: string }): void {
    const sets: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name); }
    if (data.avatar !== undefined) { sets.push('avatar = ?'); values.push(data.avatar); }
    if (data.pin !== undefined) { sets.push('pin = ?'); values.push(data.pin); }
    if (sets.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ? AND role = 'child'`).run(...values);
  }

  deleteChild(id: number): void {
    db.prepare("DELETE FROM users WHERE id = ? AND role = 'child'").run(id);
  }

  updateBackgroundImage(userId: number, image: string): void {
    db.prepare('UPDATE users SET background_image = ? WHERE id = ?').run(image, userId);
  }

  getBackgroundImage(userId: number): string {
    const row = db.prepare('SELECT background_image FROM users WHERE id = ?').get(userId) as any;
    return row?.background_image || '';
  }
}

export const userDAO = new UserDAO();
