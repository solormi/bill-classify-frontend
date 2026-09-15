import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, me as apiMe } from '../api/auth'

const STORAGE_KEY = 'auth.token'

function readToken() {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}
function writeToken(t) {
  try {
    if (t) localStorage.setItem(STORAGE_KEY, t)
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* 隐私模式 / storage 不可用时静默 */ }
}

// 安装 axios Bearer token 拦截器(只装一次,模块加载即生效)。
import { client } from '../api/client'
let interceptorInstalled = false
function installAuthInterceptor() {
  if (interceptorInstalled) return
  interceptorInstalled = true
  client.interceptors.request.use((config) => {
    const tok = readToken()
    if (tok) config.headers.Authorization = `Bearer ${tok}`
    return config
  })
  // 401 → 清掉 token + 清 user,让路由守卫把页面跳到 /login
  client.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err?.response?.status === 401) {
        writeToken(null)
        try {
          const store = useAuthStore()
          store.clear()
        } catch { /* store 可能尚未初始化 */ }
      }
      return Promise.reject(err)
    }
  )
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: readToken(),
    user: null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user
  },
  actions: {
    async login(username, password) {
      this.loading = true; this.error = null
      try {
        const data = await apiLogin(username, password)
        this.token = data.token
        this.user = data.user
        writeToken(this.token)
        return data
      } catch (e) {
        // 后端返回 401 时,统一展示「用户名或密码错误」(防枚举也防混淆)
        this.error = e?.response?.status === 401
          ? '用户名或密码错误'
          : (e?.message || '登录失败')
        throw e
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        if (this.token) await apiLogout()
      } catch { /* 即便后端调用失败,本地也清 */ }
      this.clear()
    },
    clear() {
      this.token = null
      this.user = null
      writeToken(null)
    },
    async hydrateFromStorage() {
      installAuthInterceptor()
      if (!this.token) return null
      try {
        const u = await apiMe()
        this.user = u
        return u
      } catch {
        // token 过期 / 被吊销
        this.clear()
        return null
      }
    }
  }
})

// 模块加载时立即安装拦截器(单例),保证任何组件 import auth store 前已有拦截器。
installAuthInterceptor()