import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PlaceholderView from '@/billing/views/PlaceholderView.vue'
import { useAuthStore } from '@/billing/stores/auth'

describe('PlaceholderView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('显示"记账 MVP"标题', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('记账 MVP')
  })

  it('欢迎当前登录用户(用昵称)— store 设值后必须 reactivity 触发', async () => {
    const auth = useAuthStore()
    auth.user = { id: 1, email: 'a@b.c', nickname: 'admin', role: 'admin' }
    // auth.user is set via Pinia's $patch semantics; storeToRefs reads it
    const wrapper = mount(PlaceholderView)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('admin')
  })

  it('渲染所有已上线 change 的卡片', () => {
    const wrapper = mount(PlaceholderView)
    const text = wrapper.text()
    expect(text).toContain('骨架')
    expect(text).toContain('登录')
    expect(text).toContain('分类')
    expect(text).toContain('账单')
  })

  it('主操作按钮指向 /billing/bills/new', () => {
    const wrapper = mount(PlaceholderView, {
      // Stub router-link to a plain <a> so we can assert href without
      // having to wire up a real Router in this unit test.
      global: {
        stubs: { 'router-link': { template: '<a :href="to"><slot /></a>', props: ['to'] } },
      },
    })
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href')).filter(Boolean)
    expect(hrefs).toContain('/billing/bills/new')
  })
})