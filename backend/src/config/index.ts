import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8003', 10),
  jwtSecret: process.env.JWT_SECRET || 'growbonus_secret_key_2024',
  dbPath: process.env.DB_PATH || './data/growbonus.db',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  jwtExpiresIn: '30d',
};
