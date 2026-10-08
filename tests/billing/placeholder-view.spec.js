import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlaceholderView from '@/billing/views/PlaceholderView.vue'

describe('PlaceholderView.vue', () => {
  it('显示"记账 MVP"标题', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('记账 MVP')
  })

  it('显示骨架就绪说明', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('项目骨架已就绪')
  })

  it('显示当前 change 名 initialize-billing-project', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('initialize-billing-project')
  })
})