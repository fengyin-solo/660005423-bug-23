import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, describeError } from '../api'
import type { AnalysisResult, AlertRule } from '@/types'
export const useLogStore = defineStore('log', () => {
  const result = ref<AnalysisResult | null>(null)
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const logType = ref('nginx')
  const rules = ref<AlertRule[]>([
    { id:1, name:'高频ERROR', type:'level', threshold:5, enabled:true },
    { id:2, name:'异常流量', type:'count', threshold:200, enabled:false },
    { id:3, name:'关键词命中', type:'keyword', threshold:0, enabled:true }
  ])
  let lastAction: 'generate' | 'detect' | null = null

  async function run(action: 'generate' | 'detect') {
    if (action === 'detect' && !result.value) return
    lastAction = action
    loading.value = true
    error.value = ''
    try {
      const { data } = action === 'generate'
        ? await api.post('/api/generate', { type: logType.value, count: 1000 })
        : await api.post('/api/detect', { logs: result.value!.logs, rules: rules.value.filter(r => r.enabled), query: searchQuery.value })
      result.value = data
    } catch (e) {
      // 失败时保留已有数据，只提示原因，交给用户重试
      error.value = describeError(e)
      console.error(`[log-store] ${action} 请求失败:`, e)
    } finally {
      loading.value = false
    }
  }

  const generate = () => run('generate')
  const detect = () => run('detect')
  const retry = () => { if (lastAction) return run(lastAction) }

  return { result, loading, error, searchQuery, logType, rules, generate, detect, retry }
})
