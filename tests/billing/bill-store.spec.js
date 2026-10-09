// tests/billing/bill-store.spec.js
// Pinia store tests for src/billing/stores/bill.js. Mock the api module.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/billing/api/bill', () => ({
  billApi: {
    list: vi.fn(),
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    listRecycle: vi.fn(),
    restore: vi.fn(),
  },
}))

import { useBillStore } from '@/billing/stores/bill'
import { billApi } from '@/billing/api/bill'

describe('bill store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetch populates bills + total', async () => {
    billApi.list.mockResolvedValue({
      data: { items: [{ id: 1, amount: 10 }], total: 5 },
    })
    const s = useBillStore()
    await s.fetch({ page: 1 })
    expect(s.bills).toHaveLength(1)
    expect(s.total).toBe(5)
  })

  it('create prepends + bumps total', async () => {
    billApi.list.mockResolvedValue({ data: { items: [], total: 0 } })
    billApi.create.mockResolvedValue({ data: { id: 1, amount: 10 } })
    const s = useBillStore()
    await s.fetch({})
    await s.create({ amount: 10, bill_date: '2026-10-09' })
    expect(s.bills[0].id).toBe(1)
    expect(s.total).toBe(1)
  })

  it('remove filters + decrements total', async () => {
    billApi.list.mockResolvedValue({
      data: { items: [{ id: 1 }, { id: 2 }], total: 2 },
    })
    billApi.remove.mockResolvedValue({})
    const s = useBillStore()
    await s.fetch({})
    await s.remove(1)
    expect(s.bills).toHaveLength(1)
    expect(s.bills[0].id).toBe(2)
    expect(s.total).toBe(1)
  })

  it('restore moves from recycle to bills', async () => {
    billApi.listRecycle.mockResolvedValue({
      data: { items: [{ id: 1, original_id: 5 }] },
    })
    billApi.list.mockResolvedValue({ data: { items: [], total: 0 } })
    billApi.restore.mockResolvedValue({ data: { id: 5, amount: 99 } })
    const s = useBillStore()
    await s.fetchRecycle({})
    await s.fetch({})
    await s.restore(5)
    expect(s.recycle).toHaveLength(0)
    expect(s.bills[0].id).toBe(5)
    expect(s.total).toBe(1)
  })

  it('findById returns matching bill', async () => {
    billApi.list.mockResolvedValue({
      data: { items: [{ id: 7, amount: 10 }], total: 1 },
    })
    const s = useBillStore()
    await s.fetch({})
    expect(s.findById(7).amount).toBe(10)
    expect(s.findById(999)).toBe(null)
  })
})
