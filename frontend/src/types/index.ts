// ===== 角色与枚举 =====
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

export enum ThemeName {
  DEFAULT = 'default',
  PRINCESS = 'princess',
  ADVENTURE = 'adventure',
}

// ===== 接口 =====
export interface User {
  id: number
  name: string
  role: string
  avatar: string
  theme: string
  familyId: number
  backgroundImage?: string
}

export interface ChildInfo {
  id: number
  name: string
  avatar: string
  theme: string
}

export interface BehaviorTemplate {
  id: number
  family_id: number
  name: string
  category: string
  points: number
  icon: string
  description: string
  is_active: number
}

export interface PointRecord {
  id: number
  child_id: number
  template_id: number
  points: number
  note: string
  encouragement: string
  photo_url: string
  created_by: number
  created_at: string
  template_name?: string
  category?: string
  template_icon?: string
  created_by_name?: string
  like_count?: number
}

export interface PointSummary {
  totalPoints: number
  usedPoints: number
  availablePoints: number
  consecutiveDays: number
}

export interface Prize {
  id: number
  family_id: number
  name: string
  description: string
  image: string
  points_cost: number
  material_cost: number
  tier: string
  type: string
  stock: number
  is_active: number
}

export interface Redemption {
  id: number
  child_id: number
  prize_id: number
  points_cost: number
  status: string
  approved_by: number | null
  created_at: string
  prize_name?: string
  prize_image?: string
  tier?: string
  prize_type?: string
  material_cost?: number
  child_name?: string
  child_avatar?: string
}

export interface Achievement {
  id: number
  family_id: number
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
}

export interface UserAchievement {
  id: number
  user_id: number
  achievement_id: number
  unlocked_at: string
  name: string
  description: string
  icon: string
}

export interface BudgetStatus {
  materialBudget: number
  materialUsed: number
  remaining: number
}

export interface ReportData {
  period: string
  startDate: string
  endDate: string
  totalPoints: number
  changePercent: number
  dailyData: { date: string; total_points: number; count: number }[]
  categoryData: { category: string; total_points: number; count: number }[]
}

export interface LikeInfo {
  id: number
  user_name: string
  points: number
  template_name: string
  created_at: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface LoginResponse {
  token: string
  user: User
}
