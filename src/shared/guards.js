// src/shared/guards.js
// Global router guard. Lives in src/shared/ per change 1's cross-owner
// contract — any modification here is subject to sadmi + mi joint review.
//
// Behavior:
// 1. Routes with meta.requireAuth: redirect to /login?redirect=<original> if
//    the user is not authenticated.
// 2. Routes /login and /register: redirect to /billing if the user IS
//    authenticated (avoids double login form after refresh).
// 3. Everything else: pass through.
import { useAuthStore } from '@/billing/stores/auth'

export function installAuthGuard(router) {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    const isAuthRoute = to.path === '/billing/login' || to.path === '/billing/register'

    if (to.meta?.requireAuth && !auth.isAuthenticated) {
      return next({
        path: '/billing/login',
        query: { redirect: to.fullPath },
      })
    }

    if (isAuthRoute && auth.isAuthenticated) {
      return next('/billing')
    }

    return next()
  })
}