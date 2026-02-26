import api from './api'
import type { ApiResponse, Achievement, UserAchievement } from '../types'

export const achievementApi = {
  getAll() {
    return api.get<ApiResponse<Achievement[]>>('/achievements')
  },
  getUnlocked(childId: number) {
    return api.get<ApiResponse<UserAchievement[]>>(`/achievements/unlocked/${childId}`)
  },
}
