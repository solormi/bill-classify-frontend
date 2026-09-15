export const CATEGORIES = [
  { value: 'dining',        label: '餐饮' },
  { value: 'transport',     label: '交通' },
  { value: 'shopping',      label: '购物' },
  { value: 'entertainment', label: '娱乐' },
  { value: 'housing',       label: '居住' },
  { value: 'medical',       label: '医疗' },
  { value: 'education',     label: '教育' },
  { value: 'other',         label: '其他' }
]

export const CATEGORY_VALUES = CATEGORIES.map(c => c.value)

export function labelOf(category) {
  const c = CATEGORIES.find(c => c.value === category)
  return c ? c.label : category
}

export function isValidCategory(v) {
  return CATEGORY_VALUES.includes(v)
}