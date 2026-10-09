// tests/billing/auth-store.spec.js
// Unit tests for src/billing/stores/auth.js (Pinia). Mocks authApi so we
// exercise the store in isolation — no axios / network.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock the api module so the store doesn't import axios at all.
vi.mock('@/billing/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  },
}))

import { useAuthStore } from '@/billing/stores/auth'
import { authApi } from '@/billing/api/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initial state is unauthenticated', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBe(null)
  })

  it('login sets access + user, persists access to localStorage', async () => {
    authApi.login.mockResolvedValue({
      data: { access: 'tok-1', user: { id: 1, email: 'a@b.c', role: 'admin' } },
    })
    const auth = useAuthStore()
    await auth.login('a@b.c', 'pwd12345')

    expect(auth.accessToken).toBe('tok-1')
    expect(auth.user.email).toBe('a@b.c')
    expect(auth.isAuthenticated).toBe(true)
    expect(localStorage.getItem('billing_access_token')).toBe('tok-1')
  })

  it('register behaves like login (sets session)', async () => {
    authApi.register.mockResolvedValue({
      data: { access: 'tok-2', user: { id: 2, email: 'b@b.c', role: 'member' } },
    })
    const auth = useAuthStore()
    await auth.register('b@b.c', 'pwd12345', 'Bee')

    expect(auth.accessToken).toBe('tok-2')
    expect(auth.user.role).toBe('member')
  })

  it('logout clears access + user + localStorage', async () => {
    authApi.logout.mockResolvedValue({})
    const auth = useAuthStore()
    auth.accessToken = 'tok'
    auth.user = { id: 1, email: 'a@b.c', role: 'admin' }
    localStorage.setItem('billing_access_token', 'tok')

    await auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBe(null)
    expect(localStorage.getItem('billing_access_token')).toBeNull()
  })

  it('logout swallows network errors (still clears local state)', async () => {
    authApi.logout.mockRejectedValue(new Error('network'))
    const auth = useAuthStore()
    auth.accessToken = 'tok'
    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('refresh updates access token', async () => {
    authApi.refresh.mockResolvedValue({ data: { access: 'new-tok' } })
    const auth = useAuthStore()
    await auth.refresh()
    expect(auth.accessToken).toBe('new-tok')
    expect(localStorage.getItem('billing_access_token')).toBe('new-tok')
  })

  it('restores access token from localStorage on construction', () => {
    localStorage.setItem('billing_access_token', 'persisted-tok')
    const auth = useAuthStore()
    expect(auth.accessToken).toBe('persisted-tok')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('role getter returns user role or empty string', () => {
    const auth = useAuthStore()
    expect(auth.role).toBe('')
    auth.user = { id: 1, email: 'a@b.c', role: 'admin' }
    expect(auth.role).toBe('admin')
  })
})