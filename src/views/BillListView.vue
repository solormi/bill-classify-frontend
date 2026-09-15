<template>
  <div class="list-view">
    <BillFilterBar v-model="filter" @apply="onApply" />
    <BillSortBar v-model="sort" @apply="onApply" />
    <p v-if="store.loading" class="muted">加载中…</p>
    <p v-if="store.error" class="error">{{ store.error }}</p>
    <BillTable
      :bills="store.bills"
      @changeCategory="onChangeCategory"
      @remove="onRemove"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBillStore } from '../stores/bill'
import BillFilterBar from '../components/BillFilterBar.vue'
import BillSortBar from '../components/BillSortBar.vue'
import BillTable from '../components/BillTable.vue'

const store = useBillStore()
const filter = ref({ ...store.filter })
const sort = ref({ ...store.sort })

onMounted(() => store.fetchBills())

function onApply() {
  store.setFilter(filter.value)
  store.setSort(sort.value)
  store.fetchBills()
}

async function onChangeCategory(bill, category) {
  try {
    await store.changeCategory(bill.id, category)
  } catch (e) {
    alert('分类保存失败: ' + e.message)
  }
}

async function onRemove(bill) {
  if (!confirm(`确认删除「${bill.merchant} ${bill.amount}」?`)) return
  await store.remove(bill.id)
}
</script>