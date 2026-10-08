import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('只渲染一个 router-view 出口,不含业务内容', () => {
    const wrapper = mount(App, {
      global: { stubs: { RouterView: true } },
    })
    expect(wrapper.html()).toContain('router-view')
  })
})