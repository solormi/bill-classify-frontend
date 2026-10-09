// src/billing/stores/auth.js
// Pinia store for the authentication session.
// - accessToken: short-lived JWT, kept in localStorage for axios interceptor
// - user: profile (id, email, nickname, role)
// - refreshToken: httpOnly cookie set by the server; client cannot read it,
//   so it's just a presence flag here
import { defineStore } from 'pinia'
import { authApi } from '@/billing/api/auth'

const ACCESS_TOKEN_KEY = 'billing_access_token'

function readAccessToken() {
  try { return localStorage.getItem(ACCESS_TOKEN_KEY) || '' } catch { return '' }
}
function writeAccessToken(t) {
  try {
    if (t) localStorage.setItem(ACCESS_TOKEN_KEY, t)
    else localStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch { /* localStorage unavailable (SSR / private mode) */ }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: readAccessToken(),
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    role: (state) => state.user?.role || '',
  },
  actions: {
    async login(email, password) {
      const { data } = await authApi.login({ email, password })
      this._setSession(data.access, data.user)
    },
    async register(email, password, nickname) {
      const { data } = await authApi.register({ email, password, nickname })
      this._setSession(data.access, data.user)
    },
    async logout() {
      try { await authApi.logout() } catch { /* swallow — we're clearing anyway */ }
      this._clearSession()
    },
    async refresh() {
      const { data } = await authApi.refresh()
      // Server rotates refresh cookie automatically; client only updates access.
      this.accessToken = data.access
      writeAccessToken(data.access)
    },
    async fetchMe() {
      const { data } = await import('@/api/http').then((m) => m.default.get('/billing/users/me'))
      this.user = data
    },
    _setSession(access, user) {
      this.accessToken = access
      this.user = user
      writeAccessToken(access)
    },
    _clearSession() {
      this.accessToken = ''
      this.user = null
      writeAccessToken('')
    },
  },
})