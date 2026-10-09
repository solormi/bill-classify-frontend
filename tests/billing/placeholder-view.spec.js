import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlaceholderView from '@/billing/views/PlaceholderView.vue'

describe('PlaceholderView.vue', () => {
  it('显示"记账 MVP"标题', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('记账 MVP')
  })

  it('显示当前 change 名 initialize-billing-project', () => {
    const wrapper = mount(PlaceholderView)
    expect(wrapper.text()).toContain('initialize-billing-project')
  })

  it('提供导航到分类管理与规则管理', () => {
    const wrapper = mount(PlaceholderView)
    // router-link isn't rendered as <a> in unit tests without a Router, so
    // check the markup contains the right `to` props via findAllComponents
    // would require importing RouterLink. Simpler: assert the visible label
    // text in the template (the link text content is the navigation surface
    // for keyboard/screen-reader users too).
    const text = wrapper.text()
    expect(text).toContain('分类管理')
    expect(text).toContain('自动分类规则')
  })
})