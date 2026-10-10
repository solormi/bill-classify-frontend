<script setup>
// RuleFormDialog — modal for creating / editing a classification rule.
// The form fields adapt to the selected match_type:
//   - merchant_exact: single merchant string
//   - note_keyword  : single keyword string
//   - amount_range  : min + max + merchant keyword
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/billing/stores/category'

const props = defineProps({
  open: { type: Boolean, default: false },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['submit', 'cancel'])

const catStore = useCategoryStore()
const { categories } = storeToRefs(catStore)
catStore.ensureLoaded()

const MATCH_TYPES = [
  { value: 'merchant_exact', label: '商户精确匹配' },
  { value: 'note_keyword', label: '备注关键字' },
  { value: 'amount_range', label: '金额区间 + 商户关键字' },
]

const matchType = ref('merchant_exact')
const matchValue = ref('')
const categoryId = ref(null)
const priority = ref(0)
const enabled = ref(true)

const amountMin = ref('')
const amountMax = ref('')
const amountKeyword = ref('')

watch(
  () => [props.open, props.initial],
  () => {
    if (!props.open) return
    if (props.initial) {
      matchType.value = props.initial.match_type
      categoryId.value = props.initial.category_id
      priority.value = props.initial.priority
      enabled.value = props.initial.enabled
      if (props.initial.match_type === 'amount_range') {
        const [min, max, kw] = (props.initial.match_value || '').split(':')
        amountMin.value = min || ''
        amountMax.value = max || ''
        amountKeyword.value = kw || ''
        matchValue.value = props.initial.match_value
      } else {
        matchValue.value = props.initial.match_value || ''
      }
    } else {
      matchType.value = 'merchant_exact'
      matchValue.value = ''
      categoryId.value = null
      priority.value = 0
      enabled.value = true
      amountMin.value = ''
      amountMax.value = ''
      amountKeyword.value = ''
    }
  },
  { immediate: true },
)

function syncAmountRange() {
  if (matchType.value === 'amount_range') {
    matchValue.value = `${amountMin.value}:${amountMax.value}:${amountKeyword.value}`
  }
}

watch(matchType, () => {
  matchValue.value = ''
  amountMin.value = ''
  amountMax.value = ''
  amountKeyword.value = ''
})

const canSubmit = computed(() => {
  if (!categoryId.value) return false
  if (matchType.value === 'amount_range') {
    if (!amountMin.value || !amountMax.value) return false
    if (Number(amountMin.value) > Number(amountMax.value)) return false
  } else {
    if (!matchValue.value.trim()) return false
  }
  return true
})

function onSubmit() {
  if (!canSubmit.value) return
  const payload = {
    match_type: matchType.value,
    match_value: matchType.value === 'amount_range'
      ? `${amountMin.value}:${amountMax.value}:${amountKeyword.value}`
      : matchValue.value.trim(),
    category_id: categoryId.value,
    priority: priority.value,
    enabled: enabled.value,
  }
  emit('submit', payload)
}
</script>

<template>
  <div v-if="open" class="dialog-backdrop" @click.self="emit('cancel')">
    <div class="dialog" style="max-width: 480px;">
      <h3>{{ initial ? '编辑规则' : '新建规则' }}</h3>

      <div class="field">
        <label>类型</label>
        <select v-model="matchType">
          <option v-for="t in MATCH_TYPES" :key="t.value" :value="t.value">
            {{ t.label }}
          </option>
        </select>
      </div>

      <div v-if="matchType === 'merchant_exact'" class="field">
        <label>商户(精确值)</label>
        <input v-model="matchValue" type="text" placeholder="例如:星巴克" />
      </div>

      <div v-else-if="matchType === 'note_keyword'" class="field">
        <label>备注关键字</label>
        <input v-model="matchValue" type="text" placeholder="例如:医院" />
      </div>

      <div v-else-if="matchType === 'amount_range'" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div class="field">
          <label>最小金额</label>
          <input v-model="amountMin" type="number" step="0.01" @input="syncAmountRange" />
        </div>
        <div class="field">
          <label>最大金额</label>
          <input v-model="amountMax" type="number" step="0.01" @input="syncAmountRange" />
        </div>
        <div class="field" style="grid-column: 1 / -1;">
          <label>商户关键字(可选)</label>
          <input v-model="amountKeyword" type="text" placeholder="例如:医院" @input="syncAmountRange" />
          <p class="hint">存储格式:<code>min:max:keyword</code></p>
        </div>
      </div>

      <div class="field">
        <label>目标分类</label>
        <select v-model="categoryId">
          <option :value="null" disabled>选择分类</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.icon || '' }} {{ c.name }}{{ c.user_id == null ? ' (系统)' : '' }}
          </option>
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div class="field">
          <label>优先级(数字越大越优先)</label>
          <input v-model.number="priority" type="number" />
        </div>
        <div class="field" style="display: flex; align-items: end; padding-bottom: var(--space-2);">
          <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
            <input v-model="enabled" type="checkbox" />
            启用此规则
          </label>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-ghost" @click="emit('cancel')">取消</button>
        <button class="btn btn-primary" :disabled="!canSubmit" @click="onSubmit">
          {{ initial ? '保存' : '创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field label { font-size: var(--text-sm); color: var(--color-text-soft); font-weight: 500; }
</style>