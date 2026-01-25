import { env } from '../config/env'

const BASIC_AUTH_STORAGE_KEY = 'smartrent.basicAuth'

type BasicAuth = { user: string; password: string }

export function getBasicAuth(): BasicAuth | null {
  if (env.basicAuthUser && env.basicAuthPassword) {
    return { user: env.basicAuthUser, password: env.basicAuthPassword }
  }

  try {
    const raw = sessionStorage.getItem(BASIC_AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BasicAuth>
    if (!parsed.user || !parsed.password) return null
    return { user: parsed.user, password: parsed.password }
  } catch {
    return null
  }
}

export function setBasicAuth(auth: BasicAuth | null) {
  if (!auth) {
    sessionStorage.removeItem(BASIC_AUTH_STORAGE_KEY)
    return
  }
  sessionStorage.setItem(BASIC_AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function getBasicAuthHeader(): string | undefined {
  const auth = getBasicAuth()
  if (!auth) return undefined
  const token = btoa(`${auth.user}:${auth.password}`)
  return `Basic ${token}`
}

