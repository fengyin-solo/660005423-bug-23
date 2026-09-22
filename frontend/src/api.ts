import axios from 'axios'
import { API_BASE_URL } from './config'

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 })

// 把 axios 错误翻译成可读原因，方便页面提示与控制台排查
export function describeError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (e.code === 'ECONNABORTED') return `请求后端接口超时（${API_BASE_URL}），请确认后端已启动后重试`
    if (e.response) return `后端接口返回 ${e.response.status}（${API_BASE_URL}），请检查后端日志`
    return `无法连接后端接口 ${API_BASE_URL}，请确认后端已启动，且端口与 .env 中 VITE_API_BASE_URL 一致`
  }
  return e instanceof Error ? e.message : String(e)
}
