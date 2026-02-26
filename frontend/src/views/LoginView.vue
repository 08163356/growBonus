<template>
  <div class="min-h-screen flex flex-col overflow-x-hidden" style="background: var(--theme-gradient-soft)">
    <!-- 顶部装饰区域 -->
    <div class="relative pt-14 pb-6 text-center safe-top">
      <div class="text-6xl animate-float mb-3">🌞</div>
      <h1 class="text-2xl font-bold" style="color: var(--theme-primary)">GrowBonus</h1>
      <p class="text-sm mt-1.5" style="color: var(--theme-text-secondary)">宝贝成长奖励</p>
      <!-- 装饰泡泡 -->
      <div class="absolute top-8 left-6 w-4 h-4 rounded-full opacity-30 animate-float"
           style="background: var(--theme-primary); animation-delay: 0.5s"></div>
      <div class="absolute top-14 right-8 w-3 h-3 rounded-full opacity-20 animate-float"
           style="background: var(--theme-accent); animation-delay: 1s"></div>
      <div class="absolute bottom-2 left-1/4 w-5 h-5 rounded-full opacity-15 animate-float"
           style="background: var(--theme-info); animation-delay: 1.5s"></div>
    </div>

    <!-- 角色选择区域 -->
    <div class="flex-1 px-page pb-6">
      <div v-if="!selectedRole" class="space-y-4">
        <p class="text-center text-sm font-semibold mb-5" style="color: var(--theme-text-secondary)">选择你的身份</p>
        <div class="grid grid-cols-3 gap-4">
          <button v-for="role in roles" :key="role.key"
            class="card flex flex-col items-center gap-3 py-6 px-2 transition-all duration-300 active:scale-95"
            :style="{ background: role.bgColor }"
            @click="selectRole(role.key)">
            <span class="text-4xl">{{ role.icon }}</span>
            <span class="text-sm font-bold" :style="{ color: role.textColor }">{{ role.label }}</span>
          </button>
        </div>

        <!-- 游客入口 -->
        <button class="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
                style="background: var(--theme-bg-secondary); color: var(--theme-text-secondary)"
                @click="enterGuest"
                :disabled="loading">
          <span class="text-lg">👀</span>
          {{ loading ? '进入中...' : '游客模式（仅查看）' }}
        </button>
      </div>

      <!-- 选择孩子（直接进入，不需要密码） -->
      <div v-if="selectedRole === 'child'" class="mt-6 animate-slide-up">
        <button class="text-sm mb-4 flex items-center gap-1" style="color: var(--theme-text-secondary)"
                @click="selectedRole = ''">
          ← 返回选择
        </button>
        <div class="card p-6 text-center">
          <span class="text-4xl block mb-3">⭐</span>
          <h3 class="text-lg font-bold mb-1.5">选择宝贝</h3>
          <p class="text-xs mb-5" style="color: var(--theme-text-secondary)">点击头像直接进入</p>

          <div v-if="childrenList.length > 0" class="flex flex-wrap justify-center gap-4 mb-4">
            <button v-for="child in childrenList" :key="child.id"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-90 min-w-[80px]"
              style="background: var(--theme-bg-secondary)"
              @click="enterAsChild(child)"
              :disabled="loading">
              <span class="text-4xl">{{ child.avatar || '👧' }}</span>
              <span class="text-sm font-bold" style="color: var(--theme-text)">{{ child.name }}</span>
            </button>
          </div>

          <div v-else class="py-6 text-sm" style="color: var(--theme-text-light)">
            还没有宝贝，请联系管理员添加
          </div>

          <p v-if="error" class="text-sm mt-4" style="color: var(--theme-danger)">{{ error }}</p>
        </div>
      </div>

      <!-- 密码输入（大人端） -->
      <div v-if="selectedRole === 'adult'" class="mt-6 animate-slide-up">
        <button class="text-sm mb-4 flex items-center gap-1" style="color: var(--theme-text-secondary)"
                @click="selectedRole = ''">
          ← 返回选择
        </button>
        <div class="card p-6">
          <div class="text-center mb-5">
            <span class="text-4xl block mb-2">{{ adultRole === 'uncle' ? '👨‍💻' : '👨‍👩‍👧' }}</span>
            <h3 class="text-lg font-bold">{{ adultRole === 'uncle' ? '叔叔登录' : '爸爸妈妈登录' }}</h3>
          </div>

          <div class="flex gap-2 mb-5">
            <button v-for="ar in adultRoles" :key="ar.key"
              class="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
              :style="{
                background: adultRole === ar.key ? 'var(--theme-primary)' : 'var(--theme-bg-secondary)',
                color: adultRole === ar.key ? 'white' : 'var(--theme-text-secondary)',
              }"
              @click="adultRole = ar.key; username = ar.username">
              {{ ar.label }}
            </button>
          </div>

          <form @submit.prevent="handleAdultLogin">
            <input v-model="username" class="input mb-4" placeholder="用户名" autocomplete="username" />
            <input v-model="password" type="password" class="input mb-5" placeholder="密码" autocomplete="current-password" />
            <button type="submit" class="btn-primary w-full" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>

          <p v-if="error" class="text-sm mt-3 text-center" style="color: var(--theme-danger)">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="py-6 text-center safe-bottom">
      <p class="text-xs" style="color: var(--theme-text-light)">用爱陪伴成长 ❤️</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { authApi } from '../services/authService'
import type { ChildInfo } from '../types'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const selectedRole = ref('')
const adultRole = ref('uncle')
const username = ref('uncle')
const password = ref('')
const error = ref('')
const loading = ref(false)
const childrenList = ref<ChildInfo[]>([])

const roles = [
  { key: 'child', icon: '⭐', label: '宝贝', bgColor: 'linear-gradient(135deg, #FFF0F6, #FFE0F0)', textColor: '#E84393' },
  { key: 'parent', icon: '❤️', label: '爸妈', bgColor: 'linear-gradient(135deg, #E0F0FF, #D6E8FF)', textColor: '#0984E3' },
  { key: 'uncle', icon: '👑', label: '叔叔', bgColor: 'linear-gradient(135deg, #F0FFF0, #E0FFE0)', textColor: '#00B894' },
]

const adultRoles = [
  { key: 'uncle', label: '叔叔', username: 'uncle' },
  { key: 'papa', label: '爸爸', username: 'papa' },
  { key: 'mama', label: '妈妈', username: 'mama' },
]

// Pre-fetch children list for direct entry
onMounted(async () => {
  try {
    const res = await authApi.getChildrenPublic(1)
    if (res.data.success && res.data.data) {
      childrenList.value = res.data.data
    }
  } catch {
    // ignore
  }
})

function selectRole(key: string) {
  selectedRole.value = key === 'child' ? 'child' : 'adult'
  error.value = ''
  if (key === 'uncle') {
    adultRole.value = 'uncle'
    username.value = 'uncle'
  } else if (key === 'parent') {
    adultRole.value = 'papa'
    username.value = 'papa'
  }
}

async function enterAsChild(child: ChildInfo) {
  loading.value = true
  error.value = ''
  try {
    const res = await authStore.loginChild(child.id, 1)
    if (res.success) {
      themeStore.setTheme(authStore.user?.theme || 'default')
      router.replace('/child')
    } else {
      error.value = res.message || '进入失败'
    }
  } catch {
    error.value = '网络出了问题'
  } finally {
    loading.value = false
  }
}

async function enterGuest() {
  loading.value = true
  error.value = ''
  try {
    const res = await authStore.loginGuest(1)
    if (res.success) {
      await authStore.fetchChildren()
      router.replace('/admin')
    } else {
      error.value = res.message || '进入失败'
    }
  } catch {
    error.value = '网络出了问题'
  } finally {
    loading.value = false
  }
}

async function handleAdultLogin() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await authStore.login(username.value, password.value)
    if (res.success) {
      await authStore.fetchChildren()
      router.replace('/admin')
    } else {
      error.value = res.message || '登录失败'
    }
  } catch {
    error.value = '网络出了问题'
  } finally {
    loading.value = false
  }
}
</script>
