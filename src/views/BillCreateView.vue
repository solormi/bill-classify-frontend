<template>
  <form @submit.prevent="onSubmit" class="form">
    <label>
      日期
      <input type="date" v-model="form.tx_date" required />
    </label>
    <label>
      金额
      <input type="number" step="0.01" min="0.01" v-model.number="form.amount" required />
    </label>
    <label>
      商户
      <input type="text" v-model="form.merchant" maxlength="128" required />
    </label>
    <label>
      描述
      <input type="text" v-model="form.raw_description" maxlength="512" />
    </label>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit" :disabled="submitting">{{ submitting ? '提交中…' : '创建' }}</button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBillStore } from '../stores/bill'

const router = useRouter()
const store = useBillStore()

const form = reactive({
  tx_date: new Date().toISOString().slice(0, 10),
  amount: 0,
  merchant: '',
  raw_description: ''
})
const submitting = ref(false)
const error = ref(null)

async function onSubmit() {
  error.value = null
  if (form.amount <= 0) { error.value = '金额必须大于 0'; return }
  if (!form.merchant.trim()) { error.value = '商户不能为空'; return }
  submitting.value = true
  try {
    const b = await store.create({ ...form })
    router.push(`/bills/${b.id}`)
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 12px; max-width: 480px; }
.form label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
</style>