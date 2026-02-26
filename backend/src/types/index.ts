export enum UserRole {
  ADMIN = 'admin',
  PARENT = 'parent',
  CHILD = 'child',
}

export enum BehaviorCategory {
  LIFE = 'life',
  LEARN = 'learn',
  SOCIAL = 'social',
  ACHIEVEMENT = 'achievement',
}

export enum PrizeTier {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  SUPER = 'super',
}

export enum PrizeType {
  MATERIAL = 'material',
  VIRTUAL = 'virtual',
}

export enum RedemptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled',
}

// All interfaces use snake_case to match SQLite column names
export interface Family {
  id: number;
  name: string;
  material_budget: number;
  material_used: number;
  created_at: string;
}

export interface User {
  id: number;
  family_id: number;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  avatar: string;
  pin: string;
  theme: string;
  status: string;
  created_at: string;
}

export interface BehaviorTemplate {
  id: number;
  family_id: number;
  name: string;
  category: string;
  points: number;
  icon: string;
  description: string;
  is_active: number;
}

export interface PointRecord {
  id: number;
  child_id: number;
  template_id: number;
  points: number;
  note: string;
  encouragement: string;
  photo_url: string;
  created_by: number;
  created_at: string;
}

export interface Prize {
  id: number;
  family_id: number;
  name: string;
  description: string;
  image: string;
  points_cost: number;
  material_cost: number;
  tier: string;
  type: string;
  stock: number;
  is_active: number;
}

export interface Redemption {
  id: number;
  child_id: number;
  prize_id: number;
  points_cost: number;
  status: string;
  approved_by: number | null;
  created_at: string;
}

export interface Achievement {
  id: number;
  family_id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  unlocked_at: string;
}

export interface Like {
  id: number;
  point_record_id: number;
  user_id: number;
  created_at: string;
}

export interface JwtPayload {
  id: number;
  role: string;
  familyId: number;
}

export interface IFileStorage {
  save(file: Express.Multer.File): Promise<string>;
  delete(filePath: string): Promise<void>;
  getUrl(filePath: string): string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
