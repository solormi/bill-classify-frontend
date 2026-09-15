import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import CategorySelect from '../src/components/CategorySelect.vue'

describe('CategorySelect', () => {
  it('emits update:modelValue and change on selection', async () => {
    const wrapper = mount(CategorySelect, { props: { modelValue: 'other' } })
    await wrapper.find('select').setValue('dining')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['dining'])
    expect(wrapper.emitted('change')[0]).toEqual(['dining'])
  })
})