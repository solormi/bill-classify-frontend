import { describe, it, expect } from 'vitest'
import { labelOf, isValidCategory, CATEGORIES } from '../src/constants/category'

describe('category constants', () => {
  it('has 8 entries', () => {
    expect(CATEGORIES).toHaveLength(8)
  })
  it('maps known values to Chinese labels', () => {
    expect(labelOf('dining')).toBe('餐饮')
    expect(labelOf('transport')).toBe('交通')
    expect(labelOf('other')).toBe('其他')
  })
  it('isValidCategory filters unknowns', () => {
    expect(isValidCategory('dining')).toBe(true)
    expect(isValidCategory('xxx')).toBe(false)
  })
})