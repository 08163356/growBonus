<template>
  <select
    :value="themeStore.currentTheme"
    @change="selectTheme(($event.target as HTMLSelectElement).value)"
    class="px-4 py-2.5 rounded-2xl text-sm font-semibold cursor-pointer border-2 outline-none transition-all"
    :style="{
      background: 'var(--theme-bg-secondary)',
      color: 'var(--theme-text)',
      borderColor: 'var(--theme-primary-light)',
    }">
    <option v-for="(cfg, key) in THEME_CONFIG" :key="key" :value="key">
      {{ cfg.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { useThemeStore } from '../../stores/theme'
import { THEME_CONFIG } from '../../utils/constants'

const themeStore = useThemeStore()

function selectTheme(key: string) {
  themeStore.setTheme(key)
}
</script>
