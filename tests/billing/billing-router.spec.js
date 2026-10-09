import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import billingRoutes from '@/billing/router'

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/billing' },
      { path: '/billing', children: billingRoutes },
    ],
  })
}

describe('总路由', () => {
  it('/ 重定向到 /billing', async () => {
    const router = makeRouter()
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/billing')
  })

  it('/billing 直接深链可解析(模拟刷新进入)', () => {
    const router = makeRouter()
    expect(router.resolve('/billing').path).toBe('/billing')
  })

  it('/billing 解析到父路由 + 空路径子路由(2 层 matched)', () => {
    const router = makeRouter()
    const resolved = router.resolve('/billing')
    expect(resolved.matched.length).toBe(2)
    expect(resolved.path).toBe('/billing')
  })

  it('billing 子路由配置现在含 placeholder + login + register + categories + rules', () => {
    // Change 3 (add-billing-category-rule) added /categories and /rules.
    // Empty-path entry remains the protected index view.
    expect(billingRoutes).toHaveLength(5)
    expect(billingRoutes[0].path).toBe('')
    expect(billingRoutes[0].meta?.requireAuth).toBe(true)
    expect(billingRoutes[1].path).toBe('login')
    expect(billingRoutes[2].path).toBe('register')
    expect(billingRoutes[3].path).toBe('categories')
    expect(billingRoutes[3].meta?.requireAuth).toBe(true)
    expect(billingRoutes[4].path).toBe('rules')
    expect(billingRoutes[4].meta?.requireAuth).toBe(true)
  })

  it('未知路由不崩溃,但也不匹配任何记录(当前行为)', async () => {
    const router = makeRouter()
    await router.push('/nonexistent')
    expect(router.currentRoute.value.path).toBe('/nonexistent')
    expect(router.currentRoute.value.matched.length).toBe(0)
  })
})