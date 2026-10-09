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
  // Existing rule (for edit) or null (for create)
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

// amount_range fields (parsed into matchValue on submit)
const amountMin = ref('')
const amountMax = ref('')
const amountKeyword = ref('')

// Reset state whenever the dialog opens or initial changes.
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

// For amount_range, sync the structured fields back into matchValue.
function syncAmountRange() {
  if (matchType.value === 'amount_range') {
    matchValue.value = `${amountMin.value}:${amountMax.value}:${amountKeyword.value}`
  }
}

// When user switches mode, drop structured fields so they don't carry
// over into the next submit.
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
    <div class="dialog">
      <h2>{{ initial ? '编辑规则' : '新建规则' }}</h2>

      <label>
        类型
        <select v-model="matchType">
          <option v-for="t in MATCH_TYPES" :key="t.value" :value="t.value">
            {{ t.label }}
          </option>
        </select>
      </label>

      <label v-if="matchType === 'merchant_exact'">
        商户(精确值)
        <input v-model="matchValue" type="text" placeholder="例如:星巴克" />
      </label>

      <label v-else-if="matchType === 'note_keyword'">
        备注关键字
        <input v-model="matchValue" type="text" placeholder="例如:医院" />
      </label>

      <div v-else-if="matchType === 'amount_range'" class="amount-range">
        <label>
          最小金额
          <input v-model="amountMin" type="number" step="0.01" @input="syncAmountRange" />
        </label>
        <label>
          最大金额
          <input v-model="amountMax" type="number" step="0.01" @input="syncAmountRange" />
        </label>
        <label>
          商户关键字(可选)
          <input v-model="amountKeyword" type="text" placeholder="例如:医院" @input="syncAmountRange" />
        </label>
        <p class="hint">存储格式:<code>min:max:keyword</code></p>
      </div>

      <label>
        目标分类
        <select v-model="categoryId">
          <option :value="null" disabled>选择分类</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.icon || '' }} {{ c.name }}{{ c.user_id == null ? ' (系统)' : '' }}
          </option>
        </select>
      </label>

      <label>
        优先级(数字越大越优先)
        <input v-model.number="priority" type="number" />
      </label>

      <label class="checkbox">
        <input v-model="enabled" type="checkbox" />
        启用
      </label>

      <div class="actions">
        <button @click="emit('cancel')">取消</button>
        <button :disabled="!canSubmit" @click="onSubmit">
          {{ initial ? '保存' : '创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.dialog {
  background: white; padding: 1.5rem; border-radius: 8px;
  width: 420px; max-width: 90vw;
}
.dialog label { display: block; margin: 0.5rem 0; }
.dialog input, .dialog select { width: 100%; padding: 0.4rem; margin-top: 0.25rem; box-sizing: border-box; }
.dialog .checkbox { display: flex; align-items: center; gap: 0.5rem; }
.dialog .actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
.amount-range label { margin: 0.25rem 0; }
.hint { color: #888; font-size: 0.8rem; margin: 0.25rem 0 0; }
code { background: #f4f4f4; padding: 0 0.25rem; }
</style>