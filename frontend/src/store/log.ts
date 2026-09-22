import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios, { type AxiosError } from 'axios'
import type { AnalysisResult, AlertRule } from '@/types'
import { API_BASE_URL } from '@/config/api'

type RequestAction = 'generate' | 'detect'

export const useLogStore = defineStore('log', () => {
  const result = ref<AnalysisResult | null>(null)
  const loading = ref(false)
  const error = ref('')
  const retry = ref<(() => Promise<void>) | null>(null)
  const searchQuery = ref('')
  const logType = ref('nginx')
  const rules = ref<AlertRule[]>([
    { id:1, name:'高频ERROR', type:'level', threshold:5, enabled:true },
    { id:2, name:'异常流量', type:'count', threshold:200, enabled:false },
    { id:3, name:'关键词命中', type:'keyword', threshold:0, enabled:true }
  ])

  const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000
  })

  function formatError(action: RequestAction, err: unknown) {
    const label = action === 'generate' ? '生成日志' : '检测异常'

    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<{ detail?: string }>
      if (axiosError.code === 'ECONNABORTED') {
        return `${label}超时：后端服务在 10 秒内没有响应，请检查服务状态后重试。`
      }

      if (!axiosError.response) {
        return `${label}失败：无法连接后端服务 ${API_BASE_URL}。请确认后端已启动，且端口与 frontend/.env 中的 VITE_API_BASE_URL 一致。`
      }

      const detail = axiosError.response.data?.detail
      return `${label}失败：接口返回 ${axiosError.response.status}${detail ? `（${detail}）` : ''}，请检查后端日志后重试。`
    }

    return err instanceof Error ? `${label}失败：${err.message}` : `${label}失败，请稍后重试。`
  }

  async function run(action: RequestAction, task: () => Promise<void>) {
    loading.value = true
    error.value = ''
    retry.value = action === 'generate'
      ? () => generate()
      : () => detect()

    try {
      await task()
    } catch (err) {
      error.value = formatError(action, err)
      console.error(`[log-anomaly-detector] ${error.value}`, err)
    } finally {
      loading.value = false
    }
  }

  async function generate() {
    await run('generate', async () => {
      const { data } = await http.post('/api/generate', { type: logType.value, count: 1000 })
      result.value = data
    })
  }

  async function detect() {
    if (!result.value) return

    await run('detect', async () => {
      const { data } = await http.post('/api/detect', {
        logs: result.value?.logs,
        rules: rules.value.filter(r => r.enabled),
        query: searchQuery.value
      })
      result.value = data
    })
  }

  return { result, loading, error, retry, searchQuery, logType, rules, generate, detect }
})
