// tests/billing/category-store.spec.js
// Pinia store tests for src/billing/stores/category.js. Mock the api module.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/billing/api/category', () => ({
  categoryApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

import { useCategoryStore } from '@/billing/stores/category'
import { categoryApi } from '@/billing/api/category'

describe('category store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initial state empty', () => {
    const s = useCategoryStore()
    expect(s.categories).toEqual([])
    expect(s.loading).toBe(false)
  })

  it('fetch populates categories', async () => {
    categoryApi.list.mockResolvedValue({
      data: [
        { id: 1, user_id: null, name: '餐饮', parent_id: null },
        { id: 2, user_id: null, name: '其他', parent_id: null },
        { id: 3, user_id: 1, name: '外卖', parent_id: 1 },
      ],
    })
    const s = useCategoryStore()
    await s.fetch()
    expect(s.categories).toHaveLength(3)
    expect(s.loading).toBe(false)
  })

  it('topLevel getter returns only parent_id == null', async () => {
    categoryApi.list.mockResolvedValue({
      data: [
        { id: 1, user_id: null, name: '餐饮', parent_id: null },
        { id: 2, user_id: 1, name: '外卖', parent_id: 1 },
      ],
    })
    const s = useCategoryStore()
    await s.fetch()
    expect(s.topLevel).toHaveLength(1)
    expect(s.topLevel[0].name).toBe('餐饮')
  })

  it('childrenOf returns children of a parent', async () => {
    categoryApi.list.mockResolvedValue({
      data: [
        { id: 1, user_id: null, name: '餐饮', parent_id: null },
        { id: 2, user_id: 1, name: '外卖', parent_id: 1 },
        { id: 3, user_id: 1, name: '堂食', parent_id: 1 },
      ],
    })
    const s = useCategoryStore()
    await s.fetch()
    expect(s.childrenOf(1)).toHaveLength(2)
  })

  it('isSystem detects user_id == null', async () => {
    categoryApi.list.mockResolvedValue({
      data: [
        { id: 1, user_id: null, name: '餐饮', parent_id: null },
        { id: 2, user_id: 1, name: '外卖', parent_id: 1 },
      ],
    })
    const s = useCategoryStore()
    await s.fetch()
    expect(s.isSystem(s.categories[0])).toBe(true)
    expect(s.isSystem(s.categories[1])).toBe(false)
  })

  it('create appends to list', async () => {
    categoryApi.list.mockResolvedValue({ data: [] })
    categoryApi.create.mockResolvedValue({ data: { id: 5, user_id: 1, name: '新分类', parent_id: null } })
    const s = useCategoryStore()
    await s.fetch()
    await s.create({ name: '新分类', icon: '🆕', parent_id: null })
    expect(s.categories).toHaveLength(1)
    expect(s.categories[0].name).toBe('新分类')
  })

  it('remove filters out the deleted category', async () => {
    categoryApi.list.mockResolvedValue({
      data: [
        { id: 1, user_id: 1, name: 'A', parent_id: null },
        { id: 2, user_id: 1, name: 'B', parent_id: null },
      ],
    })
    categoryApi.remove.mockResolvedValue({})
    const s = useCategoryStore()
    await s.fetch()
    await s.remove(1)
    expect(s.categories).toHaveLength(1)
    expect(s.categories[0].id).toBe(2)
  })

  it('ensureLoaded fetches only once', async () => {
    categoryApi.list.mockResolvedValue({ data: [{ id: 1, user_id: null, name: 'X', parent_id: null }] })
    const s = useCategoryStore()
    await s.ensureLoaded()
    await s.ensureLoaded()
    expect(categoryApi.list).toHaveBeenCalledTimes(1)
  })
})