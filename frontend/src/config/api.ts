const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('缺少 VITE_API_BASE_URL，请在 frontend/.env 中配置后端地址。')
  }

  const normalized = value.trim().replace(/\/+$/, '')

  try {
    const url = new URL(normalized)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('协议必须是 http 或 https')
    }
  } catch {
    throw new Error(`VITE_API_BASE_URL 不是有效的后端地址：${value}`)
  }

  return normalized
}

export const API_BASE_URL = normalizeBaseUrl(rawApiBaseUrl)
