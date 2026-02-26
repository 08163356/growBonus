import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../services/authService'
import { getImageUrl } from '../services/api'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(localStorage.getItem('gb_theme') || 'default')
  const backgroundImage = ref(localStorage.getItem('gb_bg_image') || '')

  function setTheme(theme: string) {
    currentTheme.value = theme
    localStorage.setItem('gb_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    authApi.updateTheme(theme).catch(() => {})
  }

  function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme.value)
    applyBackground()
  }

  function setBackgroundImage(filename: string) {
    backgroundImage.value = filename
    localStorage.setItem('gb_bg_image', filename)
    applyBackground()
  }

  async function uploadBackground(file: File) {
    const res = await authApi.updateBackground(file)
    if (res.data.success && res.data.data) {
      setBackgroundImage(res.data.data.backgroundImage)
    }
  }

  async function loadBackground() {
    try {
      const res = await authApi.getBackground()
      if (res.data.success && res.data.data) {
        setBackgroundImage(res.data.data.backgroundImage)
      }
    } catch {}
  }

  function applyBackground() {
    const app = document.getElementById('app')
    if (!app) return
    if (backgroundImage.value) {
      const url = getImageUrl(backgroundImage.value)
      app.style.setProperty('--app-bg-image', `url(${url})`)
      app.classList.add('has-bg-image')
    } else {
      app.style.removeProperty('--app-bg-image')
      app.classList.remove('has-bg-image')
    }
  }

  function clearBackground() {
    backgroundImage.value = ''
    localStorage.removeItem('gb_bg_image')
    const app = document.getElementById('app')
    if (app) {
      app.style.removeProperty('--app-bg-image')
      app.classList.remove('has-bg-image')
    }
    // clear on server - PUT with no file sets empty string
    import('../services/api').then(({ default: api }) => {
      api.put('/auth/background', new FormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).catch(() => {})
    })
  }

  return { currentTheme, backgroundImage, setTheme, initTheme, setBackgroundImage, uploadBackground, loadBackground, clearBackground }
})
