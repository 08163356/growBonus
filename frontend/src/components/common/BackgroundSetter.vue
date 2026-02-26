<template>
  <div class="flex items-center gap-2">
    <label class="flex items-center gap-1.5 px-3 py-2 rounded-2xl cursor-pointer active:scale-95 transition-all"
           style="background: var(--theme-bg-secondary)">
      <span class="text-sm">🖼️</span>
      <span class="text-xs font-semibold" style="color: var(--theme-text-secondary)">背景</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
             @change="onFileChange" />
    </label>
    <button v-if="themeStore.backgroundImage"
      class="w-8 h-8 rounded-full flex items-center justify-center text-xs active:scale-90 transition-all"
      style="background: var(--theme-bg-secondary); color: var(--theme-danger)"
      @click="clearBg">
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    await themeStore.uploadBackground(file)
  } catch {
    alert('上传失败')
  }
}

function clearBg() {
  themeStore.clearBackground()
}
</script>
