// tests/shared/guards.spec.js
// Unit tests for src/shared/guards.js. Mounts the guard against a fresh
// router with billingRoutes and stubs the auth store via Pinia.
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import billingRoutes from '@/billing/router'
import { installAuthGuard } from '@/shared/guards'
import { useAuthStore } from '@/billing/stores/auth'

function makeRouter() {
  const r = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/billing' },
      { path: '/billing', children: billingRoutes },
    ],
  })
  installAuthGuard(r)
  return r
}

describe('auth guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('unauthenticated user hitting /billing redirects to /billing/login?redirect=/billing', async () => {
    const router = makeRouter()
    await router.push('/billing')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing/login')
    expect(router.currentRoute.value.query.redirect).toBe('/billing')
  })

  it('authenticated user hitting /billing stays on /billing', async () => {
    const auth = useAuthStore()
    auth.accessToken = 'tok'
    auth.user = { id: 1, email: 'a@b.c', role: 'admin' }

    const router = makeRouter()
    await router.push('/billing')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing')
  })

  it('authenticated user hitting /billing/login redirects to /billing', async () => {
    const auth = useAuthStore()
    auth.accessToken = 'tok'

    const router = makeRouter()
    await router.push('/billing/login')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing')
  })

  it('authenticated user hitting /billing/register redirects to /billing', async () => {
    const auth = useAuthStore()
    auth.accessToken = 'tok'

    const router = makeRouter()
    await router.push('/billing/register')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing')
  })

  it('unauthenticated user can access /billing/login (no redirect)', async () => {
    const router = makeRouter()
    await router.push('/billing/login')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing/login')
  })

  it('unauthenticated user can access /billing/register (no redirect)', async () => {
    const router = makeRouter()
    await router.push('/billing/register')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing/register')
  })
})