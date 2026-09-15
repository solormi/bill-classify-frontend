import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import CsvUploader from '../src/components/CsvUploader.vue'
import * as api from '../src/api/bills'

// jsdom 不允许直接把 File 赋给 <input type=file>.value,且没有原生 DataTransfer;
// 用 defineProperty 把 files 直接挂上去再派发 change。
function setInputFiles(input, files) {
  Object.defineProperty(input, 'files', { value: files, configurable: true })
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('CsvUploader', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('renders file input and disabled upload button initially', () => {
    const wrapper = mount(CsvUploader)
    expect(wrapper.find('[data-testid="file-input"]').exists()).toBe(true)
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('uploads selected file and shows result', async () => {
    const stub = vi.spyOn(api, 'uploadCsv').mockResolvedValue({
      imported_count: 3,
      failed_count: 1,
      failed_rows: [{ row: 2, reason: 'invalid date format' }]
    })

    const wrapper = mount(CsvUploader)
    const file = new File(['a'], 'bills.csv', { type: 'text/csv' })
    const input = wrapper.find('[data-testid="file-input"]').element
    setInputFiles(input, [file])
    await flushPromises()
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(stub).toHaveBeenCalledWith(file)
    expect(wrapper.text()).toContain('导入 3')
    expect(wrapper.text()).toContain('invalid date format')
  })
})