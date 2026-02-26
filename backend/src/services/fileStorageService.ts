import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { IFileStorage } from '../types';

export class LocalFileStorage implements IFileStorage {
  async save(file: Express.Multer.File): Promise<string> {
    return file.filename;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(config.uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }
}

export const fileStorage = new LocalFileStorage();
