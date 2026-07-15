import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/game-recommendation-site/',
  server: {
    port: 3000
  }
})
