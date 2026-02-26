<template>
  <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bottom-nav-glass"
       style="background: var(--theme-bg-card); box-shadow: 0 -2px 20px rgba(0,0,0,0.08); border-radius: 24px 24px 0 0;">
    <div class="flex items-center justify-around py-2.5 px-4 safe-bottom">
      <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path"
        class="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 no-underline"
        :class="isActive(tab.path) ? 'scale-105' : 'opacity-60'"
      >
        <div class="text-2xl transition-transform duration-300"
             :class="isActive(tab.path) ? 'scale-110' : ''">
          {{ tab.icon }}
        </div>
        <span class="text-xs font-semibold transition-colors"
              :style="isActive(tab.path) ? { color: 'var(--theme-primary)' } : { color: 'var(--theme-text-light)' }">
          {{ tab.label }}
        </span>
        <div v-if="isActive(tab.path)" class="w-1.5 h-1.5 rounded-full mt-0.5"
             style="background: var(--theme-primary)"></div>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const tabs = computed(() => {
  if (authStore.isChild) {
    return [
      { path: '/child', icon: '🏠', label: '首页' },
      { path: '/child/achievements', icon: '🏆', label: '成就' },
      { path: '/child/shop', icon: '🎁', label: '商城' },
    ]
  }
  // Guest sees admin tabs (read-only)
  return [
    { path: '/admin', icon: '⭐', label: '录入' },
    { path: '/admin/manage', icon: '⚙️', label: '管理' },
    { path: '/admin/report', icon: '📊', label: '报告' },
  ]
})

function isActive(path: string) {
  return route.path === path
}
</script>
