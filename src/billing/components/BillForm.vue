<script setup>
// BillForm — shared by /billing/bills/new (create) and /billing/bills/:id/edit.
// Live-preview auto-classification with 300ms debounce. Manually overriding
// the auto-suggested category opens SaveRuleDialog so the user can persist
// the override as a new rule.
import { ref, computed, watch, onMounted } from 'vue'
import AmountInput from './AmountInput.vue'
import DatePicker from './DatePicker.vue'
import CategorySelect from './CategorySelect.vue'
import SaveRuleDialog from './SaveRuleDialog.vue'
import { useCategoryStore } from '@/billing/stores/category'
import { useRuleStore } from '@/billing/stores/rule'

const props = defineProps({
  mode: { type: String, default: 'create' },
  initial: { type: Object, default: null },
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
const autoCategoryId = ref(null)
const autoMatched = ref(false)

const dialogOpen = ref(false)
const dialogPayload = ref(null)

const canSubmit = computed(() => {
  return amount.value !== '' && Number(amount.value) > 0 && billDate.value && categoryId.value
})

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
    if (!categoryId.value || categoryId.value === autoCategoryId.value) {
      categoryId.value = result.category_id
    }
  } catch { /* preview is best-effort */ }
}
watch([merchant, note, amount], () => {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(runPreview, 300)
})

function onCategoryChange(newVal) {
  if (
    autoMatched.value &&
    autoCategoryId.value &&
    newVal !== autoCategoryId.value &&
    merchant.value
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
    <div class="field">
      <label>金额</label>
      <AmountInput v-model="amount" />
    </div>

    <div class="field">
      <label>商户</label>
      <input v-model="merchant" type="text" maxlength="100" placeholder="星巴克" />
    </div>

    <div class="field">
      <label>备注</label>
      <textarea v-model="note" rows="2" maxlength="500" placeholder="(可选)"></textarea>
    </div>

    <div class="field">
      <label>日期</label>
      <DatePicker v-model="billDate" />
    </div>

    <div class="field">
      <label>分类</label>
      <CategorySelect :value="categoryId" @update:value="onCategoryChange" />
      <span v-if="autoMatched" class="auto-hint">自动识别,可手动调整</span>
    </div>

    <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="!canSubmit">
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
.bill-form { display: flex; flex-direction: column; gap: var(--space-4); }
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field label { font-size: var(--text-sm); color: var(--color-text-soft); font-weight: 500; }
</style>