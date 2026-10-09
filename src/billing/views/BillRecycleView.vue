<script setup>
// BillRecycleView — archived bills with a per-row restore action.
// The store moves the bill back into `bills` and out of `recycle` on
// success.
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBillStore } from '@/billing/stores/bill'
import { useCategoryStore } from '@/billing/stores/category'

const billStore = useBillStore()
const catStore = useCategoryStore()
const { recycle } = storeToRefs(billStore)

onMounted(() => {
  catStore.ensureLoaded()
  billStore.fetchRecycle({})
})

async function onRestore(b) {
  try {
    await billStore.restore(b.original_id)
  } catch (err) {
    alert(err.response?.data?.error?.message || '恢复失败')
  }
}

function categoryLabel(id) {
  const c = catStore.categories.find((x) => x.id === id)
  return c ? `${c.icon || ''} ${c.name}` : `#${id}`
}
</script>

<template>
  <main class="recycle-view">
    <header>
      <h1>回收站</h1>
      <router-link to="/billing/bills">返回列表</router-link>
    </header>

    <table v-if="recycle.length">
      <thead>
        <tr><th>删除时间</th><th>商户</th><th>分类</th><th>金额</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="b in recycle" :key="b.id">
          <td>{{ b.deleted_at }}</td>
          <td>{{ b.merchant || '—' }}</td>
          <td>{{ categoryLabel(b.category_id) }}</td>
          <td>{{ b.amount.toFixed(2) }}</td>
          <td><button @click="onRestore(b)">恢复</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">回收站为空。</p>
  </main>
</template>

<style scoped>
.recycle-view { max-width: 800px; margin: 2rem auto; }
header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
header h1 { flex: 1; margin: 0; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
.empty { color: #888; padding: 1rem 0; }
</style>
