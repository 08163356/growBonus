import api from './api'
import type { ApiResponse, PointRecord, PointSummary, LikeInfo } from '../types'

export const pointApi = {
  create(data: FormData) {
    return api.post<ApiResponse<PointRecord>>('/points', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getByChild(childId: number, limit = 50, offset = 0) {
    return api.get<ApiResponse<PointRecord[]>>(`/points/child/${childId}`, { params: { limit, offset } })
  },
  getSummary(childId: number) {
    return api.get<ApiResponse<PointSummary>>(`/points/summary/${childId}`)
  },
  getTodayRecords(childId: number) {
    return api.get<ApiResponse<PointRecord[]>>(`/points/today/${childId}`)
  },
  deleteRecord(id: number) {
    return api.delete<ApiResponse>(`/points/${id}`)
  },
  toggleLike(id: number) {
    return api.post<ApiResponse<{ liked: boolean; count: number }>>(`/points/${id}/like`)
  },
  getLatestLikes(childId: number) {
    return api.get<ApiResponse<LikeInfo[]>>(`/points/likes/${childId}`)
  },
}
