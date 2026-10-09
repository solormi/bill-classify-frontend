<script setup>
// BillCreateView — entry point for the "记一笔" flow. Defers form
// behavior to BillForm (create mode) and pushes to the detail page
// after a successful create.
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
  <main class="create-view">
    <h1>记一笔</h1>
    <BillForm mode="create" @submit="onSubmit" />
  </main>
</template>

<style scoped>
.create-view { max-width: 480px; margin: 2rem auto; }
</style>
