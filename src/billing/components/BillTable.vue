<script setup>
// BillTable — read-only list of bills with category labels resolved against
// the category store. Parent owns the bills array and removal / edit
// decisions; this component only renders and forwards events.
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/billing/stores/category'

const props = defineProps({
  bills: { type: Array, default: () => [] },
})
const emit = defineEmits(['edit', 'remove'])

const catStore = useCategoryStore()
const { categories } = storeToRefs(catStore)

function categoryLabel(id) {
  const c = categories.value.find((x) => x.id === id)
  return c ? `${c.icon || ''} ${c.name}` : `#${id}`
}

const rows = computed(() => props.bills.map((b) => ({
  ...b,
  categoryLabel: categoryLabel(b.category_id),
})))
</script>

<template>
  <table class="bill-table">
    <thead>
      <tr>
        <th>日期</th><th>商户</th><th>分类</th><th class="amount-col">金额</th><th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="b in rows" :key="b.id">
        <td>{{ b.bill_date }}</td>
        <td>{{ b.merchant || '—' }}</td>
        <td>{{ b.categoryLabel }}</td>
        <td class="amount-col">{{ b.amount.toFixed(2) }}</td>
        <td>
          <router-link :to="`/billing/bills/${b.id}`">详情</router-link>
          <button @click="emit('edit', b)">编辑</button>
          <button @click="emit('remove', b)">删除</button>
        </td>
      </tr>
      <tr v-if="!rows.length">
        <td colspan="5" class="empty">暂无账单</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.bill-table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
.amount-col { text-align: right; }
.empty { color: #888; text-align: center; padding: 1rem; }
button { margin-left: 0.25rem; }
</style>
