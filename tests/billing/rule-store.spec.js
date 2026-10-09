// tests/billing/rule-store.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/billing/api/rule', () => ({
  ruleApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    preview: vi.fn(),
  },
}))

import { useRuleStore } from '@/billing/stores/rule'
import { ruleApi } from '@/billing/api/rule'

describe('rule store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetch populates rules', async () => {
    ruleApi.list.mockResolvedValue({
      data: [
        { id: 1, match_type: 'merchant_exact', match_value: 'X', category_id: 1, priority: 10, enabled: true },
      ],
    })
    const s = useRuleStore()
    await s.fetch()
    expect(s.rules).toHaveLength(1)
  })

  it('enabled getter filters enabled=true', async () => {
    ruleApi.list.mockResolvedValue({
      data: [
        { id: 1, enabled: true },
        { id: 2, enabled: false },
      ],
    })
    const s = useRuleStore()
    await s.fetch()
    expect(s.enabled).toHaveLength(1)
    expect(s.enabled[0].id).toBe(1)
  })

  it('preview returns {category_id, rule_id} shape', async () => {
    ruleApi.preview.mockResolvedValue({ data: { category_id: 1, rule_id: 5 } })
    const s = useRuleStore()
    const r = await s.preview({ merchant: 'X', note: '', amount: 10 })
    expect(r).toEqual({ category_id: 1, rule_id: 5 })
  })

  it('create appends; update replaces; remove filters', async () => {
    ruleApi.list.mockResolvedValue({ data: [] })
    ruleApi.create.mockResolvedValue({ data: { id: 1, name: 'A' } })
    ruleApi.update.mockResolvedValue({ data: { id: 1, name: 'B' } })
    ruleApi.remove.mockResolvedValue({})
    const s = useRuleStore()
    await s.fetch()
    await s.create({ name: 'A' })
    expect(s.rules).toHaveLength(1)
    await s.update(1, { name: 'B' })
    expect(s.rules[0].name).toBe('B')
    await s.remove(1)
    expect(s.rules).toHaveLength(0)
  })
})