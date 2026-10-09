<script setup>
// BillDetailView — read-only detail with edit / delete actions. Uses
// billApi.get for the initial fetch (no need to pull the whole list
// when deep-linked from a notification or share link).
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillStore } from '@/billing/stores/bill'
import { useCategoryStore } from '@/billing/stores/category'
import { billApi } from '@/billing/api/bill'

const route = useRoute()
const router = useRouter()
const billStore = useBillStore()
const catStore = useCategoryStore()

const bill = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await billApi.get(route.params.id)
    bill.value = data
    catStore.ensureLoaded()
  } catch (err) {
    error.value = err.response?.data?.error?.message || '加载失败'
  }
})

function categoryLabel(id) {
  const c = catStore.categories.find((x) => x.id === id)
  return c ? `${c.icon || ''} ${c.name}` : `#${id}`
}

async function onDelete() {
  if (!confirm('确定删除?')) return
  try {
    await billStore.remove(bill.value.id)
    router.push('/billing/bills')
  } catch (err) {
    alert(err.response?.data?.error?.message || '删除失败')
  }
}
</script>

<template>
  <main class="detail-view">
    <p v-if="error" class="error">{{ error }}</p>
    <div v-if="bill">
      <h1>账单详情</h1>
      <dl>
        <dt>金额</dt><dd>{{ bill.amount.toFixed(2) }}</dd>
        <dt>商户</dt><dd>{{ bill.merchant || '—' }}</dd>
        <dt>备注</dt><dd>{{ bill.note || '—' }}</dd>
        <dt>日期</dt><dd>{{ bill.bill_date }}</dd>
        <dt>分类</dt><dd>{{ categoryLabel(bill.category_id) }}</dd>
        <dt>来源</dt><dd>{{ bill.source }}</dd>
        <dt>创建时间</dt><dd>{{ bill.created_at }}</dd>
      </dl>
      <div class="actions">
        <router-link :to="`/billing/bills/${bill.id}/edit`">编辑</router-link>
        <button @click="onDelete">删除</button>
        <router-link to="/billing/bills">返回列表</router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.detail-view { max-width: 600px; margin: 2rem auto; }
dl { display: grid; grid-template-columns: 100px 1fr; gap: 0.5rem; }
dt { color: #888; }
.actions { margin-top: 1rem; display: flex; gap: 1rem; }
.error { color: #d33; }
</style>
