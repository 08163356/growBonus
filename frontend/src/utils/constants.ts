import { BehaviorCategory, PrizeTier, ThemeName } from '../types'

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  [BehaviorCategory.LIFE]: { label: '生活习惯', color: '#00B894', icon: '🏠' },
  [BehaviorCategory.LEARN]: { label: '学习技能', color: '#74B9FF', icon: '📚' },
  [BehaviorCategory.SOCIAL]: { label: '社交品格', color: '#FF9F43', icon: '🌈' },
  [BehaviorCategory.ACHIEVEMENT]: { label: '特别成就', color: '#A29BFE', icon: '🏆' },
}

export const TIER_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  [PrizeTier.SMALL]: { label: '小奖', emoji: '🎀', color: '#FDCB6E' },
  [PrizeTier.MEDIUM]: { label: '中奖', emoji: '🎁', color: '#FF9F43' },
  [PrizeTier.LARGE]: { label: '大奖', emoji: '🌟', color: '#FF6B6B' },
  [PrizeTier.SUPER]: { label: '超级奖', emoji: '👑', color: '#A29BFE' },
}

export const LEVEL_CONFIG = [
  { name: '小种子', minPoints: 0, emoji: '🌱' },
  { name: '小芽芽', minPoints: 50, emoji: '🌿' },
  { name: '小树苗', minPoints: 150, emoji: '🌳' },
  { name: '大树', minPoints: 350, emoji: '🌲' },
  { name: '开花啦', minPoints: 600, emoji: '🌸' },
  { name: '结果啦', minPoints: 1000, emoji: '🍎' },
]

export const THEME_CONFIG: Record<string, { label: string; primary: string; bg: string; accent: string }> = {
  [ThemeName.DEFAULT]: { label: '阳光卡通', primary: '#FF9F43', bg: '#FFF9F0', accent: '#FECA57' },
  [ThemeName.PRINCESS]: { label: '粉色公主', primary: '#E84393', bg: '#FFF0F6', accent: '#FD79A8' },
  [ThemeName.ADVENTURE]: { label: '蓝色冒险', primary: '#0984E3', bg: '#F0F8FF', accent: '#74B9FF' },
}

export function getLevel(points: number) {
  let level = LEVEL_CONFIG[0]
  for (const l of LEVEL_CONFIG) {
    if (points >= l.minPoints) level = l
    else break
  }
  return level
}

export function getNextLevel(points: number) {
  for (const l of LEVEL_CONFIG) {
    if (points < l.minPoints) return l
  }
  return null
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
