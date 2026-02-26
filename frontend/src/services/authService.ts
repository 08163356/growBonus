import api from './api'
import type { ApiResponse, LoginResponse, ChildInfo } from '../types'

interface FamilyMember {
  id: number
  name: string
  role: string
  avatar: string
}

export const authApi = {
  login(username: string, password: string) {
    return api.post<ApiResponse<LoginResponse>>('/auth/login', { username, password })
  },
  loginByPin(pin: string, familyId: number) {
    return api.post<ApiResponse<LoginResponse>>('/auth/login', { pin, familyId })
  },
  loginChild(childId: number, familyId: number) {
    return api.post<ApiResponse<LoginResponse>>('/auth/login-child', { childId, familyId })
  },
  guestLogin(familyId: number = 1) {
    return api.post<ApiResponse<LoginResponse>>('/auth/guest', { familyId })
  },
  switchRole(targetUserId: number, password?: string) {
    return api.post<ApiResponse<LoginResponse>>('/auth/switch-role', { targetUserId, password })
  },
  getFamilyMembers() {
    return api.get<ApiResponse<FamilyMember[]>>('/auth/family-members')
  },
  getChildrenPublic(familyId: number = 1) {
    return api.get<ApiResponse<ChildInfo[]>>(`/auth/children-public?familyId=${familyId}`)
  },
  getMe() {
    return api.get<ApiResponse>('/auth/me')
  },
  getChildren() {
    return api.get<ApiResponse<ChildInfo[]>>('/auth/children')
  },
  addChild(data: { name: string; pin: string; avatar?: string }) {
    return api.post<ApiResponse<ChildInfo>>('/auth/children', data)
  },
  updateChild(id: number, data: { name?: string; pin?: string; avatar?: string }) {
    return api.put<ApiResponse<ChildInfo>>(`/auth/children/${id}`, data)
  },
  deleteChild(id: number) {
    return api.delete<ApiResponse>(`/auth/children/${id}`)
  },
  updateTheme(theme: string) {
    return api.put<ApiResponse>('/auth/theme', { theme })
  },
  updateBackground(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    return api.put<ApiResponse<{ backgroundImage: string }>>('/auth/background', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getBackground() {
    return api.get<ApiResponse<{ backgroundImage: string }>>('/auth/background')
  },
}
