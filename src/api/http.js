import axios from 'axios'

const ACCESS_TOKEN_KEY = 'billing_access_token'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

// Request interceptor: attach Bearer access token from localStorage if present.
http.interceptors.request.use((config) => {
  try {
    const tok = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (tok) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${tok}`
    }
  } catch { /* localStorage unavailable */ }
  return config
})

// Response interceptor: on 401 (other than refresh itself), try one refresh,
// replay the original request, then surface the (possibly resolved) error.
let refreshing = null
http.interceptors.response.use(
  (resp) => resp,
  async (err) => {
    const { response, config } = err
    if (!response || response.status !== 401) throw err
    if (!config || config._retry) throw err
    // Avoid recursive refresh on the refresh endpoint itself.
    if (config.url?.includes('/auth/refresh')) throw err

    config._retry = true
    try {
      // Lazy-load to avoid circular import at module init.
      const { useAuthStore } = await import('@/billing/stores/auth')
      const auth = useAuthStore()
      if (!refreshing) refreshing = auth.refresh().finally(() => { refreshing = null })
      await refreshing
      // Refresh rotated the access token in store/localStorage; retry.
      const newTok = localStorage.getItem(ACCESS_TOKEN_KEY)
      config.headers = config.headers || {}
      if (newTok) config.headers.Authorization = `Bearer ${newTok}`
      return http(config)
    } catch (refreshErr) {
      // Refresh failed — drop the session and bounce to login.
      const { useAuthStore } = await import('@/billing/stores/auth')
      const auth = useAuthStore()
      auth._clearSession()
      try {
        const { default: router } = await import('@/router')
        router.push('/billing/login')
      } catch { /* router not yet available; let the guard catch it */ }
      throw refreshErr
    }
  },
)

export default http