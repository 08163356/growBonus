<template>
  <div class="flex flex-col items-center justify-center py-12 gap-3">
    <div class="text-4xl animate-float">⭐</div>
    <p class="text-sm" style="color: var(--theme-text-secondary)">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>()
</script>
