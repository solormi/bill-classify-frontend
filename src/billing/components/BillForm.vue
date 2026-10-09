<script setup>
// BillForm — shared single-bill entry/edit form. Lives in change 4,
// reuses change 3's CategorySelect and ruleStore.preview to surface
// auto-classification hints live as the user types.
//
// SaveRuleDialog is ONLY opened when the user manually picks a category
// that differs from the auto-suggested one (so the very first auto-fill
// does NOT trigger the dialog).
import { ref, computed, watch, onMounted } from 'vue'
import AmountInput from './AmountInput.vue'
import DatePicker from './DatePicker.vue'
import CategorySelect from './CategorySelect.vue'
import SaveRuleDialog from './SaveRuleDialog.vue'
import { useCategoryStore } from '@/billing/stores/category'
import { useRuleStore } from '@/billing/stores/rule'

const props = defineProps({
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initial: { type: Object, default: null },  // bill for edit mode
})
const emit = defineEmits(['submit'])

const catStore = useCategoryStore()
const ruleStore = useRuleStore()
onMounted(() => catStore.ensureLoaded())

const amount = ref(props.initial?.amount ?? '')
const merchant = ref(props.initial?.merchant ?? '')
const note = ref(props.initial?.note ?? '')
const billDate = ref(props.initial?.bill_date ?? new Date().toISOString().slice(0, 10))
const categoryId = ref(props.initial?.category_id ?? null)
const autoCategoryId = ref(null) // 从 preview 拿到的分类 id
const autoMatched = ref(false)

// SaveRuleDialog state
const dialogOpen = ref(false)
const dialogPayload = ref(null)

const canSubmit = computed(() => {
  return amount.value !== '' && Number(amount.value) > 0 && billDate.value && categoryId.value
})

// Debounced preview call when merchant/note/amount change
let previewTimer = null
async function runPreview() {
  if (!merchant.value && !note.value) {
    autoCategoryId.value = null
    autoMatched.value = false
    return
  }
  try {
    const result = await ruleStore.preview({
      merchant: merchant.value,
      note: note.value,
      amount: Number(amount.value) || 0,
    })
    autoCategoryId.value = result.category_id
    autoMatched.value = result.category_id != null
    // Auto-fill CategorySelect only if user hasn't manually chosen yet
    if (!categoryId.value || categoryId.value === autoCategoryId.value) {
      categoryId.value = result.category_id
    }
  } catch {
    // preview is best-effort; ignore errors
  }
}
watch([merchant, note, amount], () => {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(runPreview, 300) // debounce 300ms
})

function onCategoryChange(newVal) {
  // If user manually picked a different category from auto-suggested, open dialog.
  if (
    autoMatched.value &&
    autoCategoryId.value &&
    newVal !== autoCategoryId.value &&
    merchant.value  // only meaningful when merchant is filled
  ) {
    dialogPayload.value = {
      merchant: merchant.value,
      oldCategoryId: autoCategoryId.value,
      newCategoryId: newVal,
    }
    dialogOpen.value = true
  }
  categoryId.value = newVal
}

async function onDialogSave() {
  try {
    await ruleStore.create({
      match_type: 'merchant_exact',
      match_value: dialogPayload.value.merchant,
      category_id: dialogPayload.value.newCategoryId,
      priority: 0,
    })
  } catch (err) {
    alert(err.response?.data?.error?.message || '规则保存失败')
  } finally {
    dialogOpen.value = false
  }
}

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', {
    amount: Number(amount.value),
    category_id: categoryId.value,
    merchant: merchant.value,
    note: note.value,
    bill_date: billDate.value,
    source: 'manual',
  })
}
</script>

<template>
  <form class="bill-form" @submit.prevent="onSubmit">
    <label>
      金额
      <AmountInput v-model="amount" />
    </label>

    <label>
      商户
      <input v-model="merchant" type="text" maxlength="100" placeholder="星巴克" />
    </label>

    <label>
      备注
      <textarea v-model="note" rows="2" maxlength="500" />
    </label>

    <label>
      日期
      <DatePicker v-model="billDate" />
    </label>

    <label>
      分类
      <CategorySelect
        :value="categoryId"
        @update:value="onCategoryChange"
      />
      <span v-if="autoMatched" class="auto-hint">
        ✓ 自动识别(可手动调整)
      </span>
    </label>

    <button type="submit" :disabled="!canSubmit">
      {{ mode === 'edit' ? '保存' : '保存账单' }}
    </button>

    <SaveRuleDialog
      v-if="dialogOpen"
      :merchant="dialogPayload.merchant"
      :new-category-id="dialogPayload.newCategoryId"
      @cancel="dialogOpen = false"
      @save="onDialogSave"
    />
  </form>
</template>

<style scoped>
.bill-form { display: flex; flex-direction: column; gap: 1rem; max-width: 480px; }
.bill-form label { display: flex; flex-direction: column; gap: 0.25rem; }
.bill-form input, .bill-form textarea, .bill-form select { padding: 0.5rem; }
.bill-form button { padding: 0.75rem; font-weight: 600; }
.auto-hint { color: #888; font-size: 0.85rem; margin-top: 0.25rem; }
</style>
