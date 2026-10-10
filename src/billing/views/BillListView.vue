<script setup>
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
  <main class="page page-wide">
    <div class="page-header">
      <div>
        <h1>账单</h1>
        <p>共 {{ total }} 条记录</p>
      </div>
      <div class="actions">
        <router-link to="/billing/bills/new" class="btn btn-primary">+ 记一笔</router-link>
        <router-link to="/billing/bills/recycle" class="btn btn-ghost">回收站</router-link>
      </div>
    </div>

    <BillTable :bills="bills" @remove="onRemove" @edit="(b) => $router.push(`/billing/bills/${b.id}/edit`)" />

    <p v-if="!loading && !bills.length" class="card empty">
      <h3>还没有账单</h3>
      <p>点右上角「记一笔」开始你的第一笔。</p>
    </p>

    <div class="pagination" v-if="bills.length">
      <button class="btn btn-sm btn-ghost" :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>第 {{ page }} / {{ totalPages() }} 页 · 共 {{ total }} 条</span>
      <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages()" @click="page++; load()">下一页</button>
    </div>
  </main>
</template>