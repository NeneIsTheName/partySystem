import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import vueDevTools from 'vite-plugin-vue-devtools'

const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

export default defineConfig({
  base: '/partySystem/',
  plugins: [
    vue(),
    command === 'serve' && vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    headers: crossOriginIsolation,
  },
  preview: {
    headers: crossOriginIsolation,
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm']
  }
})