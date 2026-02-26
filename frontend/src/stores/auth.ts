import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../services/authService'
import type { User, ChildInfo } from '../types'

export interface FamilyMember {
  id: number
  name: string
  role: string
  avatar: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('gb_token') || '')
  const user = ref<User | null>(JSON.parse(localStorage.getItem('gb_user') || 'null'))
  const children = ref<ChildInfo[]>([])
  const selectedChildId = ref<number>(parseInt(localStorage.getItem('gb_selected_child') || '0'))
  const familyMembers = ref<FamilyMember[]>([])

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isChild = computed(() => user.value?.role === 'child')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isParent = computed(() => user.value?.role === 'parent')
  const isGuest = computed(() => user.value?.role === 'guest')
  const isAdult = computed(() => user.value?.role === 'admin' || user.value?.role === 'parent')

  const currentChild = computed(() => {
    if (isChild.value) return user.value
    return children.value.find(c => c.id === selectedChildId.value) || children.value[0] || null
  })

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password)
    if (res.data.success && res.data.data) {
      setAuth(res.data.data.token, res.data.data.user)
    }
    return res.data
  }

  async function loginByPin(pin: string, familyId: number) {
    const res = await authApi.loginByPin(pin, familyId)
    if (res.data.success && res.data.data) {
      setAuth(res.data.data.token, res.data.data.user)
    }
    return res.data
  }

  async function loginChild(childId: number, familyId: number) {
    const res = await authApi.loginChild(childId, familyId)
    if (res.data.success && res.data.data) {
      setAuth(res.data.data.token, res.data.data.user)
    }
    return res.data
  }

  async function loginGuest(familyId: number = 1) {
    const res = await authApi.guestLogin(familyId)
    if (res.data.success && res.data.data) {
      setAuth(res.data.data.token, res.data.data.user)
    }
    return res.data
  }

  async function switchRole(targetUserId: number, password?: string) {
    const res = await authApi.switchRole(targetUserId, password)
    if (res.data.success && res.data.data) {
      setAuth(res.data.data.token, res.data.data.user)
    }
    return res.data
  }

  async function fetchFamilyMembers() {
    try {
      const res = await authApi.getFamilyMembers()
      if (res.data.success && res.data.data) {
        familyMembers.value = res.data.data
      }
    } catch {
      // ignore
    }
  }

  function setAuth(t: string, u: User) {
    token.value = t
    user.value = u
    localStorage.setItem('gb_token', t)
    localStorage.setItem('gb_user', JSON.stringify(u))
  }

  async function fetchChildren() {
    const res = await authApi.getChildren()
    if (res.data.success && res.data.data) {
      children.value = res.data.data
      if (!selectedChildId.value && children.value.length > 0) {
        selectChild(children.value[0].id)
      }
    }
  }

  function selectChild(childId: number) {
    selectedChildId.value = childId
    localStorage.setItem('gb_selected_child', String(childId))
  }

  function logout() {
    token.value = ''
    user.value = null
    children.value = []
    selectedChildId.value = 0
    familyMembers.value = []
    localStorage.removeItem('gb_token')
    localStorage.removeItem('gb_user')
    localStorage.removeItem('gb_selected_child')
  }

  return {
    token, user, children, selectedChildId, familyMembers,
    isLoggedIn, isChild, isAdmin, isParent, isGuest, isAdult, currentChild,
    login, loginByPin, loginChild, loginGuest, switchRole, fetchFamilyMembers,
    setAuth, fetchChildren, selectChild, logout,
  }
})
