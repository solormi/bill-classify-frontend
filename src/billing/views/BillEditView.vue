<script setup>
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
  <main class="page page-narrow">
    <p v-if="error" class="error" style="background: var(--color-danger-soft); color: var(--color-danger); padding: var(--space-3); border-radius: var(--radius);">{{ error }}</p>

    <div v-if="bill">
      <div class="page-header">
        <div>
          <h1>编辑账单</h1>
          <p>修改后保存。改了分类会问要不要存为规则。</p>
        </div>
      </div>

      <div class="card">
        <BillForm mode="edit" :initial="bill" @submit="onSubmit" />
      </div>
    </div>
  </main>
</template>