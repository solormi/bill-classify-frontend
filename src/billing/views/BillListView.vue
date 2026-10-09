<script setup>
// BillListView — paginated list with quick-delete (soft delete on the
// backend) and links to create / recycle. Pagination is 1-based.
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBillStore } from '@/billing/stores/bill'
import BillTable from '@/billing/components/BillTable.vue'

const billStore = useBillStore()
const { bills, total, loading } = storeToRefs(billStore)

const page = ref(1)
const pageSize = 20

async function load() {
  await billStore.fetch({ page: page.value, pageSize })
}
onMounted(load)

async function onRemove(b) {
  if (!confirm(`删除账单「${b.merchant || b.bill_date}」?`)) return
  try {
    await billStore.remove(b.id)
  } catch (err) {
    alert(err.response?.data?.error?.message || '删除失败')
  }
}

const totalPages = () => Math.max(1, Math.ceil(total.value / pageSize))
</script>

<template>
  <main class="list-view">
    <header>
      <h1>账单</h1>
      <div class="actions">
        <router-link to="/billing/bills/new">+ 记一笔</router-link>
        <router-link to="/billing/bills/recycle">回收站</router-link>
      </div>
    </header>

    <BillTable :bills="bills" @remove="onRemove" @edit="(b) => $router.push(`/billing/bills/${b.id}/edit`)" />

    <footer class="pagination">
      <button :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>第 {{ page }} / {{ totalPages() }} 页 · 共 {{ total }} 条</span>
      <button :disabled="page >= totalPages()" @click="page++; load()">下一页</button>
    </footer>
    <p v-if="loading">加载中...</p>
  </main>
</template>

<style scoped>
.list-view { max-width: 900px; margin: 2rem auto; }
header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
header h1 { flex: 1; margin: 0; }
.actions a { margin-left: 0.5rem; padding: 0.4rem 0.75rem; border: 1px solid #06c; border-radius: 4px; color: #06c; text-decoration: none; }
.pagination { display: flex; gap: 0.5rem; justify-content: center; align-items: center; margin-top: 1rem; }
</style>
