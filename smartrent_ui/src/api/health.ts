import { apiFetch } from '../lib/http'

export type HealthResponse = {
  status: 'UP' | 'DOWN'
  timestamp: string
  service: string
  version: string
}

export const healthApi = {
  get: () => apiFetch<HealthResponse>('/api/health'),
}

