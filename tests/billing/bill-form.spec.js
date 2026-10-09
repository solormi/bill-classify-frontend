// tests/billing/bill-form.spec.js
//
// BillForm is exercised at the component level: child components
// (CategorySelect / SaveRuleDialog) are stubbed because their internal
// storeToRefs wiring is irrelevant to BillForm's own behaviour. Stores
// are mocked at the module level.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/billing/stores/category', () => ({
  useCategoryStore: () => ({
    ensureLoaded: vi.fn(),
    categories: [
      { id: 1, user_id: null, name: '餐饮', parent_id: null, icon: '' },
      { id: 8, user_id: null, name: '其他', parent_id: null, icon: '' },
    ],
  }),
}))

vi.mock('@/billing/stores/rule', () => ({
  useRuleStore: () => ({
    preview: vi.fn().mockResolvedValue({ category_id: 1, rule_id: null }),
    create: vi.fn(),
  }),
}))

import BillForm from '@/billing/components/BillForm.vue'

const stubs = {
  CategorySelect: {
    props: ['value'],
    emits: ['update:value'],
    template: `<select :value="value" @change="$emit('update:value', Number($event.target.value))"><option value="1">餐饮</option><option value="8">其他</option></select>`,
  },
  SaveRuleDialog: { template: '<div />' },
}

describe('BillForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits submit with valid payload when canSubmit', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(BillForm, { global: { stubs } })
      await wrapper.find('input[type="text"]').setValue('星巴克') // merchant
      await wrapper.find('input[type="number"]').setValue(38)    // amount
      // BillForm debounces runPreview for 300ms via setTimeout.
      vi.advanceTimersByTime(350)
      await flushPromises() // let ruleStore.preview's resolved promise land

      await wrapper.find('form').trigger('submit.prevent')
      const emitted = wrapper.emitted('submit')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toMatchObject({
        amount: 38,
        merchant: '星巴克',
        source: 'manual',
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('disables submit when amount is 0', () => {
    const wrapper = mount(BillForm, { global: { stubs } })
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('uses today as default bill_date', () => {
    const wrapper = mount(BillForm, { global: { stubs } })
    const today = new Date().toISOString().slice(0, 10)
    expect(wrapper.find('input[type="date"]').element.value).toBe(today)
  })
})
