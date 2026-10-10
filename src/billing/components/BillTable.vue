<script setup>
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
  <table class="table">
    <thead>
      <tr>
        <th style="width: 110px;">日期</th>
        <th>商户</th>
        <th>分类</th>
        <th class="num" style="width: 120px;">金额</th>
        <th style="width: 180px;"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="b in rows" :key="b.id">
        <td>{{ b.bill_date }}</td>
        <td>{{ b.merchant || '—' }}</td>
        <td><span class="badge badge-brand">{{ b.categoryLabel }}</span></td>
        <td class="num" style="font-weight: 600;">{{ Number(b.amount).toFixed(2) }}</td>
        <td>
          <router-link :to="`/billing/bills/${b.id}`" class="btn btn-sm btn-ghost">详情</router-link>
          <button class="btn btn-sm btn-ghost" @click="emit('edit', b)">编辑</button>
          <button class="btn btn-sm btn-danger" @click="emit('remove', b)">删除</button>
        </td>
      </tr>
      <tr v-if="!rows.length" class="empty-row">
        <td colspan="5">暂无账单</td>
      </tr>
    </tbody>
  </table>
</template>