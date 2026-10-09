<script setup>
// BillEditView — pre-fills BillForm in edit mode with the existing
// bill. Update via the store, then bounce back to the detail page.
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BillForm from '@/billing/components/BillForm.vue'
import { useBillStore } from '@/billing/stores/bill'
import { billApi } from '@/billing/api/bill'

const route = useRoute()
const router = useRouter()
const billStore = useBillStore()

const bill = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await billApi.get(route.params.id)
    bill.value = data
  } catch (err) {
    error.value = err.response?.data?.error?.message || '加载失败'
  }
})

async function onSubmit(payload) {
  try {
    await billStore.update(route.params.id, payload)
    router.push(`/billing/bills/${route.params.id}`)
  } catch (err) {
    alert(err.response?.data?.error?.message || '保存失败')
  }
}
</script>

<template>
  <main class="edit-view">
    <p v-if="error" class="error">{{ error }}</p>
    <BillForm v-if="bill" mode="edit" :initial="bill" @submit="onSubmit" />
  </main>
</template>

<style scoped>
.edit-view { max-width: 480px; margin: 2rem auto; }
.error { color: #d33; }
</style>
