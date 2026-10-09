// src/billing/api/auth.js
// HTTP wrappers for /api/v1/billing/auth/*. Cookies carry refresh_token;
// access_token comes back in the JSON body. The single refresh endpoint
// also accepts the refresh_token in the body for cross-origin dev setups
// where the cookie path isn't reachable.
import http from '@/api/http'

export const authApi = {
  register({ email, password, nickname }) {
    return http.post('/billing/auth/register', { email, password, nickname })
  },
  login({ email, password }) {
    return http.post('/billing/auth/login', { email, password })
  },
  logout() {
    return http.post('/billing/auth/logout')
  },
  refresh(refreshToken) {
    return http.post('/billing/auth/refresh', refreshToken ? { refresh_token: refreshToken } : {})
  },
}