import api from './api'
import type { ApiResponse, BehaviorTemplate } from '../types'

export const templateApi = {
  getAll(category?: string) {
    return api.get<ApiResponse<BehaviorTemplate[]>>('/templates', { params: category ? { category } : {} })
  },
  create(data: any) {
    return api.post<ApiResponse<BehaviorTemplate>>('/templates', data)
  },
  update(id: number, data: any) {
    return api.put<ApiResponse<BehaviorTemplate>>(`/templates/${id}`, data)
  },
  delete(id: number) {
    return api.delete<ApiResponse>(`/templates/${id}`)
  },
}
