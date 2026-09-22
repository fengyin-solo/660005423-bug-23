// 接口地址唯一入口：本地开发与构建都读取 import.meta.env.VITE_API_BASE_URL（见 .env.example）
const fromEnv = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
export const API_BASE_URL = (fromEnv || 'http://localhost:8000').replace(/\/+$/, '')
