import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'favicon.svg'],
      manifest: {
        name: 'GrowBonus 成长奖励',
        short_name: 'GrowBonus',
        description: '宝贝成长奖励系统',
        theme_color: '#FF9F43',
        background_color: '#FFF9F0',
        display: 'standalone',
        start_url: '/growbonus/',
        scope: '/growbonus/',
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  base: '/growbonus/',
  server: {
    port: 5173,
    proxy: {
      '/growbonus/api': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/growbonus/, '')
      },
      '/growbonus/uploads': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/growbonus/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
})
