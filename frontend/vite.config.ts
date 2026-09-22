import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig(({ mode }) => {
  // 与前端代码共用同一份环境配置（.env），代理目标不再写死
  const env = loadEnv(mode, __dirname, '')
  const apiBase = (env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')
  return {
    plugins: [vue()],
    server: {
      port: 3000,
      proxy: {
        '/api': { target: apiBase, changeOrigin: true },
        '/ws': { target: apiBase.replace(/^http/, 'ws'), ws: true }
      }
    }
  }
})
