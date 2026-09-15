import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { client } from '../src/api/client'
import MockAdapter from 'axios-mock-adapter'
import { useAuthStore } from '../src/stores/auth'

// 强制给每个测试一个全新的 localStorage / pinia / mock
let mock
beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  mock = new MockAdapter(client)
})

afterEach(() => {
  localStorage.clear()
  mock.restore()
})

describe('auth store', () => {
  it('initial state is unauthenticated', () => {
    const s = useAuthStore()
    expect(s.isAuthenticated).toBe(false)
    expect(s.token).toBe(null)
    expect(s.user).toBe(null)
  })

  it('login() 成功 → 写入 token / user / localStorage', async () => {
    mock.onPost('/auth/login').reply(200, {
      token: 'jwt-abc',
      user: { id: 1, username: 'demo', created_at: '2026-01-01' }
    })

    const s = useAuthStore()
    await s.login('demo', 'password123')

    expect(s.token).toBe('jwt-abc')
    expect(s.user).toEqual({ id: 1, username: 'demo', created_at: '2026-01-01' })
    expect(s.isAuthenticated).toBe(true)
    expect(localStorage.getItem('auth.token')).toBe('jwt-abc')
  })

  it('login() 失败 → 错误信息,不清 token(本来就是 null)', async () => {
    mock.onPost('/auth/login').reply(401, { error: 'invalid credentials' })

    const s = useAuthStore()
    await expect(s.login('demo', 'wrong')).rejects.toBeTruthy()

    expect(s.token).toBe(null)
    expect(s.error).toBe('用户名或密码错误')
  })

  it('logout() 清掉 token / user / localStorage', async () => {
    mock.onPost('/auth/logout').reply(200, { status: 'ok' })

    localStorage.setItem('auth.token', 'jwt-xyz')
    const s = useAuthStore()
    // 模拟已登录态
    s.token = 'jwt-xyz'
    s.user = { id: 1, username: 'demo', created_at: '2026-01-01' }

    await s.logout()
    expect(s.token).toBe(null)
    expect(s.user).toBe(null)
    expect(localStorage.getItem('auth.token')).toBe(null)
  })

  it('hydrateFromStorage() 成功 → 拉回 user', async () => {
    mock.onGet('/auth/me').reply(200, { id: 1, username: 'demo', created_at: '2026-01-01' })

    localStorage.setItem('auth.token', 'jwt-keep')
    const s = useAuthStore()
    // init state 时 token 会从 storage 读出
    expect(s.token).toBe('jwt-keep')

    const u = await s.hydrateFromStorage()
    expect(u.username).toBe('demo')
    expect(s.user.username).toBe('demo')
  })

  it('hydrateFromStorage() 401 → 自动 clear', async () => {
    mock.onGet('/auth/me').reply(401, { error: 'invalid token' })

    localStorage.setItem('auth.token', 'jwt-stale')
    const s = useAuthStore()

    await s.hydrateFromStorage()
    expect(s.token).toBe(null)
    expect(s.user).toBe(null)
    expect(localStorage.getItem('auth.token')).toBe(null)
  })

  it('401 响应拦截器 → 自动清登录态', async () => {
    mock.onGet('/bills').reply(401, { error: 'invalid token' })

    localStorage.setItem('auth.token', 'jwt-stale-2')
    const s = useAuthStore()
    s.user = { id: 1, username: 'demo', created_at: '2026-01-01' }

    await expect(client.get('/bills')).rejects.toBeTruthy()
    expect(s.token).toBe(null)
    expect(s.user).toBe(null)
    expect(localStorage.getItem('auth.token')).toBe(null)
  })
})