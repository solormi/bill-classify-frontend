<script setup>
import { useRouter } from 'vue-router'
import BillForm from '@/billing/components/BillForm.vue'
import { useBillStore } from '@/billing/stores/bill'

const router = useRouter()
const billStore = useBillStore()

async function onSubmit(payload) {
  try {
    const bill = await billStore.create(payload)
    router.push(`/billing/bills/${bill.id}`)
  } catch (err) {
    alert(err.response?.data?.error?.message || '保存失败')
  }
}
</script>

<template>
  <main class="page page-narrow">
    <div class="page-header">
      <div>
        <h1>记一笔</h1>
        <p>输入金额、商户和分类。系统会按你设定的规则自动归类。</p>
      </div>
    </div>

    <div class="card">
      <BillForm mode="create" @submit="onSubmit" />
    </div>
  </main>
</template>