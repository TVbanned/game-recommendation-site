import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  appType: 'mpa',
  base: command === 'serve' ? '/' : '/game-recommendation-site/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        roundtable: resolve(__dirname, 'zhihu-roundtable.html')
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
}))
