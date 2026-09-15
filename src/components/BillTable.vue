<template>
  <table class="bill-table">
    <thead>
      <tr>
        <th>日期</th><th>金额</th><th>商户</th><th>描述</th><th>类别</th><th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="b in bills" :key="b.id">
        <td>{{ b.tx_date }}</td>
        <td>{{ Number(b.amount).toFixed(2) }}</td>
        <td>{{ b.merchant }}</td>
        <td class="muted">{{ b.raw_description }}</td>
        <td>
          <CategorySelect
            :modelValue="b.category"
            @change="(v) => $emit('changeCategory', b, v)"
          />
        </td>
        <td class="actions">
          <router-link :to="`/bills/${b.id}`">详情</router-link>
          <button @click="$emit('remove', b)">删除</button>
        </td>
      </tr>
      <tr v-if="!bills.length">
        <td colspan="6" class="muted">暂无数据</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import CategorySelect from './CategorySelect.vue'

defineProps({ bills: { type: Array, required: true } })
defineEmits(['changeCategory', 'remove'])
</script>

<style scoped>
.bill-table {
  border-collapse: collapse;
  width: 100%;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border-radius: var(--r-md);
  overflow: hidden;
  font-size: var(--fs-md);
}
.bill-table th,
.bill-table td {
  padding: 0 var(--sp-3);
  height: var(--row-h);
  border-bottom: 1px solid var(--c-border);
  text-align: left;
  color: var(--c-text);
}
.bill-table th {
  background: var(--c-surface);
  font-weight: 600;
}
.bill-table tbody tr {
  transition: background 120ms ease;
}
.bill-table tbody tr:hover {
  background: var(--c-surface);
  box-shadow: inset 0 -1px 0 var(--c-accent);
}
.bill-table tbody tr:last-child td {
  border-bottom: none;
}
.bill-table .muted {
  color: var(--c-muted);
}
.bill-table .actions {
  display: flex;
  gap: var(--sp-2);
  align-items: center;
}
.bill-table .actions a {
  color: var(--c-accent);
  text-decoration: none;
  font-size: var(--fs-sm);
}
.bill-table .actions button {
  padding: 0 var(--sp-2);
  height: 24px;
  font-size: var(--fs-sm);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-error);
}
.bill-table .actions button:hover {
  border-color: var(--c-error);
}
</style>