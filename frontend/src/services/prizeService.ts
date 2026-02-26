import api from './api'
import type { ApiResponse, Prize, Redemption } from '../types'

export const prizeApi = {
  getAll() {
    return api.get<ApiResponse<Prize[]>>('/prizes')
  },
  create(data: FormData) {
    return api.post<ApiResponse<Prize>>('/prizes', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  update(id: number, data: FormData) {
    return api.put<ApiResponse<Prize>>(`/prizes/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  redeem(prizeId: number) {
    return api.post<ApiResponse<Redemption>>('/prizes/redeem', { prizeId })
  },
  getRedemptions() {
    return api.get<ApiResponse<Redemption[]>>('/prizes/redemptions')
  },
  getPendingRedemptions() {
    return api.get<ApiResponse<Redemption[]>>('/prizes/redemptions/pending')
  },
  approve(id: number) {
    return api.put<ApiResponse>(`/prizes/redemptions/${id}/approve`)
  },
  reject(id: number) {
    return api.put<ApiResponse>(`/prizes/redemptions/${id}/reject`)
  },
}
