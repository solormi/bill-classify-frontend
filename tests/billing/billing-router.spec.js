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

  it('billing 子路由配置含 placeholder + login + register + categories + rules + bills 系', () => {
    // Change 4 (add-billing-bill-core) appends 5 /bills/* routes after the
    // change-3 routes. Total expected length: 5 (placeholder/login/register/
    // categories/rules) + 5 (bills, bills/new, bills/recycle, bills/:id,
    // bills/:id/edit) = 10.
    expect(billingRoutes).toHaveLength(10)
    expect(billingRoutes[0].path).toBe('')
    expect(billingRoutes[0].meta?.requireAuth).toBe(true)
    expect(billingRoutes[1].path).toBe('login')
    expect(billingRoutes[2].path).toBe('register')
    expect(billingRoutes[3].path).toBe('categories')
    expect(billingRoutes[3].meta?.requireAuth).toBe(true)
    expect(billingRoutes[4].path).toBe('rules')
    expect(billingRoutes[4].meta?.requireAuth).toBe(true)
    // change 4: bills routes appended after change 3 routes
    expect(billingRoutes[5].path).toBe('bills')
    expect(billingRoutes[6].path).toBe('bills/new')
    expect(billingRoutes[7].path).toBe('bills/recycle')
    expect(billingRoutes[8].path).toBe('bills/:id')
    expect(billingRoutes[9].path).toBe('bills/:id/edit')
    for (let i = 5; i < 10; i++) {
      expect(billingRoutes[i].meta?.requireAuth).toBe(true)
    }
  })

  it('未知路由不崩溃,但也不匹配任何记录(当前行为)', async () => {
    const router = makeRouter()
    await router.push('/nonexistent')
    expect(router.currentRoute.value.path).toBe('/nonexistent')
    expect(router.currentRoute.value.matched.length).toBe(0)
  })
})