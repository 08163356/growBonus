<template>
  <teleport to="body">
    <transition name="page">
      <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center"
           @click.self="onCancel">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative mx-6 w-full max-w-[360px] card animate-bounce-in text-center p-6">
          <div v-if="icon" class="text-5xl mb-3">{{ icon }}</div>
          <h3 class="text-xl font-bold mb-2" style="color: var(--theme-text)">{{ title }}</h3>
          <p v-if="message" class="text-sm mb-6" style="color: var(--theme-text-secondary)">{{ message }}</p>
          <slot />
          <div class="flex gap-3 mt-4">
            <button v-if="showCancel" class="btn-secondary flex-1" @click="onCancel">{{ cancelText }}</button>
            <button class="btn-primary flex-1" @click="onConfirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  message?: string
  icon?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [val: boolean]
}>()

function onConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function onCancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>
