export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? undefined,
  basicAuthUser: (import.meta.env.VITE_BASIC_AUTH_USER as string | undefined) ?? undefined,
  basicAuthPassword: (import.meta.env.VITE_BASIC_AUTH_PASSWORD as string | undefined) ?? undefined,
}

