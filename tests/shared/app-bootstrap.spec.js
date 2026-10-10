import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '@/App.vue'

// App.vue mounts <TopNav v-if=auth.isAuthenticated>. Stub the component so
// the test focuses on the router-view shell, and stub useAuthStore so
// the unauthenticated branch renders (no top nav, just router-view).
vi.mock('@/billing/components/TopNav.vue', () => ({
  default: { name: 'TopNav', template: '<nav data-stub="topnav" />' },
}))
vi.mock('@/billing/stores/auth', () => {
  const authMock = { isAuthenticated: false, user: null, logout: vi.fn() }
  return {
    useAuthStore: () => authMock,
    _authMock: authMock, // exported for tests that need to flip isAuthenticated
  }
})

describe('App.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('unauthenticated shell: only router-view, no TopNav', () => {
    const wrapper = mount(App, {
      global: { stubs: { RouterView: true } },
    })
    expect(wrapper.html()).toContain('router-view')
    expect(wrapper.find('[data-stub="topnav"]').exists()).toBe(false)
  })
})