import db from './connection';

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      material_budget INTEGER NOT NULL DEFAULT 3000,
      material_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'parent', 'child')),
      avatar TEXT DEFAULT '',
      pin TEXT DEFAULT '',
      theme TEXT DEFAULT 'default',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS behavior_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('life', 'learn', 'social', 'achievement')),
      points INTEGER NOT NULL,
      icon TEXT DEFAULT '⭐',
      description TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS point_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL,
      template_id INTEGER,
      points INTEGER NOT NULL,
      note TEXT DEFAULT '',
      encouragement TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (child_id) REFERENCES users(id),
      FOREIGN KEY (template_id) REFERENCES behavior_templates(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS prizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      points_cost INTEGER NOT NULL,
      material_cost INTEGER NOT NULL DEFAULT 0,
      tier TEXT NOT NULL CHECK(tier IN ('small', 'medium', 'large', 'super')),
      type TEXT NOT NULL CHECK(type IN ('material', 'virtual')),
      stock INTEGER NOT NULL DEFAULT -1,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL,
      prize_id INTEGER NOT NULL,
      points_cost INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'fulfilled')),
      approved_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (child_id) REFERENCES users(id),
      FOREIGN KEY (prize_id) REFERENCES prizes(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '🏅',
      condition_type TEXT NOT NULL,
      condition_value INTEGER NOT NULL,
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      unlocked_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id),
      UNIQUE(user_id, achievement_id)
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_record_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (point_record_id) REFERENCES point_records(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(point_record_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_point_records_child_date ON point_records(child_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_point_records_created_by ON point_records(created_by);
    CREATE INDEX IF NOT EXISTS idx_redemptions_child ON redemptions(child_id);
    CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
    CREATE INDEX IF NOT EXISTS idx_users_family ON users(family_id);
    CREATE INDEX IF NOT EXISTS idx_templates_family ON behavior_templates(family_id);
    CREATE INDEX IF NOT EXISTS idx_prizes_family ON prizes(family_id);
  `);

  // 迁移：添加 background_image 字段
  try {
    db.prepare("SELECT background_image FROM users LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE users ADD COLUMN background_image TEXT DEFAULT ''");
  }

  console.log('Database initialized successfully');
}
