<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="routeKey" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const routeKey = computed(() => `${route.fullPath}-${authStore.user?.id ?? 'none'}`)

onMounted(() => {
  themeStore.initTheme()
  if (authStore.isLoggedIn) {
    // 登录后设置背景 from user data
    if (authStore.user?.backgroundImage) {
      themeStore.setBackgroundImage(authStore.user.backgroundImage)
    }
    themeStore.loadBackground()
  }
})

// 登录/登出时同步背景
watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    if (authStore.user?.backgroundImage) {
      themeStore.setBackgroundImage(authStore.user.backgroundImage)
    }
    themeStore.loadBackground()
  } else {
    themeStore.clearBackground()
  }
})
</script>
