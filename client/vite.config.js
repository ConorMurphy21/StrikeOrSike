import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import '@/styles/variables';`
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~bootstrap': 'bootstrap',
      '~bootstrap-icons': 'bootstrap-icons',
      '~vue-slider-component': 'vue-slider-component'
    }
  },
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
})